import type { AuthEmailMessage } from '../email-sender';
import { escapeHtml } from './shared';

export function createPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}): AuthEmailMessage {
  const escapedUrl = escapeHtml(url);

  return {
    purpose: 'password-reset',
    to,
    subject: 'Reset your Potrzebnik password',
    html: `<p>Reset your password by opening this link:</p><p><a href="${escapedUrl}">${escapedUrl}</a></p>`,
    text: `Reset your password by opening this link: ${url}`,
  };
}
