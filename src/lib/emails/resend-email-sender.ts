import { Resend } from 'resend';

import type { AuthEmailMessage, EmailSender } from './email-sender';

type ResendEmailSendInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
};

type ResendEmailSendResult = {
  error?: {
    message: string;
  } | null;
};

export type ResendEmailClient = {
  emails: {
    send(message: ResendEmailSendInput): Promise<ResendEmailSendResult>;
  };
};

export type ResendEmailSenderConfig = {
  fromEmail: string;
  fromName?: string;
};

export type CreateResendEmailSenderConfig = ResendEmailSenderConfig & {
  resendApiKey: string;
};

function formatFromEmail({ fromEmail, fromName }: ResendEmailSenderConfig) {
  return fromName ? `${fromName} <${fromEmail}>` : fromEmail;
}

export class ResendEmailSender implements EmailSender {
  private readonly from: string;

  constructor(
    private readonly resend: ResendEmailClient,
    config: ResendEmailSenderConfig,
  ) {
    this.from = formatFromEmail(config);
  }

  async send(message: AuthEmailMessage): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) {
      throw new Error(
        `Failed to send ${message.purpose} email through Resend: ${error.message}`,
      );
    }
  }
}

export function createResendEmailSender({
  resendApiKey,
  fromEmail,
  fromName,
}: CreateResendEmailSenderConfig): ResendEmailSender {
  return new ResendEmailSender(new Resend(resendApiKey), {
    fromEmail,
    fromName,
  });
}
