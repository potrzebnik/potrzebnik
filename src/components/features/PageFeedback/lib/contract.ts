import { z } from 'zod';

export const FEEDBACK_KINDS = [
  'text',
  'remove',
  'move',
  'image',
  'other',
] as const;

export const FEEDBACK_ITEMS_MAX = 50;
export const FEEDBACK_NOTE_MAX = 2000;
export const FEEDBACK_SELECTOR_MAX = 1000;
export const FEEDBACK_PATHNAME_MAX = 2048;
export const FEEDBACK_ELEMENT_TEXT_MAX = 500;
export const FEEDBACK_SCREENSHOT_MAX_CHARS = 200_000;
export const FEEDBACK_BATCH_MAX_CHARS = 1_000_000;

export const FEEDBACK_TOKEN_PATTERN = /^fb_[A-Za-z0-9_-]{43}$/;

const SCREENSHOT_DATA_URL =
  /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

// Unknown keys are stripped, not rejected: the widget and the receiving endpoint ship on separate
// schedules, so a strict schema would drop a whole batch the moment the widget gains a field.
export const FeedbackItemSchema = z.object({
  kind: z.enum(FEEDBACK_KINDS),
  note: z.string().trim().min(1).max(FEEDBACK_NOTE_MAX),
  pathname: z.string().startsWith('/').max(FEEDBACK_PATHNAME_MAX),
  selector: z.string().min(1).max(FEEDBACK_SELECTOR_MAX),
  // Trimmed rather than rejected: a section's text can be arbitrarily long and only serves to
  // recognise the element, so one click on a large block must not fail the whole batch.
  elementText: z
    .string()
    .max(FEEDBACK_BATCH_MAX_CHARS)
    .transform((text) => text.trim().slice(0, FEEDBACK_ELEMENT_TEXT_MAX))
    .optional(),
  // The shared endpoint also serves sites that map elements to source files; this widget never
  // sends these two fields, but the schema keeps them so both payloads validate the same way.
  sourceId: z
    .string()
    .regex(/^[0-9a-f]{10}$/)
    .optional(),
  buildSha: z
    .string()
    .regex(/^[0-9a-f]{7,40}$/i)
    .optional(),
  viewport: z.object({
    width: z.number().int().min(1).max(20_000),
    height: z.number().int().min(1).max(20_000),
  }),
  screenshot: z
    .string()
    .max(FEEDBACK_SCREENSHOT_MAX_CHARS)
    .regex(SCREENSHOT_DATA_URL)
    .optional(),
});

export const FeedbackBatchSchema = z
  .object({
    token: z.string().min(1).max(200),
    items: z.array(FeedbackItemSchema).min(1).max(FEEDBACK_ITEMS_MAX),
  })
  .refine((batch) => JSON.stringify(batch).length <= FEEDBACK_BATCH_MAX_CHARS, {
    message: `Partia uwag przekracza ${FEEDBACK_BATCH_MAX_CHARS} znaków — wyślij mniej zrzutów naraz.`,
  });

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export type FeedbackItemContent = z.output<typeof FeedbackItemSchema>;
export type FeedbackBatchContent = z.output<typeof FeedbackBatchSchema>;
