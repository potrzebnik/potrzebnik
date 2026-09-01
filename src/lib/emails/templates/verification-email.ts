import type { AuthEmailMessage } from '../email-sender';
import { escapeHtml } from './shared';

export function createVerificationEmail({
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
    purpose: 'verification',
    to,
    url,
    token,
    subject: 'Verify your Potrzebnik email',
    html: `<p>Verify your email address by opening this link:</p><p><a href="${escapedUrl}">${escapedUrl}</a></p>`,
    text: `Verify your email address by opening this link: ${url}`,
  };
}
