import { describe, expect, it } from 'vitest';

import type { StorageLike } from './activation';
import {
  FEEDBACK_BATCH_MAX_CHARS,
  FEEDBACK_ITEMS_MAX,
  type FeedbackItemContent,
} from './contract';
import {
  hasScreenshotSlot,
  limitScreenshots,
  loadQueue,
  parseQueue,
  QUEUE_SCREENSHOTS_MAX,
  QUEUE_STORAGE_KEY,
  queueEntry,
  saveQueue,
  sentEntryIds,
  splitIntoBatches,
  withoutEntries,
} from './queue';

const TOKEN = `fb_${'a'.repeat(43)}`;

function note(
  overrides: Partial<FeedbackItemContent> = {},
): FeedbackItemContent {
  return {
    kind: 'text',
    note: 'zmień tekst',
    pathname: '/',
    selector: '#x',
    viewport: { width: 1280, height: 800 },
    ...overrides,
  };
}

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe('queue in storage', () => {
  it('survives a save and load in the same order', () => {
    const storage = memoryStorage();
    const queue = [
      queueEntry(note({ note: 'first' })),
      queueEntry(note({ note: 'second', kind: 'remove' })),
    ];

    expect(saveQueue(storage, queue)).toBe(true);
    expect(loadQueue(storage)).toEqual(queue);
  });

  it('an empty queue removes the key instead of leaving []', () => {
    const storage = memoryStorage();
    saveQueue(storage, [queueEntry(note())]);
    saveQueue(storage, []);

    expect(storage.data.has(QUEUE_STORAGE_KEY)).toBe(false);
  });

  it('drops contract-violating entries one by one and survives broken JSON', () => {
    const good = queueEntry(note());
    const raw = JSON.stringify([
      good,
      { id: 'b', item: { ...note(), kind: 'bad' } },
      { item: note() },
      null,
    ]);

    expect(parseQueue(raw)).toEqual([good]);
    expect(parseQueue('{not json')).toEqual([]);
    expect(parseQueue('{"a":1}')).toEqual([]);
  });

  it('storage that throws on write does not break the widget', () => {
    const failing: StorageLike = {
      getItem: () => {
        throw new Error('x');
      },
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
      removeItem: () => undefined,
    };

    expect(saveQueue(failing, [queueEntry(note())])).toBe(false);
    expect(loadQueue(failing)).toEqual([]);
  });
});

describe('screenshot limit in the queue', () => {
  const screenshot = 'data:image/jpeg;base64,AAAA';
  const withShot = (text: string) =>
    queueEntry(note({ note: text, screenshot }));
  const withoutShot = (text: string) => queueEntry(note({ note: text }));

  it('keeps screenshots on the oldest notes up to the limit and strips newer ones', () => {
    const queue = Array.from({ length: QUEUE_SCREENSHOTS_MAX + 2 }, (_, i) =>
      withShot(`n${i}`),
    );
    const limited = limitScreenshots(queue);

    expect(limited.map((entry) => entry.item.screenshot !== undefined)).toEqual(
      [...Array(QUEUE_SCREENSHOTS_MAX).fill(true), false, false],
    );
    expect(limited.map((entry) => [entry.id, entry.item.note])).toEqual(
      queue.map((entry) => [entry.id, entry.item.note]),
    );
  });

  it('notes without a screenshot take no slot', () => {
    const queue = [
      withoutShot('a'),
      withoutShot('b'),
      ...Array.from({ length: QUEUE_SCREENSHOTS_MAX }, (_, i) =>
        withShot(`n${i}`),
      ),
    ];

    expect(limitScreenshots(queue)).toEqual(queue);
    expect(limitScreenshots([...queue].reverse())).toEqual(
      [...queue].reverse(),
    );
  });

  it('a free screenshot slot disappears only at the full limit', () => {
    const full = Array.from({ length: QUEUE_SCREENSHOTS_MAX }, (_, i) =>
      withShot(`n${i}`),
    );

    expect(hasScreenshotSlot(full.slice(1))).toBe(true);
    expect(hasScreenshotSlot([...full.slice(1), withoutShot('x')])).toBe(true);
    expect(hasScreenshotSlot(full)).toBe(false);
  });

  it('what is written to the site storage never exceeds the screenshot limit', () => {
    const storage = memoryStorage();
    const queue = Array.from({ length: QUEUE_SCREENSHOTS_MAX + 3 }, (_, i) =>
      withShot(`n${i}`),
    );
    saveQueue(storage, queue);

    const stored = loadQueue(storage);
    expect(stored).toHaveLength(queue.length);
    expect(
      stored.filter((entry) => entry.item.screenshot !== undefined),
    ).toHaveLength(QUEUE_SCREENSHOTS_MAX);
  });
});

describe('removing sent notes', () => {
  it('a partial success removes only the prefix sent with 200, the rest stays queued', () => {
    const snapshot = Array.from({ length: 55 }, (_, index) =>
      queueEntry(note({ note: `n${index}` })),
    );
    const ids = sentEntryIds(snapshot, 50);

    expect(ids).toEqual(snapshot.slice(0, 50).map((entry) => entry.id));
    expect(withoutEntries(snapshot, ids)).toEqual(snapshot.slice(50));
  });

  it('nothing sent removes nothing', () => {
    const snapshot = [queueEntry(note()), queueEntry(note())];

    expect(sentEntryIds(snapshot, 0)).toEqual([]);
    expect(withoutEntries(snapshot, sentEntryIds(snapshot, 0))).toEqual(
      snapshot,
    );
  });

  it('removes by id, so a note added mid-send stays and a removed one does not return', () => {
    const [a, b, c] = [
      queueEntry(note()),
      queueEntry(note()),
      queueEntry(note()),
    ];
    const ids = sentEntryIds([a, b], 2);

    expect(withoutEntries([b, c], ids)).toEqual([c]);
  });
});

describe('splitIntoBatches', () => {
  it('60 notes are two batches split by the item limit', () => {
    const items = Array.from({ length: 60 }, (_, index) =>
      note({ note: `note ${index}` }),
    );
    const batches = splitIntoBatches(TOKEN, items);

    expect(batches.map((batch) => batch.items.length)).toEqual([
      FEEDBACK_ITEMS_MAX,
      10,
    ]);
    expect(batches.flatMap((batch) => batch.items)).toEqual(items);
    expect(batches.every((batch) => batch.token === TOKEN)).toBe(true);
  });

  it('splits by the character limit of the whole batch', () => {
    const screenshot = `data:image/jpeg;base64,${'A'.repeat(190_000)}`;
    const items = Array.from({ length: 7 }, () => note({ screenshot }));
    const batches = splitIntoBatches(TOKEN, items);

    expect(batches.length).toBe(2);
    for (const batch of batches)
      expect(JSON.stringify(batch).length).toBeLessThanOrEqual(
        FEEDBACK_BATCH_MAX_CHARS,
      );
  });

  it('a few notes fit into one batch', () => {
    expect(splitIntoBatches(TOKEN, [note(), note()])).toHaveLength(1);
    expect(splitIntoBatches(TOKEN, [])).toEqual([]);
  });
});
