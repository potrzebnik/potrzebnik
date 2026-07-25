import type { AuthEmailMessage } from '@/lib/emails';
import { escapeHtml } from './shared';

export function createPasswordResetEmail({
  to,
  url,
  token,
}: {
  to: string;
  url: string;
  token: string;
}): AuthEmailMessage {
  const escapedUrl = escapeHtml(url);

  return {
    purpose: 'password-reset',
    to,
    url,
    token,
    subject: 'Reset your Potrzebnik password',
    html: `<p>Reset your password by opening this link:</p><p><a href="${escapedUrl}">${escapedUrl}</a></p>`,
    text: `Reset your password by opening this link: ${url}`,
  };
}
