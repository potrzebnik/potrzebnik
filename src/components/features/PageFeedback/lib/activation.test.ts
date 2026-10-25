import { describe, expect, it, vi } from 'vitest';

import {
  resolveActiveToken,
  type StorageLike,
  takeActivationParam,
  TOKEN_PATTERN,
  TOKEN_STORAGE_KEY,
} from './activation';
import { FEEDBACK_TOKEN_PATTERN } from './contract';

const TOKEN = `fb_${'A1_-'.repeat(10)}abc`;

function memoryStorage(
  initial: Record<string, string> = {},
): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

function throwingStorage(): StorageLike {
  const fail = () => {
    throw new Error('SecurityError');
  };
  return { getItem: fail, setItem: fail, removeItem: fail };
}

describe('TOKEN_PATTERN', () => {
  it('is the same pattern as the contract', () => {
    expect(TOKEN_PATTERN.source).toBe(FEEDBACK_TOKEN_PATTERN.source);
    expect(TOKEN_PATTERN.test(TOKEN)).toBe(true);
  });
});

describe('takeActivationParam', () => {
  it('a fragment link keeps the token out of what reaches the server, and the cleaned URL drops it', () => {
    const link = `https://example.com/oferta?utm=x#uwagi=${TOKEN}`;
    const sentToServer = new URL(link);

    const result = takeActivationParam(link);

    expect(sentToServer.pathname + sentToServer.search).not.toContain(TOKEN);
    expect(result.token).toBe(TOKEN);
    expect(result.cleanedHref).toBe('https://example.com/oferta?utm=x');
  });

  it('removes only the token segment from the fragment and keeps the anchor on either side', () => {
    expect(
      takeActivationParam(`https://example.com/?a=1#uwagi=${TOKEN}&cennik`),
    ).toEqual({ token: TOKEN, cleanedHref: 'https://example.com/?a=1#cennik' });
    expect(
      takeActivationParam(`https://example.com/#cennik&uwagi=${TOKEN}`),
    ).toEqual({ token: TOKEN, cleanedHref: 'https://example.com/#cennik' });
  });

  it('a fragment without the token segment is a plain anchor and the URL is left alone', () => {
    expect(takeActivationParam('https://example.com/?q=a+b#cennik&x')).toEqual({
      token: null,
      cleanedHref: null,
    });
  });

  it('with a token in both places the fragment wins and both leave the URL', () => {
    const other = `fb_${'z'.repeat(43)}`;

    const result = takeActivationParam(
      `https://example.com/?uwagi=${other}#uwagi=${TOKEN}`,
    );

    expect(result.token).toBe(TOKEN);
    expect(result.cleanedHref).toBe('https://example.com/');
  });

  it('an invalid fragment token also leaves the URL without activating the widget', () => {
    expect(takeActivationParam('https://example.com/#uwagi=bad')).toEqual({
      token: null,
      cleanedHref: 'https://example.com/',
    });
  });

  it('legacy query form: removes only the token parameter, keeping the rest and the anchor', () => {
    const result = takeActivationParam(
      `https://example.com/oferta?utm=x&uwagi=${TOKEN}&a=1#cennik`,
    );

    expect(result.token).toBe(TOKEN);
    expect(result.cleanedHref).toBe(
      'https://example.com/oferta?utm=x&a=1#cennik',
    );
  });

  it('removes an invalid query token without activating the widget', () => {
    expect(takeActivationParam('https://example.com/?uwagi=bad')).toEqual({
      token: null,
      cleanedHref: 'https://example.com/',
    });
  });

  it('leaves a URL without the parameter untouched', () => {
    expect(takeActivationParam('https://example.com/?a=1')).toEqual({
      token: null,
      cleanedHref: null,
    });
  });
});

describe('resolveActiveToken', () => {
  it('stores a token from the URL and rewrites the URL without it', () => {
    const storage = memoryStorage();
    const replaceHref = vi.fn();

    const token = resolveActiveToken({
      href: `https://example.com/#uwagi=${TOKEN}`,
      storage,
      replaceHref,
    });

    expect(token).toBe(TOKEN);
    expect(storage.data.get(TOKEN_STORAGE_KEY)).toBe(TOKEN);
    expect(replaceHref).toHaveBeenCalledWith('https://example.com/');
    expect(replaceHref.mock.calls.flat().join(' ')).not.toContain(TOKEN);
  });

  it('stays inactive without a parameter and without a stored token', () => {
    const replaceHref = vi.fn();

    expect(
      resolveActiveToken({
        href: 'https://example.com/',
        storage: memoryStorage(),
        replaceHref,
      }),
    ).toBeNull();
    expect(replaceHref).not.toHaveBeenCalled();
  });

  it('after a reload reads the stored token and rejects garbage in storage', () => {
    const href = 'https://example.com/kontakt';
    const noop = () => undefined;

    expect(
      resolveActiveToken({
        href,
        storage: memoryStorage({ [TOKEN_STORAGE_KEY]: TOKEN }),
        replaceHref: noop,
      }),
    ).toBe(TOKEN);
    expect(
      resolveActiveToken({
        href,
        storage: memoryStorage({ [TOKEN_STORAGE_KEY]: 'x' }),
        replaceHref: noop,
      }),
    ).toBeNull();
  });

  it('blocked storage does not throw: the URL token works for this visit and the URL is still cleaned', () => {
    const replaceHref = vi.fn();

    expect(
      resolveActiveToken({
        href: `https://example.com/?uwagi=${TOKEN}`,
        storage: throwingStorage(),
        replaceHref,
      }),
    ).toBe(TOKEN);
    expect(replaceHref).toHaveBeenCalledWith('https://example.com/');
    expect(
      resolveActiveToken({
        href: 'https://example.com/',
        storage: throwingStorage(),
        replaceHref,
      }),
    ).toBeNull();
  });
});
