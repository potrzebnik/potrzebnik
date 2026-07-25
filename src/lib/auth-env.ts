type RequiredAuthEnvKey = 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL';
type BooleanAuthEnvKey = 'GOOGLE_AUTH_ENABLED' | 'EMAIL_SENDING_ENABLED';
type GoogleAuthEnvKey = 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET';
type EmailSendingEnvKey = 'RESEND_API_KEY' | 'RESEND_FROM_EMAIL';
type AuthEnvKey =
  | RequiredAuthEnvKey
  | BooleanAuthEnvKey
  | GoogleAuthEnvKey
  | EmailSendingEnvKey;

/**
 * Validated authentication settings resolved from environment variables.
 */
export type AuthEnv = {
  /** Better Auth signing secret. */
  secret: string;
  /** Public base URL used by Better Auth for redirects and generated links. */
  baseURL: string;
  /** Google OAuth credentials, present only when Google authentication is enabled. */
  google?: {
    clientId: string;
    clientSecret: string;
  };
  /** Resend email delivery config, present only when auth email sending is enabled. */
  email?: {
    resendApiKey: string;
    fromEmail: string;
    fromName?: string;
  };
};

function requireAuthEnv(key: AuthEnvKey, env: NodeJS.ProcessEnv): string {
  const value = env[key];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}. It is required for authentication.`,
    );
  }

  return value;
}

function requireBooleanAuthEnv(
  key: BooleanAuthEnvKey,
  env: NodeJS.ProcessEnv,
): boolean {
  const value = requireAuthEnv(key, env).toLowerCase();

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(
    `Invalid environment variable: ${key}. Expected "true" or "false".`,
  );
}

function optionalBooleanAuthEnv(
  key: BooleanAuthEnvKey,
  env: NodeJS.ProcessEnv,
  defaultValue: boolean,
): boolean {
  const value = env[key];

  if (value === undefined) {
    return defaultValue;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  throw new Error(
    `Invalid environment variable: ${key}. Expected "true" or "false".`,
  );
}

/**
 * Reads and validates authentication environment variables.
 *
 * `GOOGLE_AUTH_ENABLED` is required so OAuth is explicitly enabled or disabled.
 * `EMAIL_SENDING_ENABLED` defaults to `false`; when enabled, Resend settings
 * become required.
 *
 * @throws When a required variable is missing or a boolean flag is invalid.
 */
export function getAuthEnv(env: NodeJS.ProcessEnv = process.env): AuthEnv {
  const isGoogleAuthEnabled = requireBooleanAuthEnv('GOOGLE_AUTH_ENABLED', env);
  const isEmailSendingEnabled = optionalBooleanAuthEnv(
    'EMAIL_SENDING_ENABLED',
    env,
    false,
  );

  return {
    secret: requireAuthEnv('BETTER_AUTH_SECRET', env),
    baseURL: requireAuthEnv('BETTER_AUTH_URL', env),
    google: isGoogleAuthEnabled
      ? {
          clientId: requireAuthEnv('GOOGLE_CLIENT_ID', env),
          clientSecret: requireAuthEnv('GOOGLE_CLIENT_SECRET', env),
        }
      : undefined,
    email: isEmailSendingEnabled
      ? {
          resendApiKey: requireAuthEnv('RESEND_API_KEY', env),
          fromEmail: requireAuthEnv('RESEND_FROM_EMAIL', env),
          fromName: env.RESEND_FROM_NAME || undefined,
        }
      : undefined,
  };
}
