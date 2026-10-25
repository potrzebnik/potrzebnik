import { cn } from '@/lib/utils';

import type { SubmitIntent } from './lib/submit';

const INTENT_CLASSES: Record<SubmitIntent, string> = {
  success: 'bg-page-feedback-success text-page-feedback-alert-fg',
  warning: 'bg-page-feedback-warning text-page-feedback-alert-fg',
  danger: 'bg-page-feedback-danger text-page-feedback-danger-fg',
};

export interface FeedbackAlertProps {
  intent: SubmitIntent;
  children: React.ReactNode;
  className?: string;
}

export function FeedbackAlert({
  intent,
  children,
  className,
}: FeedbackAlertProps) {
  return (
    <div
      className={cn(
        'border-page-feedback-border rounded-md border px-3 py-2 text-sm',
        INTENT_CLASSES[intent],
        className,
      )}
    >
      {children}
    </div>
  );
}
