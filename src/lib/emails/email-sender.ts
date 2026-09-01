export type AuthEmailPurpose = 'verification' | 'password-reset';

export type AuthEmailMessage = {
  purpose: AuthEmailPurpose;
  to: string;
  subject: string;
  html: string;
  text: string;
};

export interface EmailSender {
  send(message: AuthEmailMessage): Promise<void>;
}
