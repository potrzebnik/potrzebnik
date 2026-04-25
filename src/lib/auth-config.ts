import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { GoogleOptions } from 'better-auth/social-providers';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from '../db/schema';

type RequiredAuthEnvKey = 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL';
type GoogleAuthEnvKey = 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET';

export type AuthEnv = {
  secret: string;
  baseURL: string;
  google?: {
    clientId: string;
    clientSecret: string;
  };
};

export type AuthDatabase = NodePgDatabase<typeof schema>;

export type CreateAuthOptions = {
  database: AuthDatabase;
  env?: NodeJS.ProcessEnv;
  googleOverrides?: Partial<GoogleOptions>;
};

let hasWarnedMissingGoogleEnvInDevelopment = false;

function requireAuthEnv(
  key: RequiredAuthEnvKey,
  env: NodeJS.ProcessEnv,
): string {
  const value = env[key];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}. It is required for authentication.`,
    );
  }

  return value;
}

function warnGoogleOauthDisabledInDevelopment(
  missingGoogleKeys: GoogleAuthEnvKey[],
) {
  if (hasWarnedMissingGoogleEnvInDevelopment) {
    return;
  }

  hasWarnedMissingGoogleEnvInDevelopment = true;

  console.warn(
    `Google OAuth is disabled in development because required environment variable(s) are missing: ${missingGoogleKeys.join(', ')}.`,
  );
}

export function getAuthEnv(env: NodeJS.ProcessEnv = process.env): AuthEnv {
  const googleConfig = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
  const missingGoogleKeys: GoogleAuthEnvKey[] = [];

  if (!googleConfig.clientId) {
    missingGoogleKeys.push('GOOGLE_CLIENT_ID');
  }

  if (!googleConfig.clientSecret) {
    missingGoogleKeys.push('GOOGLE_CLIENT_SECRET');
  }

  const isDevelopment = env.NODE_ENV === 'development';
  const hasCompleteGoogleConfig = missingGoogleKeys.length === 0;

  if (!hasCompleteGoogleConfig && !isDevelopment) {
    throw new Error(
      `Missing environment variable: ${missingGoogleKeys[0]}. It is required for authentication.`,
    );
  }

  if (!hasCompleteGoogleConfig && isDevelopment) {
    warnGoogleOauthDisabledInDevelopment(missingGoogleKeys);
  }

  return {
    secret: requireAuthEnv('BETTER_AUTH_SECRET', env),
    baseURL: requireAuthEnv('BETTER_AUTH_URL', env),
    google: hasCompleteGoogleConfig
      ? {
          clientId: googleConfig.clientId!,
          clientSecret: googleConfig.clientSecret!,
        }
      : undefined,
  };
}

export function createAuth({
  database,
  env = process.env,
  googleOverrides,
}: CreateAuthOptions) {
  const authEnv = getAuthEnv(env);
  const socialProviders = authEnv.google
    ? {
        google: {
          ...googleOverrides,
          clientId: authEnv.google.clientId,
          clientSecret: authEnv.google.clientSecret,
        },
      }
    : undefined;

  return betterAuth({
    secret: authEnv.secret,
    baseURL: authEnv.baseURL,
    database: drizzleAdapter(database, {
      provider: 'pg',
    }),
    emailAndPassword: {
      enabled: true,
    },
    ...(socialProviders ? { socialProviders } : {}),
  });
}
