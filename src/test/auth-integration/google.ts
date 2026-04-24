import type { GoogleOptions } from 'better-auth/social-providers';

import { AUTH_TEST_ENV } from './env';

type AuthHandler = {
  handler: (request: Request) => Promise<Response>;
};

export const TEST_GOOGLE_ID_TOKEN = 'test-google-id-token';
export const TEST_GOOGLE_ACCESS_TOKEN = 'test-google-access-token';

export const TEST_GOOGLE_USER = Object.freeze({
  id: 'google-user-123',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.png',
  emailVerified: true,
});

export function createGoogleOverrides(
  userOverrides: Partial<typeof TEST_GOOGLE_USER> = {},
): Partial<GoogleOptions> {
  const user = {
    ...TEST_GOOGLE_USER,
    ...userOverrides,
  };

  return {
    verifyIdToken: async (token) => token === TEST_GOOGLE_ID_TOKEN,
    getUserInfo: async (tokens) => {
      if (tokens.idToken !== TEST_GOOGLE_ID_TOKEN) {
        return null;
      }

      return {
        user,
        data: user,
      };
    },
  };
}

export function createAuthRequest(pathname: string, init?: RequestInit) {
  return new Request(`${AUTH_TEST_ENV.BETTER_AUTH_URL}${pathname}`, init);
}

export function createGoogleSignInRequestBody() {
  return {
    provider: 'google' as const,
    disableRedirect: true,
    callbackURL: `${AUTH_TEST_ENV.BETTER_AUTH_URL}/dashboard`,
    idToken: {
      token: TEST_GOOGLE_ID_TOKEN,
      accessToken: TEST_GOOGLE_ACCESS_TOKEN,
    },
  };
}

export async function signInWithGoogle(auth: AuthHandler) {
  const response = await auth.handler(
    createAuthRequest('/api/auth/sign-in/social', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(createGoogleSignInRequestBody()),
    }),
  );

  return {
    response,
    data: await response.json(),
  };
}
