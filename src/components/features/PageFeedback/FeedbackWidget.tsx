'use client';

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';

import { FeedbackAlert } from './FeedbackAlert';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackQueuePanel } from './FeedbackQueuePanel';
import { PickHighlight } from './PickHighlight';
import {
  browserStorage,
  removeStored,
  TOKEN_STORAGE_KEY,
} from './lib/activation';
import type { FeedbackKind } from './lib/contract';
import { buildSelector, describePickedElement } from './lib/describeElement';
import { rectOfElement } from './lib/labelPlacement';
import {
  hasScreenshotSlot,
  limitScreenshots,
  loadQueue,
  type QueuedFeedbackItem,
  queueEntry,
  saveQueue,
  withoutEntries,
} from './lib/queue';
import { captureScreenshot } from './lib/screenshot';
import { FEEDBACK_UI_ATTRIBUTE, FEEDBACK_UI_SELECTOR } from './lib/uiAttribute';
import { useKeyboardPick } from './useKeyboardPick';
import { usePointerPick } from './usePointerPick';

const UI_MARK = { [FEEDBACK_UI_ATTRIBUTE]: '' };

export interface FeedbackWidgetProps {
  token: string;
  endpoint: string;
  onEnd: () => void;
}

export default function FeedbackWidget({
  token,
  endpoint,
  onEnd,
}: FeedbackWidgetProps) {
  const [storage] = useState(browserStorage);
  const [queue, setQueue] = useState(() => loadQueue(storage));
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const pickRound = useRef(0);
  const latestQueue = useRef(queue);
  const launcherId = useId();

  const stopPicking = useCallback(() => {
    pickRound.current += 1;
    setPicking(false);
    setOpen(true);
  }, []);
  const pointer = usePointerPick(picking, stopPicking, FEEDBACK_UI_SELECTOR);
  const keyboard = useKeyboardPick(picking, FEEDBACK_UI_SELECTOR);
  const target = pointer.frozen ?? keyboard.picked;
  const outlined = target ?? pointer.hovered ?? keyboard.focused;

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  function commitQueue(
    update: (previous: QueuedFeedbackItem[]) => QueuedFeedbackItem[],
  ) {
    const next = update(latestQueue.current);
    latestQueue.current = next;
    setQueue(next);
    setSaveFailed(!saveQueue(storage, next));
  }

  async function add(kind: FeedbackKind, note: string) {
    if (target === null) return;
    const round = pickRound.current;
    const picked = describePickedElement(target, {
      pathname: window.location.pathname,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });
    const screenshot = hasScreenshotSlot(queue)
      ? await captureScreenshot(target, {
          ignoreSelector: FEEDBACK_UI_SELECTOR,
        })
      : undefined;
    // Esc in the picker and "Anuluj" both stay live during the screenshot — a note cancelled
    // while awaiting must not come back into the queue afterwards.
    if (pickRound.current !== round) return;
    commitQueue((previous) =>
      limitScreenshots([
        ...previous,
        queueEntry({ ...picked, kind, note, screenshot }),
      ]),
    );
    stopPicking();
  }

  function end() {
    const pending =
      queue.length > 0
        ? ` Niewysłane uwagi (${queue.length}) zostaną usunięte.`
        : '';
    if (
      !window.confirm(`Zakończyć zgłaszanie uwag w tej przeglądarce?${pending}`)
    )
      return;
    removeStored(storage, TOKEN_STORAGE_KEY);
    saveQueue(storage, []);
    onEnd();
  }

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || picking) return;
    setOpen(false);
    document.getElementById(launcherId)?.focus();
  }

  return (
    <>
      <div
        {...UI_MARK}
        className="text-page-feedback-fg pointer-events-none fixed inset-x-4 bottom-4 z-[142] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      >
        {(open || target !== null) && (
          <section
            ref={panelRef}
            tabIndex={-1}
            aria-label="Uwagi do strony"
            onKeyDown={closeOnEscape}
            className="border-page-feedback-border bg-page-feedback-bg pointer-events-auto w-full rounded-lg border p-3 shadow-lg outline-none"
          >
            {target !== null ? (
              <FeedbackForm
                elementLabel={buildSelector(target)}
                onAdd={add}
                onCancel={stopPicking}
              />
            ) : (
              <FeedbackQueuePanel
                queue={queue}
                token={token}
                endpoint={endpoint}
                onRemove={(id) =>
                  commitQueue((previous) =>
                    previous.filter((entry) => entry.id !== id),
                  )
                }
                onSent={(ids) =>
                  commitQueue((previous) => withoutEntries(previous, ids))
                }
                onPick={() => {
                  setOpen(false);
                  setPicking(true);
                }}
                onEnd={end}
              />
            )}
            {saveFailed && (
              <FeedbackAlert intent="warning" className="mt-3">
                Przeglądarka nie pozwala zapisać kolejki — ostatnio dodane uwagi
                znikną po odświeżeniu strony. Wyślij je teraz.
              </FeedbackAlert>
            )}
          </section>
        )}
        {picking && target === null && (
          <p
            role="status"
            className="border-page-feedback-border bg-page-feedback-bg w-full rounded-lg border px-3 py-2 text-sm shadow-lg"
          >
            Kliknij element, który chcesz skomentować. Z klawiatury: Tab i
            Enter. Esc kończy, Alt+klik przepuszcza klik do strony.
          </p>
        )}
        <Button
          id={launcherId}
          className="pointer-events-auto"
          aria-expanded={open}
          onClick={() =>
            picking ? stopPicking() : setOpen((previous) => !previous)
          }
        >
          Uwagi ({queue.length})
        </Button>
      </div>
      {picking && outlined !== null && (
        <PickHighlight
          rect={rectOfElement(outlined)}
          label={outlined.tagName.toLowerCase()}
          frozen={target !== null}
        />
      )}
    </>
  );
}
