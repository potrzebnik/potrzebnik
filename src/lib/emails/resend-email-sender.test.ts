import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthEmailMessage } from './email-sender';
import {
  ResendEmailSender,
  type ResendEmailClient,
} from './resend-email-sender';

const TEST_EMAIL_MESSAGE: AuthEmailMessage = Object.freeze({
  purpose: 'verification',
  to: 'user@example.com',
  subject: 'Test subject',
  html: '<p>Test HTML</p>',
  text: 'Test text',
});

const sendEmail = vi.fn<ResendEmailClient['emails']['send']>();
const resend: ResendEmailClient = {
  emails: {
    send: sendEmail,
  },
};

beforeEach(() => {
  sendEmail.mockReset();
  sendEmail.mockResolvedValue({ error: null });
});

describe('ResendEmailSender', () => {
  it('sends auth email messages through the injected Resend client', async () => {
    const sender = new ResendEmailSender(resend, {
      fromEmail: 'noreply@example.com',
      fromName: 'Potrzebnik',
    });

    await sender.send(TEST_EMAIL_MESSAGE);

    expect(sendEmail).toHaveBeenCalledWith({
      from: 'Potrzebnik <noreply@example.com>',
      to: 'user@example.com',
      subject: 'Test subject',
      html: '<p>Test HTML</p>',
      text: 'Test text',
    });
  });

  it('uses the bare from email when no from name is configured', async () => {
    const sender = new ResendEmailSender(resend, {
      fromEmail: 'noreply@example.com',
    });

    await sender.send(TEST_EMAIL_MESSAGE);

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@example.com',
      }),
    );
  });

  it('fails with context when the injected Resend client returns an error', async () => {
    sendEmail.mockResolvedValue({
      error: {
        message: 'Invalid API key',
      },
    });
    const sender = new ResendEmailSender(resend, {
      fromEmail: 'noreply@example.com',
    });

    await expect(sender.send(TEST_EMAIL_MESSAGE)).rejects.toThrow(
      'Failed to send verification email through Resend: Invalid API key',
    );
  });
});
