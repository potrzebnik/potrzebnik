import { describe, expect, it, vi } from 'vitest';

import type { FeedbackItemContent } from './contract';
import { formatNotesCount, submitFeedback, submitMessage } from './submit';

const TOKEN = `fb_${'a'.repeat(43)}`;
const ENDPOINT = 'https://feedback.example.dev/';

function note(text = 'zmień tekst'): FeedbackItemContent {
  return {
    kind: 'text',
    note: text,
    pathname: '/',
    selector: '#x',
    viewport: { width: 1280, height: 800 },
  };
}

function respond(
  status: number,
  body: unknown = {},
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), { status, headers });
}

const networkError = () => {
  throw new TypeError('Failed to fetch');
};

describe('submitFeedback', () => {
  it('sends one batch as a simple request with no custom headers beyond text/plain', async () => {
    const fetchImpl = vi.fn(async () => respond(200, { ok: true }));

    const result = await submitFeedback({
      endpoint: ENDPOINT,
      token: TOKEN,
      items: [note(), note()],
      fetchImpl,
    });

    expect(result).toEqual({ sentCount: 2, failure: null });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://feedback.example.dev/api/feedback-submit');
    expect(init.headers).toEqual({ 'Content-Type': 'text/plain' });
    expect(init.credentials).toBe('omit');
    expect(init.referrerPolicy).toBe('no-referrer');
    expect(JSON.parse(init.body as string)).toEqual({
      token: TOKEN,
      items: [note(), note()],
    });
  });

  it('60 notes go out as two POSTs', async () => {
    const fetchImpl = vi.fn(async () => respond(200, { ok: true }));
    const items = Array.from({ length: 60 }, (_, index) => note(`n${index}`));

    const result = await submitFeedback({
      endpoint: ENDPOINT,
      token: TOKEN,
      items,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.sentCount).toBe(60);
  });

  it('a TypeError from fetch (401/403 without CORS) counts nothing as sent', async () => {
    const result = await submitFeedback({
      endpoint: ENDPOINT,
      token: TOKEN,
      items: [note()],
      fetchImpl: vi.fn(async () => networkError()),
      isOnline: () => true,
    });

    expect(result).toEqual({ sentCount: 0, failure: { kind: 'unauthorized' } });
    expect(submitMessage(result)).toEqual({
      intent: 'danger',
      text: 'Link do uwag wygasł albo ta strona nie jest uprawniona.',
    });
  });

  it('being offline gives its own message', async () => {
    const result = await submitFeedback({
      endpoint: ENDPOINT,
      token: TOKEN,
      items: [note()],
      fetchImpl: vi.fn(async () => networkError()),
      isOnline: () => false,
    });

    expect(result.failure).toEqual({ kind: 'offline' });
  });

  it('when the second batch is rejected only the first counts as sent', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(respond(200, { ok: true }))
      .mockResolvedValueOnce(
        respond(429, { ok: false, message: 'limit' }, { 'Retry-After': '30' }),
      );
    const items = Array.from({ length: 55 }, () => note());

    const result = await submitFeedback({
      endpoint: ENDPOINT,
      token: TOKEN,
      items,
      fetchImpl,
    });

    expect(result).toEqual({
      sentCount: 50,
      failure: { kind: 'rate-limited', retryAfterSeconds: 30 },
    });
    expect(submitMessage(result).intent).toBe('warning');
    expect(submitMessage(result).text).toContain('Spróbuj ponownie za 30 s.');
  });

  it('a 4xx carries the server message, and without one the status is shown', async () => {
    const badRequest = await submitFeedback({
      endpoint: ENDPOINT,
      token: TOKEN,
      items: [note()],
      fetchImpl: vi.fn(async () =>
        respond(400, { ok: false, message: 'Zła partia' }),
      ),
    });
    const serverError = await submitFeedback({
      endpoint: ENDPOINT,
      token: TOKEN,
      items: [note()],
      fetchImpl: vi.fn(async () => new Response('oops', { status: 500 })),
    });

    expect(submitMessage(badRequest).text).toBe('Zła partia');
    expect(submitMessage(serverError).text).toBe(
      'Nie udało się wysłać uwag (HTTP 500).',
    );
  });

  it('a batch that breaks the contract never leaves the browser', async () => {
    const fetchImpl = vi.fn();

    const result = await submitFeedback({
      endpoint: ENDPOINT,
      token: TOKEN,
      items: [note('   ')],
      fetchImpl,
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.failure?.kind).toBe('invalid');
  });
});

describe('formatNotesCount', () => {
  it('declines the noun in Polish', () => {
    expect([1, 2, 5, 12, 22].map(formatNotesCount)).toEqual([
      '1 uwagę',
      '2 uwagi',
      '5 uwag',
      '12 uwag',
      '22 uwagi',
    ]);
    expect(submitMessage({ sentCount: 2, failure: null }).text).toBe(
      'Wysłano 2 uwagi.',
    );
  });
});
