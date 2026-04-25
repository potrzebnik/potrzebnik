import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { toNextJsHandler } from 'better-auth/next-js';
import { convertSetCookieToCookie } from 'better-auth/test';

import {
  createAuthRequest,
  signInWithGoogle,
  createGoogleSignInRequestBody,
  TEST_GOOGLE_USER,
} from '../test/auth-integration/google';
import { createAuthIntegrationHarness } from '../test/auth-integration/harness';

describe('auth integration', () => {
  let harness: Awaited<ReturnType<typeof createAuthIntegrationHarness>>;

  beforeAll(async () => {
    harness = await createAuthIntegrationHarness();
  });

  afterEach(async () => {
    if (harness) {
      await harness.resetAuthTables();
    }
  });

  afterAll(async () => {
    if (harness) {
      await harness.dispose();
    }
  });

  it('creates one user, one account, and one session on first Google sign-in', async () => {
    const auth = harness.createTestAuth();

    const { data, response } = await signInWithGoogle(auth);

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      redirect: false,
      user: {
        email: TEST_GOOGLE_USER.email,
        name: TEST_GOOGLE_USER.name,
      },
    });
    await expect(harness.getAuthCounts()).resolves.toEqual({
      account: 1,
      session: 1,
      user: 1,
      verification: 0,
    });
  });

  it('reuses the existing user and account on repeated Google sign-in', async () => {
    const auth = harness.createTestAuth();

    const firstSignIn = await signInWithGoogle(auth);
    const secondSignIn = await signInWithGoogle(auth);

    expect(firstSignIn.data).toMatchObject({
      redirect: false,
      user: {
        email: TEST_GOOGLE_USER.email,
      },
    });
    expect(secondSignIn.data).toMatchObject({
      redirect: false,
      user: {
        email: TEST_GOOGLE_USER.email,
      },
    });
    expect(secondSignIn.data.token).not.toBe(firstSignIn.data.token);
    await expect(harness.getAuthCounts()).resolves.toEqual({
      account: 1,
      session: 2,
      user: 1,
      verification: 0,
    });
  });

  it('links Google account to an existing email/password user with the same email', async () => {
    const auth = harness.createTestAuth();
    const signUpResponse = await auth.handler(
      createAuthRequest('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: TEST_GOOGLE_USER.name,
          email: TEST_GOOGLE_USER.email,
          password: 'TestPassword123!',
        }),
      }),
    );
    const signUpData = await signUpResponse.json();
    const googleSignIn = await signInWithGoogle(auth);
    const linkedAccounts = await harness.pool.query<{
      provider_id: string;
      user_id: string;
    }>('SELECT provider_id, user_id FROM account ORDER BY provider_id');

    expect(signUpResponse.status).toBe(200);
    expect(signUpData).toMatchObject({
      user: {
        email: TEST_GOOGLE_USER.email,
        name: TEST_GOOGLE_USER.name,
      },
    });
    expect(googleSignIn.response.status).toBe(200);
    expect(googleSignIn.data).toMatchObject({
      redirect: false,
      user: {
        email: TEST_GOOGLE_USER.email,
        name: TEST_GOOGLE_USER.name,
      },
    });
    await expect(harness.getAuthCounts()).resolves.toEqual({
      account: 2,
      session: 2,
      user: 1,
      verification: 0,
    });
    expect(linkedAccounts.rows.map((account) => account.provider_id)).toEqual([
      'credential',
      'google',
    ]);
    const linkedUserIds = new Set(
      linkedAccounts.rows.map((account) => account.user_id),
    );
    expect(linkedUserIds.size).toBe(1);
  });

  it('returns session data through the Better Auth request handler path', async () => {
    const auth = harness.createTestAuth();
    const nextHandler = toNextJsHandler(auth);
    const signInResponse = await nextHandler.POST(
      createAuthRequest('/api/auth/sign-in/social', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(createGoogleSignInRequestBody()),
      }),
    );
    const signInData = await signInResponse.json();
    const cookieHeaders = convertSetCookieToCookie(
      new Headers(signInResponse.headers),
    );
    const sessionResponse = await nextHandler.GET(
      createAuthRequest('/api/auth/get-session', {
        method: 'GET',
        headers: cookieHeaders,
      }),
    );
    const sessionData = await sessionResponse.json();

    expect(signInResponse.status).toBe(200);
    expect(signInData).toMatchObject({
      redirect: false,
      user: {
        email: TEST_GOOGLE_USER.email,
      },
    });
    expect(sessionData).toMatchObject({
      user: {
        email: TEST_GOOGLE_USER.email,
      },
      session: {
        token: signInData.token,
      },
    });
  });
});
