import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '@/db';

function requireAuthEnv(
  key: 'BETTER_AUTH_URL' | 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET',
): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}. It is required for authentication.`,
    );
  }

  return value;
}

export const auth = betterAuth({
  baseURL: requireAuthEnv('BETTER_AUTH_URL'),
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  socialProviders: {
    google: {
      clientId: requireAuthEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireAuthEnv('GOOGLE_CLIENT_SECRET'),
    },
  },
});
