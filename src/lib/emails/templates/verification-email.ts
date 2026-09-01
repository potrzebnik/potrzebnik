import type { AuthEmailMessage } from '../email-sender';
import { escapeHtml } from './shared';

export function createVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}): AuthEmailMessage {
  const escapedUrl = escapeHtml(url);

  return {
    purpose: 'verification',
    to,
    subject: 'Verify your Potrzebnik email',
    html: `<p>Verify your email address by opening this link:</p><p><a href="${escapedUrl}">${escapedUrl}</a></p>`,
    text: `Verify your email address by opening this link: ${url}`,
  };
}
