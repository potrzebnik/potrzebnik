import { describe, expect, it } from 'vitest';

import {
  FEEDBACK_BATCH_MAX_CHARS,
  FEEDBACK_ELEMENT_TEXT_MAX,
  FEEDBACK_ITEMS_MAX,
  FEEDBACK_KINDS,
  FEEDBACK_SCREENSHOT_MAX_CHARS,
  FeedbackBatchSchema,
  FeedbackItemSchema,
} from './contract';

const TOKEN = `fb_${'a'.repeat(43)}`;

function note(overrides: Record<string, unknown> = {}) {
  return {
    kind: 'text',
    note: 'Zmień nagłówek na krótszy',
    pathname: '/oferta',
    selector: 'main > h1',
    elementText: 'Nasza oferta',
    viewport: { width: 1440, height: 900 },
    ...overrides,
  };
}

function screenshot(base64Chars: number, mime = 'image/jpeg') {
  return `data:${mime};base64,${'A'.repeat(base64Chars)}`;
}

const accepts = (value: unknown) => FeedbackItemSchema.safeParse(value).success;

describe('FeedbackItemSchema', () => {
  it('accepts a minimal note and the optional sourceId, buildSha and screenshot', () => {
    expect(accepts(note())).toBe(true);
    expect(
      accepts(
        note({
          sourceId: '0a1b2c3d4e',
          buildSha: '46c41b7b',
          screenshot: screenshot(1000, 'image/png'),
        }),
      ),
    ).toBe(true);
  });

  it('knows exactly five kinds', () => {
    expect(FEEDBACK_KINDS).toEqual([
      'text',
      'remove',
      'move',
      'image',
      'other',
    ]);
    expect(accepts(note({ kind: 'delete' }))).toBe(false);
  });

  it('rejects an empty or whitespace-only note and one over 2000 chars', () => {
    expect(accepts(note({ note: '' }))).toBe(false);
    expect(accepts(note({ note: '   ' }))).toBe(false);
    expect(accepts(note({ note: 'x'.repeat(2000) }))).toBe(true);
    expect(accepts(note({ note: 'x'.repeat(2001) }))).toBe(false);
  });

  it('trims element text instead of rejecting the note', () => {
    const parsed = FeedbackItemSchema.parse(
      note({ elementText: `  ${'y'.repeat(5000)}  ` }),
    );
    expect(parsed.elementText).toHaveLength(FEEDBACK_ELEMENT_TEXT_MAX);
  });

  it('rejects an over-long selector and a pathname without a leading slash', () => {
    expect(accepts(note({ selector: 'a'.repeat(1001) }))).toBe(false);
    expect(accepts(note({ pathname: 'oferta' }))).toBe(false);
    expect(accepts(note({ pathname: 'https://example.com/oferta' }))).toBe(
      false,
    );
  });

  it('screenshot: only a jpeg/png/webp data URL within the limit', () => {
    expect(accepts(note({ screenshot: screenshot(10, 'image/webp') }))).toBe(
      true,
    );
    expect(accepts(note({ screenshot: screenshot(10, 'image/svg+xml') }))).toBe(
      false,
    );
    expect(accepts(note({ screenshot: 'https://example.com/image.png' }))).toBe(
      false,
    );
    const atLimit = screenshot(
      FEEDBACK_SCREENSHOT_MAX_CHARS - 'data:image/jpeg;base64,'.length,
    );
    expect(accepts(note({ screenshot: atLimit }))).toBe(true);
    expect(accepts(note({ screenshot: `${atLimit}A` }))).toBe(false);
  });

  it('keeps sourceId as exactly 10 lowercase hex chars and rejects a foreign buildSha', () => {
    expect(accepts(note({ sourceId: '0123456789' }))).toBe(true);
    for (const foreign of [
      '012345678',
      '0123456789a',
      'ABCDEF0123',
      '<script>',
      'src/A.tsx:3',
    ]) {
      expect(accepts(note({ sourceId: foreign })), foreign).toBe(false);
    }
    expect(accepts(note({ buildSha: 'not-a-sha' }))).toBe(false);
  });

  it('rejects a viewport outside a sensible range', () => {
    expect(accepts(note({ viewport: { width: 0, height: 900 } }))).toBe(false);
    expect(accepts(note({ viewport: { width: 1.5, height: 900 } }))).toBe(
      false,
    );
  });

  it('strips unknown keys instead of rejecting the note', () => {
    const parsed = FeedbackItemSchema.safeParse(note({ newField: 1 }));
    expect(parsed.success).toBe(true);
    expect(parsed.data).not.toHaveProperty('newField');
  });
});

describe('FeedbackBatchSchema', () => {
  const acceptsBatch = (value: unknown) =>
    FeedbackBatchSchema.safeParse(value).success;

  it('accepts a batch with a token and notes', () => {
    expect(acceptsBatch({ token: TOKEN, items: [note()] })).toBe(true);
  });

  it('rejects an empty batch and one of 51 notes, accepts 50', () => {
    expect(acceptsBatch({ token: TOKEN, items: [] })).toBe(false);
    const fifty = Array.from({ length: FEEDBACK_ITEMS_MAX }, () => note());
    expect(acceptsBatch({ token: TOKEN, items: fifty })).toBe(true);
    expect(acceptsBatch({ token: TOKEN, items: [...fifty, note()] })).toBe(
      false,
    );
    expect(FEEDBACK_ITEMS_MAX).toBe(50);
  });

  it('rejects a batch without a token', () => {
    expect(acceptsBatch({ items: [note()] })).toBe(false);
    expect(acceptsBatch({ token: '', items: [note()] })).toBe(false);
  });

  it('rejects a batch whose screenshots together exceed the total limit', () => {
    const large = screenshot(FEEDBACK_SCREENSHOT_MAX_CHARS - 100);
    const count =
      Math.ceil(FEEDBACK_BATCH_MAX_CHARS / FEEDBACK_SCREENSHOT_MAX_CHARS) + 1;
    const items = Array.from({ length: count }, () =>
      note({ screenshot: large }),
    );
    expect(acceptsBatch({ token: TOKEN, items })).toBe(false);
    expect(acceptsBatch({ token: TOKEN, items: items.slice(0, 2) })).toBe(true);
  });
});
