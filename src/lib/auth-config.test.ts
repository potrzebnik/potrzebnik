import { afterEach, describe, expect, it, vi } from 'vitest';

function createEnv(
  overrides: Partial<NodeJS.ProcessEnv> = {},
): NodeJS.ProcessEnv {
  const {
    NODE_ENV = 'test',
    BETTER_AUTH_SECRET = 'test-better-auth-secret-that-is-long-enough',
    BETTER_AUTH_URL = 'http://127.0.0.1:3000',
    GOOGLE_AUTH_ENABLED = 'true',
    GOOGLE_CLIENT_ID = 'test-google-client-id',
    GOOGLE_CLIENT_SECRET = 'test-google-client-secret',
    ...env
  } = overrides;

  return {
    ...env,
    NODE_ENV,
    BETTER_AUTH_SECRET,
    BETTER_AUTH_URL,
    GOOGLE_AUTH_ENABLED,
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

  it('returns auth env values with google config when google auth is enabled', async () => {
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

  it.each([
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'GOOGLE_AUTH_ENABLED',
  ] as const)('rejects a missing %s value', async (key) => {
    const getAuthEnv = await loadGetAuthEnv();
    const env = createEnv({ NODE_ENV: 'development' });

    delete env[key];

    expect(() => getAuthEnv(env)).toThrow(
      `Missing environment variable: ${key}. It is required for authentication.`,
    );
  });

  it.each([['GOOGLE_CLIENT_ID'], ['GOOGLE_CLIENT_SECRET']] as const)(
    'rejects missing %s when google auth is enabled',
    async (missingKey) => {
      const getAuthEnv = await loadGetAuthEnv();
      const env = createEnv({ NODE_ENV: 'development' });

      delete env[missingKey];

      expect(() => getAuthEnv(env)).toThrow(
        `Missing environment variable: ${missingKey}. It is required for authentication.`,
      );
    },
  );

  it('rejects an invalid GOOGLE_AUTH_ENABLED value', async () => {
    const getAuthEnv = await loadGetAuthEnv();
    const env = createEnv({ GOOGLE_AUTH_ENABLED: 'yes' });

    expect(() => getAuthEnv(env)).toThrow(
      'Invalid environment variable: GOOGLE_AUTH_ENABLED. Expected "true" or "false".',
    );
  });

  it('allows missing google keys when google auth is disabled', async () => {
    const getAuthEnv = await loadGetAuthEnv();
    const env = createEnv({ GOOGLE_AUTH_ENABLED: 'false' });

    delete env.GOOGLE_CLIENT_ID;
    delete env.GOOGLE_CLIENT_SECRET;

    expect(getAuthEnv(env)).toEqual({
      secret: 'test-better-auth-secret-that-is-long-enough',
      baseURL: 'http://127.0.0.1:3000',
      google: undefined,
    });
  });
});
