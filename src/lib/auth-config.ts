import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { GoogleOptions } from 'better-auth/social-providers';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from '../db/schema';
import {
  createPasswordResetEmail,
  createResendEmailSender,
  createVerificationEmail,
  type EmailSender,
} from './emails';

type RequiredAuthEnvKey = 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL';
type BooleanAuthEnvKey = 'GOOGLE_AUTH_ENABLED' | 'EMAIL_SENDING_ENABLED';
type GoogleAuthEnvKey = 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET';
type EmailSendingEnvKey = 'RESEND_API_KEY' | 'RESEND_FROM_EMAIL';
type AuthEnvKey =
  | RequiredAuthEnvKey
  | BooleanAuthEnvKey
  | GoogleAuthEnvKey
  | EmailSendingEnvKey;

export type AuthEnv = {
  secret: string;
  baseURL: string;
  google?: {
    clientId: string;
    clientSecret: string;
  };
  email?: {
    resendApiKey: string;
    fromEmail: string;
    fromName?: string;
  };
};

export type AuthDatabase = NodePgDatabase<typeof schema>;

export type CreateAuthOptions = {
  database: AuthDatabase;
  env?: NodeJS.ProcessEnv;
  googleOverrides?: Partial<GoogleOptions>;
  emailSender?: EmailSender;
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

export function createAuth({
  database,
  env = process.env,
  googleOverrides,
  emailSender,
}: CreateAuthOptions) {
  const authEnv = getAuthEnv(env);
  const authEmailSender = authEnv.email
    ? (emailSender ?? createResendEmailSender(authEnv.email))
    : undefined;
  const socialProviders = authEnv.google
    ? {
        google: {
          ...googleOverrides,
          clientId: authEnv.google.clientId,
          clientSecret: authEnv.google.clientSecret,
        },
      }
    : undefined;
  const emailAndPassword = authEmailSender
    ? {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: ({
          user,
          url,
          token,
        }: {
          user: { email: string };
          url: string;
          token: string;
        }) =>
          authEmailSender.send(
            createPasswordResetEmail({
              to: user.email,
              url,
              token,
            }),
          ),
      }
    : {
        enabled: true,
      };

  return betterAuth({
    secret: authEnv.secret,
    baseURL: authEnv.baseURL,
    database: drizzleAdapter(database, {
      provider: 'pg',
    }),
    emailAndPassword,
    ...(authEmailSender
      ? {
          emailVerification: {
            sendOnSignUp: true,
            sendVerificationEmail: ({
              user,
              url,
              token,
            }: {
              user: { email: string };
              url: string;
              token: string;
            }) =>
              authEmailSender.send(
                createVerificationEmail({
                  to: user.email,
                  url,
                  token,
                }),
              ),
          },
        }
      : {}),
    ...(socialProviders ? { socialProviders } : {}),
  });
}
