import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { GoogleOptions } from 'better-auth/social-providers';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Resend } from 'resend';

import type * as schema from '../db/schema';

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

export type AuthEmailPurpose = 'verification' | 'password-reset';

export type AuthEmailMessage = {
  purpose: AuthEmailPurpose;
  to: string;
  url: string;
  token: string;
  subject: string;
  html: string;
  text: string;
};

export type AuthEmailSender = (message: AuthEmailMessage) => Promise<void>;

export type CreateAuthOptions = {
  database: AuthDatabase;
  env?: NodeJS.ProcessEnv;
  googleOverrides?: Partial<GoogleOptions>;
  emailSender?: AuthEmailSender;
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatFromEmail({
  fromEmail,
  fromName,
}: {
  fromEmail: string;
  fromName?: string;
}) {
  return fromName ? `${fromName} <${fromEmail}>` : fromEmail;
}

function createResendEmailSender({
  resendApiKey,
  fromEmail,
  fromName,
}: NonNullable<AuthEnv['email']>): AuthEmailSender {
  const resend = new Resend(resendApiKey);
  const from = formatFromEmail({ fromEmail, fromName });

  return async (message) => {
    const { error } = await resend.emails.send({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) {
      throw new Error(
        `Failed to send ${message.purpose} email through Resend: ${error.message}`,
      );
    }
  };
}

function createVerificationEmail({
  to,
  url,
  token,
}: {
  to: string;
  url: string;
  token: string;
}): AuthEmailMessage {
  const escapedUrl = escapeHtml(url);

  return {
    purpose: 'verification',
    to,
    url,
    token,
    subject: 'Verify your Potrzebnik email',
    html: `<p>Verify your email address by opening this link:</p><p><a href="${escapedUrl}">${escapedUrl}</a></p>`,
    text: `Verify your email address by opening this link: ${url}`,
  };
}

function createPasswordResetEmail({
  to,
  url,
  token,
}: {
  to: string;
  url: string;
  token: string;
}): AuthEmailMessage {
  const escapedUrl = escapeHtml(url);

  return {
    purpose: 'password-reset',
    to,
    url,
    token,
    subject: 'Reset your Potrzebnik password',
    html: `<p>Reset your password by opening this link:</p><p><a href="${escapedUrl}">${escapedUrl}</a></p>`,
    text: `Reset your password by opening this link: ${url}`,
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
          authEmailSender(
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
              authEmailSender(
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
