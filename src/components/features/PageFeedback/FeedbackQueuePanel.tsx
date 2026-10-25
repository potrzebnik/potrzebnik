'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { FeedbackAlert } from './FeedbackAlert';
import { FEEDBACK_KIND_LABELS } from './FeedbackForm';
import { type QueuedFeedbackItem, sentEntryIds } from './lib/queue';
import {
  type SubmitMessage,
  submitFeedback,
  submitMessage,
} from './lib/submit';

export interface FeedbackQueuePanelProps {
  queue: readonly QueuedFeedbackItem[];
  token: string;
  endpoint: string;
  onRemove: (id: string) => void;
  onSent: (ids: readonly string[]) => void;
  onPick: () => void;
  onEnd: () => void;
}

export function FeedbackQueuePanel({
  queue,
  token,
  endpoint,
  onRemove,
  onSent,
  onPick,
  onEnd,
}: FeedbackQueuePanelProps) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SubmitMessage | null>(null);

  async function sendAll() {
    setSending(true);
    setResult(null);
    const snapshot = [...queue];
    const outcome = await submitFeedback({
      endpoint,
      token,
      items: snapshot.map((entry) => entry.item),
    });
    if (outcome.sentCount > 0)
      onSent(sentEntryIds(snapshot, outcome.sentCount));
    setResult(submitMessage(outcome));
    setSending(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Uwagi ({queue.length})</h2>
      {queue.length === 0 ? (
        <p className="text-page-feedback-fg-muted text-sm">
          Brak uwag. Wskaż element strony, żeby dodać pierwszą.
        </p>
      ) : (
        <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {queue.map(({ id, item }) => (
            <li
              key={id}
              className="border-page-feedback-border flex items-start gap-2 rounded-md border p-2"
            >
              <div className="min-w-0 flex-1">
                <Badge variant="outline">
                  {FEEDBACK_KIND_LABELS[item.kind]}
                </Badge>
                <p className="mt-1 text-sm break-words">{item.note}</p>
                <p
                  className="text-page-feedback-fg-muted truncate text-xs"
                  title={item.pathname}
                >
                  {item.pathname}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                aria-label={`Usuń uwagę: ${item.note.slice(0, 60)}`}
              >
                Usuń
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div aria-live="polite" role="status">
        {result !== null && (
          <FeedbackAlert intent={result.intent}>{result.text}</FeedbackAlert>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onEnd}>
          Zakończ uwagi
        </Button>
        <Button variant="outline" onClick={onPick}>
          Wskaż element
        </Button>
        <Button onClick={sendAll} disabled={sending || queue.length === 0}>
          {sending ? 'Wysyłanie…' : 'Wyślij wszystkie'}
        </Button>
      </div>
    </div>
  );
}
