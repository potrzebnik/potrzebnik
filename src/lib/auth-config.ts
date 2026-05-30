import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { GoogleOptions } from 'better-auth/social-providers';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from '../db/schema';

type RequiredAuthEnvKey = 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL';
type GoogleAuthEnabledEnvKey = 'GOOGLE_AUTH_ENABLED';
type GoogleAuthEnvKey = 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET';
type AuthEnvKey =
  | RequiredAuthEnvKey
  | GoogleAuthEnabledEnvKey
  | GoogleAuthEnvKey;

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
  key: GoogleAuthEnabledEnvKey,
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

export function getAuthEnv(env: NodeJS.ProcessEnv = process.env): AuthEnv {
  const isGoogleAuthEnabled = requireBooleanAuthEnv('GOOGLE_AUTH_ENABLED', env);

  return {
    secret: requireAuthEnv('BETTER_AUTH_SECRET', env),
    baseURL: requireAuthEnv('BETTER_AUTH_URL', env),
    google: isGoogleAuthEnabled
      ? {
          clientId: requireAuthEnv('GOOGLE_CLIENT_ID', env),
          clientSecret: requireAuthEnv('GOOGLE_CLIENT_SECRET', env),
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
