import { afterEach, describe, expect, it, vi } from 'vitest';

function createEnv(
  overrides: Partial<NodeJS.ProcessEnv> = {},
): NodeJS.ProcessEnv {
  const {
    NODE_ENV = 'test',
    BETTER_AUTH_SECRET = 'test-better-auth-secret-that-is-long-enough',
    BETTER_AUTH_URL = 'http://127.0.0.1:3000',
    GOOGLE_CLIENT_ID = 'test-google-client-id',
    GOOGLE_CLIENT_SECRET = 'test-google-client-secret',
    ...env
  } = overrides;

  return {
    ...env,
    NODE_ENV,
    BETTER_AUTH_SECRET,
    BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
  };
}

async function loadGetAuthEnv() {
  vi.resetModules();

  const { getAuthEnv } = await import('./auth-config');

  return getAuthEnv;
}

describe('getAuthEnv', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns auth env values with google config when all values exist', async () => {
    const getAuthEnv = await loadGetAuthEnv();

    expect(getAuthEnv(createEnv())).toEqual({
      secret: 'test-better-auth-secret-that-is-long-enough',
      baseURL: 'http://127.0.0.1:3000',
      google: {
        clientId: 'test-google-client-id',
        clientSecret: 'test-google-client-secret',
      },
    });
  });

  it.each(['BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'] as const)(
    'rejects a missing %s value in development',
    async (key) => {
      const getAuthEnv = await loadGetAuthEnv();
      const env = createEnv({ NODE_ENV: 'development' });

      delete env[key];

      expect(() => getAuthEnv(env)).toThrow(
        `Missing environment variable: ${key}. It is required for authentication.`,
      );
    },
  );

  it.each([
    ['GOOGLE_CLIENT_ID', 'test'],
    ['GOOGLE_CLIENT_SECRET', 'production'],
  ] as const)(
    'rejects missing %s outside development (NODE_ENV=%s)',
    async (missingKey, nodeEnv) => {
      const getAuthEnv = await loadGetAuthEnv();
      const env = createEnv({ NODE_ENV: nodeEnv });

      delete env[missingKey];

      expect(() => getAuthEnv(env)).toThrow(
        `Missing environment variable: ${missingKey}. It is required for authentication.`,
      );
    },
  );

  it('allows development startup when both google keys are missing and warns once', async () => {
    const getAuthEnv = await loadGetAuthEnv();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const env = createEnv({ NODE_ENV: 'development' });

    delete env.GOOGLE_CLIENT_ID;
    delete env.GOOGLE_CLIENT_SECRET;

    expect(getAuthEnv(env)).toEqual({
      secret: 'test-better-auth-secret-that-is-long-enough',
      baseURL: 'http://127.0.0.1:3000',
      google: undefined,
    });
    expect(getAuthEnv(env)).toEqual({
      secret: 'test-better-auth-secret-that-is-long-enough',
      baseURL: 'http://127.0.0.1:3000',
      google: undefined,
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'Google OAuth is disabled in development because required environment variable(s) are missing: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.',
    );
  });

  it('allows development startup when one google key is missing and disables google', async () => {
    const getAuthEnv = await loadGetAuthEnv();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const env = createEnv({ NODE_ENV: 'development' });

    delete env.GOOGLE_CLIENT_SECRET;

    expect(getAuthEnv(env)).toEqual({
      secret: 'test-better-auth-secret-that-is-long-enough',
      baseURL: 'http://127.0.0.1:3000',
      google: undefined,
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'Google OAuth is disabled in development because required environment variable(s) are missing: GOOGLE_CLIENT_SECRET.',
    );
  });
});
