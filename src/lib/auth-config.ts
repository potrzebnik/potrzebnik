import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { GoogleOptions } from 'better-auth/social-providers';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from '../db/schema';
import { getAuthEnv } from './auth-env';
import {
  createPasswordResetEmail,
  createResendEmailSender,
  createVerificationEmail,
  type EmailSender,
} from './emails';

/**
 * Drizzle database instance used by the Better Auth adapter.
 */
export type AuthDatabase = NodePgDatabase<typeof schema>;

/**
 * Dependencies and test seams for creating a Better Auth server instance.
 */
export type CreateAuthOptions = {
  /** Database connection backing Better Auth persistence. */
  database: AuthDatabase;
  /** Environment source used to resolve auth settings. Defaults to `process.env`. */
  env?: NodeJS.ProcessEnv;
  /** Google provider overrides used by auth integration tests. */
  googleOverrides?: Partial<GoogleOptions>;
  /** Email sender override used by tests; production defaults to Resend when enabled. */
  emailSender?: EmailSender;
};

/**
 * Creates the Better Auth server configuration for this app.
 *
 * Email/password auth is always enabled. When email sending is configured, the
 * auth flow also requires email verification and sends verification/reset
 * messages through the configured sender. Google auth is added only when the
 * resolved environment enables it.
 */
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
