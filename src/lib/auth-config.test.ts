import { describe, expect, it } from 'vitest';

import { getAuthEnv } from './auth-config';

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

describe('getAuthEnv', () => {
  it('returns the auth environment values', () => {
    expect(getAuthEnv(createEnv())).toEqual({
      secret: 'test-better-auth-secret-that-is-long-enough',
      baseURL: 'http://127.0.0.1:3000',
      googleClientId: 'test-google-client-id',
      googleClientSecret: 'test-google-client-secret',
    });
  });

  it.each([
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ] as const)('rejects a missing %s value', (key) => {
    const env = createEnv();

    delete env[key];

    expect(() => getAuthEnv(env)).toThrow(
      `Missing environment variable: ${key}. It is required for authentication.`,
    );
  });
});
