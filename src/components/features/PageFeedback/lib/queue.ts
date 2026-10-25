import {
  FEEDBACK_BATCH_MAX_CHARS,
  FEEDBACK_ITEMS_MAX,
  type FeedbackBatchContent,
  type FeedbackItemContent,
  FeedbackItemSchema,
} from './contract';
import {
  readStored,
  removeStored,
  type StorageLike,
  writeStored,
} from './activation';

export const QUEUE_STORAGE_KEY = 'agency-feedback:queue';

export interface QueuedFeedbackItem {
  id: string;
  item: FeedbackItemContent;
}

function newId(): string {
  const random = globalThis.crypto?.randomUUID?.();
  return (
    random ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

export function queueEntry(item: FeedbackItemContent): QueuedFeedbackItem {
  return { id: newId(), item };
}

export function parseQueue(raw: string | null): QueuedFeedbackItem[] {
  if (raw === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  // The queue may have been written by an older widget version — an entry that no longer matches
  // the contract is dropped on its own instead of failing the whole batch with a 400.
  return parsed.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) return [];
    const { id, item } = entry as { id?: unknown; item?: unknown };
    const result = FeedbackItemSchema.safeParse(item);
    return typeof id === 'string' && result.success
      ? [{ id, item: result.data }]
      : [];
  });
}

export function loadQueue(storage: StorageLike | null): QueuedFeedbackItem[] {
  return parseQueue(readStored(storage, QUEUE_STORAGE_KEY));
}

// The queue lives in the site's own `localStorage`, and a full store throws `QuotaExceededError`
// in THE SITE'S code (cart, consent). Five screenshots of at most 200 000 chars each are about a
// fifth of the usual 5 M chars per origin; notes without a screenshot weigh a few kB.
export const QUEUE_SCREENSHOTS_MAX = 5;

const countScreenshots = (queue: readonly QueuedFeedbackItem[]) =>
  queue.filter((entry) => entry.item.screenshot !== undefined).length;

export function hasScreenshotSlot(
  queue: readonly QueuedFeedbackItem[],
): boolean {
  return countScreenshots(queue) < QUEUE_SCREENSHOTS_MAX;
}

export function limitScreenshots(
  queue: readonly QueuedFeedbackItem[],
): QueuedFeedbackItem[] {
  let kept = 0;
  return queue.map((entry) => {
    if (entry.item.screenshot === undefined) return entry;
    kept += 1;
    if (kept <= QUEUE_SCREENSHOTS_MAX) return entry;
    const item = { ...entry.item };
    delete item.screenshot;
    return { ...entry, item };
  });
}

export function saveQueue(
  storage: StorageLike | null,
  queue: readonly QueuedFeedbackItem[],
): boolean {
  if (queue.length === 0) return removeStored(storage, QUEUE_STORAGE_KEY);
  return writeStored(
    storage,
    QUEUE_STORAGE_KEY,
    JSON.stringify(limitScreenshots(queue)),
  );
}

// `submitFeedback` sends batches in order from the start of the queue, so `sentCount` marks a
// prefix of the snapshot; entries are removed by id, not index, because the queue may have
// changed while the request was in flight.
export function sentEntryIds(
  snapshot: readonly QueuedFeedbackItem[],
  sentCount: number,
): string[] {
  return snapshot.slice(0, Math.max(0, sentCount)).map((entry) => entry.id);
}

export function withoutEntries(
  queue: readonly QueuedFeedbackItem[],
  ids: readonly string[],
): QueuedFeedbackItem[] {
  return queue.filter((entry) => !ids.includes(entry.id));
}

export function splitIntoBatches(
  token: string,
  items: readonly FeedbackItemContent[],
): FeedbackBatchContent[] {
  const batches: FeedbackBatchContent[] = [];
  let current: FeedbackItemContent[] = [];
  for (const item of items) {
    const candidate = [...current, item];
    const tooLong =
      JSON.stringify({ token, items: candidate }).length >
      FEEDBACK_BATCH_MAX_CHARS;
    if (
      current.length > 0 &&
      (candidate.length > FEEDBACK_ITEMS_MAX || tooLong)
    ) {
      batches.push({ token, items: current });
      current = [item];
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) batches.push({ token, items: current });
  return batches;
}
