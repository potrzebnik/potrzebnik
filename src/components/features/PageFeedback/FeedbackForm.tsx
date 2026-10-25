'use client';

import { type FormEvent, useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import {
  FEEDBACK_KINDS,
  FEEDBACK_NOTE_MAX,
  type FeedbackKind,
} from './lib/contract';

export const FEEDBACK_KIND_LABELS: Record<FeedbackKind, string> = {
  text: 'Zmień tekst',
  remove: 'Usuń',
  move: 'Przesuń',
  image: 'Zmień grafikę',
  other: 'Inne',
};

const FIELD_CLASS =
  'border-page-feedback-border bg-page-feedback-bg text-page-feedback-fg focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-page-feedback-danger w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

export interface FeedbackFormProps {
  elementLabel: string;
  onAdd: (kind: FeedbackKind, note: string) => Promise<void>;
  onCancel: () => void;
}

export function FeedbackForm({
  elementLabel,
  onAdd,
  onCancel,
}: FeedbackFormProps) {
  const id = useId();
  const [kind, setKind] = useState<FeedbackKind>('text');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [adding, setAdding] = useState(false);
  const kindRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    kindRef.current?.focus();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (adding) return;
    if (note.trim().length === 0) {
      setError('Dopisz, co zmienić.');
      return;
    }
    setAdding(true);
    try {
      await onAdd(kind, note.trim());
    } finally {
      setAdding(false);
    }
  }

  const kindId = `${id}-kind`;
  const noteId = `${id}-note`;
  const errorId = `${id}-note-error`;

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3"
      aria-label="Nowa uwaga"
      aria-busy={adding}
    >
      <p
        className="text-page-feedback-fg-muted truncate text-xs"
        title={elementLabel}
      >
        Element: {elementLabel}
      </p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={kindId} className="text-sm font-medium">
          Typ uwagi
        </label>
        <select
          ref={kindRef}
          id={kindId}
          value={kind}
          onChange={(event) => setKind(event.target.value as FeedbackKind)}
          className={FIELD_CLASS}
        >
          {FEEDBACK_KINDS.map((value) => (
            <option key={value} value={value}>
              {FEEDBACK_KIND_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={noteId} className="text-sm font-medium">
          Notatka
        </label>
        <textarea
          id={noteId}
          rows={3}
          required
          maxLength={FEEDBACK_NOTE_MAX}
          value={note}
          aria-invalid={error !== undefined || undefined}
          aria-describedby={error !== undefined ? errorId : undefined}
          onChange={(event) => {
            setNote(event.target.value);
            setError(undefined);
          }}
          className={FIELD_CLASS}
        />
        {error !== undefined && (
          <p id={errorId} className="text-page-feedback-danger text-xs">
            {error}
          </p>
        )}
      </div>
      <p role="status" className="sr-only">
        {adding ? 'Robię zrzut fragmentu strony do uwagi.' : ''}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Anuluj
        </Button>
        {/* `disabled` on the focused button would drop focus to <body> for the duration of the
            screenshot; the `adding` guard in `submit` stops a second submit instead. */}
        <Button
          type="submit"
          aria-disabled={adding || undefined}
          className="aria-disabled:cursor-wait aria-disabled:opacity-50"
        >
          {adding ? 'Robię zrzut…' : 'Dodaj'}
        </Button>
      </div>
    </form>
  );
}
