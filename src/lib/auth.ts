import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '@/db';

function requireGoogleEnv(
  key: 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET',
): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}. It is required to enable Google authentication.`,
    );
  }

  return value;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: requireGoogleEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireGoogleEnv('GOOGLE_CLIENT_SECRET'),
    },
  },
});
