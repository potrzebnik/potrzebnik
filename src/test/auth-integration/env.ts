export const AUTH_MANAGED_ENV_KEYS = [
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'GOOGLE_AUTH_ENABLED',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'EMAIL_SENDING_ENABLED',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'RESEND_FROM_NAME',
] as const;

export const AUTH_TEST_ENV = Object.freeze({
  BETTER_AUTH_SECRET: 'test-better-auth-secret-that-is-long-enough',
  BETTER_AUTH_URL: 'http://127.0.0.1:3000',
  GOOGLE_AUTH_ENABLED: 'true',
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  EMAIL_SENDING_ENABLED: 'false',
});

export function applyBaseIntegrationEnv(env: NodeJS.ProcessEnv = process.env) {
  Object.assign(env, AUTH_TEST_ENV);
}

export function createIntegrationEnv(
  overrides: Partial<NodeJS.ProcessEnv> = {},
): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ...AUTH_TEST_ENV,
    ...overrides,
  };
}
