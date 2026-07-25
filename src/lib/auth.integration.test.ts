import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { toNextJsHandler } from 'better-auth/next-js';
import { convertSetCookieToCookie } from 'better-auth/test';

import {
  createAuthRequest,
  signInWithGoogle,
  createGoogleSignInRequestBody,
  TEST_GOOGLE_USER,
} from '@/test/auth-integration/google';
import { createAuthIntegrationHarness } from '@/test/auth-integration/harness';
import type { AuthEmailMessage, EmailSender } from './emails';

type AuthHandler = {
  handler: (request: Request) => Promise<Response>;
};

const TEST_CREDENTIAL_USER = Object.freeze({
  name: 'Credential User',
  email: 'credential@example.com',
  password: 'TestPassword123!',
});

const EMAIL_ENABLED_ENV: Partial<NodeJS.ProcessEnv> = {
  EMAIL_SENDING_ENABLED: 'true',
  RESEND_API_KEY: 'test-resend-api-key',
  RESEND_FROM_EMAIL: 'noreply@example.com',
};

function createFakeEmailSender() {
  const messages: AuthEmailMessage[] = [];
  const sender: EmailSender = {
    async send(message) {
      messages.push(message);
    },
  };

  return {
    messages,
    sender,
  };
}

function createJsonPostRequest(pathname: string, body: unknown) {
  return createAuthRequest(pathname, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function signUpWithEmail(auth: AuthHandler) {
  return auth.handler(
    createJsonPostRequest('/api/auth/sign-up/email', TEST_CREDENTIAL_USER),
  );
}

function signInWithEmail(auth: AuthHandler) {
  return auth.handler(
    createJsonPostRequest('/api/auth/sign-in/email', {
      email: TEST_CREDENTIAL_USER.email,
      password: TEST_CREDENTIAL_USER.password,
    }),
  );
}

function requestPasswordReset(auth: AuthHandler) {
  return auth.handler(
    createJsonPostRequest('/api/auth/request-password-reset', {
      email: TEST_CREDENTIAL_USER.email,
      redirectTo: '/reset-password',
    }),
  );
}

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

  it('rejects Google sign-in when the ID token cannot be verified', async () => {
    const auth = harness.createTestAuth();
    const requestBody = createGoogleSignInRequestBody();
    requestBody.idToken.token = 'invalid-google-id-token';

    const response = await auth.handler(
      createAuthRequest('/api/auth/sign-in/social', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }),
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    await expect(harness.getAuthCounts()).resolves.toEqual({
      account: 0,
      session: 0,
      user: 0,
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

  it('keeps email/password sign-up working and password reset disabled when email sending is disabled', async () => {
    const auth = harness.createTestAuth();

    const signUpResponse = await signUpWithEmail(auth);
    const signUpData = await signUpResponse.json();
    const resetResponse = await requestPasswordReset(auth);

    expect(signUpResponse.status).toBe(200);
    expect(signUpData).toMatchObject({
      user: {
        email: TEST_CREDENTIAL_USER.email,
        name: TEST_CREDENTIAL_USER.name,
      },
    });
    expect(resetResponse.status).toBe(400);
    await expect(harness.getAuthCounts()).resolves.toEqual({
      account: 1,
      session: 1,
      user: 1,
      verification: 0,
    });
  });

  it('sends verification and password reset emails when email sending is enabled', async () => {
    const fakeEmail = createFakeEmailSender();
    const auth = harness.createTestAuth({
      env: EMAIL_ENABLED_ENV,
      emailSender: fakeEmail.sender,
    });

    const signUpResponse = await signUpWithEmail(auth);
    const signUpData = await signUpResponse.json();
    const verificationEmail = fakeEmail.messages[0];

    expect(signUpResponse.status).toBe(200);
    expect(signUpData).toMatchObject({
      token: null,
      user: {
        email: TEST_CREDENTIAL_USER.email,
      },
    });
    expect(fakeEmail.messages).toHaveLength(1);
    expect(verificationEmail).toMatchObject({
      purpose: 'verification',
      to: TEST_CREDENTIAL_USER.email,
    });

    const blockedSignInResponse = await signInWithEmail(auth);
    const verifyResponse = await auth.handler(
      createAuthRequest(
        `/api/auth/verify-email?token=${encodeURIComponent(
          verificationEmail.token,
        )}`,
      ),
    );
    const verifiedSignInResponse = await signInWithEmail(auth);
    const verifiedSignInData = await verifiedSignInResponse.json();
    const resetResponse = await requestPasswordReset(auth);
    const resetData = await resetResponse.json();

    expect(blockedSignInResponse.status).toBe(403);
    expect(verifyResponse.status).toBe(200);
    expect(verifiedSignInResponse.status).toBe(200);
    expect(verifiedSignInData).toMatchObject({
      user: {
        email: TEST_CREDENTIAL_USER.email,
      },
    });
    expect(resetResponse.status).toBe(200);
    expect(resetData).toMatchObject({
      status: true,
    });
    expect(fakeEmail.messages).toHaveLength(2);
    expect(fakeEmail.messages[1]).toMatchObject({
      purpose: 'password-reset',
      to: TEST_CREDENTIAL_USER.email,
    });
    expect(fakeEmail.messages[1].url).toContain('/reset-password/');
    await expect(harness.getAuthCounts()).resolves.toEqual({
      account: 1,
      session: 1,
      user: 1,
      verification: 1,
    });
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
