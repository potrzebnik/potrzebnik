import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { GoogleOptions } from 'better-auth/social-providers';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from '../db/schema';

type AuthEnvKey =
  | 'BETTER_AUTH_SECRET'
  | 'BETTER_AUTH_URL'
  | 'GOOGLE_CLIENT_ID'
  | 'GOOGLE_CLIENT_SECRET';

export type AuthEnv = {
  secret: string;
  baseURL: string;
  googleClientId: string;
  googleClientSecret: string;
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

export function getAuthEnv(env: NodeJS.ProcessEnv = process.env): AuthEnv {
  return {
    secret: requireAuthEnv('BETTER_AUTH_SECRET', env),
    baseURL: requireAuthEnv('BETTER_AUTH_URL', env),
    googleClientId: requireAuthEnv('GOOGLE_CLIENT_ID', env),
    googleClientSecret: requireAuthEnv('GOOGLE_CLIENT_SECRET', env),
  };
}

export function createAuth({
  database,
  env = process.env,
  googleOverrides,
}: CreateAuthOptions) {
  const authEnv = getAuthEnv(env);

  return betterAuth({
    secret: authEnv.secret,
    baseURL: authEnv.baseURL,
    database: drizzleAdapter(database, {
      provider: 'pg',
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        ...googleOverrides,
        clientId: authEnv.googleClientId,
        clientSecret: authEnv.googleClientSecret,
      },
    },
  });
}
