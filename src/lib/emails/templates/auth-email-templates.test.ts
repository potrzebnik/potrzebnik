import { describe, expect, it } from 'vitest';

import { createPasswordResetEmail } from '@/lib/emails';
import { createVerificationEmail } from '@/lib/emails';

describe('auth email templates', () => {
  it('creates a verification email with configurable subject and content in one template file', () => {
    const url =
      'https://example.com/api/auth/verify-email?token=test-token&next=<dashboard>"';

    expect(
      createVerificationEmail({
        to: 'user@example.com',
        url,
        token: 'test-token',
      }),
    ).toEqual({
      purpose: 'verification',
      to: 'user@example.com',
      url,
      token: 'test-token',
      subject: 'Verify your Potrzebnik email',
      html: '<p>Verify your email address by opening this link:</p><p><a href="https://example.com/api/auth/verify-email?token=test-token&amp;next=&lt;dashboard&gt;&quot;">https://example.com/api/auth/verify-email?token=test-token&amp;next=&lt;dashboard&gt;&quot;</a></p>',
      text: `Verify your email address by opening this link: ${url}`,
    });
  });

  it('creates a password reset email with configurable subject and content in one template file', () => {
    const url =
      'https://example.com/reset-password/test-token?next=<dashboard>&from=email';

    expect(
      createPasswordResetEmail({
        to: 'user@example.com',
        url,
        token: 'test-token',
      }),
    ).toEqual({
      purpose: 'password-reset',
      to: 'user@example.com',
      url,
      token: 'test-token',
      subject: 'Reset your Potrzebnik password',
      html: '<p>Reset your password by opening this link:</p><p><a href="https://example.com/reset-password/test-token?next=&lt;dashboard&gt;&amp;from=email">https://example.com/reset-password/test-token?next=&lt;dashboard&gt;&amp;from=email</a></p>',
      text: `Reset your password by opening this link: ${url}`,
    });
  });
});
