import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { GoogleOptions } from 'better-auth/social-providers';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from '../db/schema';
import {
  createPasswordResetEmail,
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
  /** Better Auth signing secret. */
  secret: string;
  /** Public base URL used by Better Auth. */
  baseURL: string;
  /** Fully configured Google provider when Google authentication is enabled. */
  google?: GoogleOptions;
  /** Sender used to enable verification and password reset email flows. */
  emailSender?: EmailSender;
};

type EmailAuthOptions = Pick<
  BetterAuthOptions,
  'emailAndPassword' | 'emailVerification'
>;
type GoogleAuthOptions = Pick<BetterAuthOptions, 'socialProviders'>;

function createEmailAuthOptions(emailSender?: EmailSender): EmailAuthOptions {
  if (!emailSender) {
    return {
      emailAndPassword: {
        enabled: true,
      },
    };
  }

  return {
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: ({ user, url }) =>
        emailSender.send(
          createPasswordResetEmail({
            to: user.email,
            url,
          }),
        ),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: ({ user, url }) =>
        emailSender.send(
          createVerificationEmail({
            to: user.email,
            url,
          }),
        ),
    },
  };
}

function createGoogleAuthOptions(google?: GoogleOptions): GoogleAuthOptions {
  if (!google) {
    return {};
  }

  return {
    socialProviders: {
      google,
    },
  };
}

/**
 * Creates the Better Auth server configuration for this app.
 *
 * Email/password auth is always enabled. When an email sender is provided, the
 * auth flow also requires email verification and sends verification/reset
 * messages through it. Google auth is added only when its provider
 * configuration is provided.
 */
export function createAuth({
  database,
  secret,
  baseURL,
  google,
  emailSender,
}: CreateAuthOptions) {
  return betterAuth({
    secret,
    baseURL,
    database: drizzleAdapter(database, {
      provider: 'pg',
    }),
    ...createEmailAuthOptions(emailSender),
    ...createGoogleAuthOptions(google),
  });
}
