import { FeedbackBatchSchema, type FeedbackItemContent } from './contract';
import { splitIntoBatches } from './queue';

export type SubmitFailure =
  | { kind: 'unauthorized' }
  | { kind: 'offline' }
  | { kind: 'rate-limited'; retryAfterSeconds: number | null }
  | { kind: 'rejected'; status: number; message: string | null }
  | { kind: 'invalid'; message: string };

export interface SubmitResult {
  sentCount: number;
  failure: SubmitFailure | null;
}

export interface SubmitInput {
  endpoint: string;
  token: string;
  items: readonly FeedbackItemContent[];
  fetchImpl?: typeof fetch;
  isOnline?: () => boolean;
}

async function readMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === 'string' ? body.message : null;
  } catch {
    return null;
  }
}

async function failureOf(response: Response): Promise<SubmitFailure> {
  if (response.status === 401 || response.status === 403)
    return { kind: 'unauthorized' };
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('Retry-After'));
    return {
      kind: 'rate-limited',
      retryAfterSeconds:
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
    };
  }
  return {
    kind: 'rejected',
    status: response.status,
    message: await readMessage(response),
  };
}

export async function submitFeedback({
  endpoint,
  token,
  items,
  fetchImpl = fetch,
  isOnline = () =>
    typeof navigator === 'undefined' || navigator.onLine !== false,
}: SubmitInput): Promise<SubmitResult> {
  const url = `${endpoint.replace(/\/+$/, '')}/api/feedback-submit`;
  let sentCount = 0;
  for (const batch of splitIntoBatches(token, items)) {
    const parsed = FeedbackBatchSchema.safeParse(batch);
    if (!parsed.success) {
      return {
        sentCount,
        failure: {
          kind: 'invalid',
          message: parsed.error.issues[0]?.message ?? '',
        },
      };
    }
    let response: Response;
    try {
      // `text/plain` and no custom headers keep this a "simple" request with no preflight;
      // `credentials: "omit"` because the endpoint sets no cookies and the batch must carry none.
      response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(parsed.data),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
    } catch {
      // A 401/403 comes back without CORS headers, so the browser turns it into a TypeError — a
      // rejected request looks exactly like a dropped connection here.
      return {
        sentCount,
        failure: isOnline() ? { kind: 'unauthorized' } : { kind: 'offline' },
      };
    }
    if (!response.ok) return { sentCount, failure: await failureOf(response) };
    sentCount += batch.items.length;
  }
  return { sentCount, failure: null };
}

export type SubmitIntent = 'success' | 'warning' | 'danger';

export interface SubmitMessage {
  intent: SubmitIntent;
  text: string;
}

const NOTES_PLURAL: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: 'uwagę',
  few: 'uwagi',
  many: 'uwag',
};

export function formatNotesCount(count: number): string {
  const rule = new Intl.PluralRules('pl').select(count);
  return `${count} ${NOTES_PLURAL[rule] ?? 'uwagi'}`;
}

function failureText(failure: SubmitFailure): string {
  switch (failure.kind) {
    case 'unauthorized':
      return 'Link do uwag wygasł albo ta strona nie jest uprawniona.';
    case 'offline':
      return 'Brak połączenia z internetem. Uwagi czekają w kolejce.';
    case 'rate-limited':
      return failure.retryAfterSeconds === null
        ? 'Za dużo wysyłek naraz. Spróbuj ponownie za chwilę.'
        : `Za dużo wysyłek naraz. Spróbuj ponownie za ${failure.retryAfterSeconds} s.`;
    case 'rejected':
      return (
        failure.message ?? `Nie udało się wysłać uwag (HTTP ${failure.status}).`
      );
    case 'invalid':
      return `Uwagi nie przeszły sprawdzenia przed wysyłką: ${failure.message}`;
  }
}

export function submitMessage({
  sentCount,
  failure,
}: SubmitResult): SubmitMessage {
  if (failure === null)
    return {
      intent: 'success',
      text: `Wysłano ${formatNotesCount(sentCount)}.`,
    };
  const text = failureText(failure);
  if (sentCount === 0) return { intent: 'danger', text };
  return {
    intent: 'warning',
    text: `Wysłano ${formatNotesCount(sentCount)}, reszta czeka w kolejce. ${text}`,
  };
}
