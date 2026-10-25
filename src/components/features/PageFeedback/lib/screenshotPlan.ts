import { FeedbackItemSchema } from './contract';

export interface CaptureRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureViewport {
  width: number;
  height: number;
}

export interface CapturePlan {
  index: number;
  crop: CaptureRect;
}

export interface EncodeStep {
  scale: number;
  quality: number;
}

const MARGIN_RATIO = 0.25;
const MIN_MARGIN = 24;
const MAX_MARGIN = 160;
const MIN_SIZE = 120;
// The library rasterises the WHOLE node, not its visible part — a page-long ancestor would produce
// a canvas over the browser limit (iOS ~16 Mpx) and seconds of work on a weak phone.
const MAX_RENDER_AREA_IN_VIEWPORTS = 4;
const CONTAINS_TOLERANCE = 1;
export const SCREENSHOT_MAX_SIDE = 1600;

export const ENCODE_STEPS: readonly EncodeStep[] = [
  { scale: 1, quality: 0.8 },
  { scale: 1, quality: 0.6 },
  { scale: 0.6, quality: 0.6 },
  { scale: 0.4, quality: 0.5 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computeScreenshotCrop(
  rect: CaptureRect,
  viewport: CaptureViewport,
): CaptureRect {
  const margin = clamp(
    MARGIN_RATIO * Math.max(rect.width, rect.height),
    MIN_MARGIN,
    MAX_MARGIN,
  );

  let left = clamp(rect.x - margin, 0, viewport.width);
  let right = clamp(rect.x + rect.width + margin, 0, viewport.width);
  let top = clamp(rect.y - margin, 0, viewport.height);
  let bottom = clamp(rect.y + rect.height + margin, 0, viewport.height);

  if (right - left <= 0 || bottom - top <= 0) {
    return { x: 0, y: 0, width: viewport.width, height: viewport.height };
  }

  if (right - left < MIN_SIZE) {
    const target = Math.min(MIN_SIZE, viewport.width);
    left = clamp(
      rect.x + rect.width / 2 - target / 2,
      0,
      Math.max(viewport.width - target, 0),
    );
    right = left + target;
  }
  if (bottom - top < MIN_SIZE) {
    const target = Math.min(MIN_SIZE, viewport.height);
    top = clamp(
      rect.y + rect.height / 2 - target / 2,
      0,
      Math.max(viewport.height - target, 0),
    );
    bottom = top + target;
  }

  const x = Math.floor(left);
  const y = Math.floor(top);
  return {
    x,
    y,
    width: Math.min(Math.ceil(right) - x, viewport.width - x),
    height: Math.min(Math.ceil(bottom) - y, viewport.height - y),
  };
}

function contains(outer: CaptureRect, inner: CaptureRect): boolean {
  return (
    inner.x >= outer.x - CONTAINS_TOLERANCE &&
    inner.y >= outer.y - CONTAINS_TOLERANCE &&
    inner.x + inner.width <= outer.x + outer.width + CONTAINS_TOLERANCE &&
    inner.y + inner.height <= outer.y + outer.height + CONTAINS_TOLERANCE
  );
}

function relativeTo(outer: CaptureRect, inner: CaptureRect): CaptureRect {
  const x = Math.max(0, Math.round(inner.x - outer.x));
  const y = Math.max(0, Math.round(inner.y - outer.y));
  return {
    x,
    y,
    width: Math.min(Math.round(inner.width), Math.round(outer.width) - x),
    height: Math.min(Math.round(inner.height), Math.round(outer.height) - y),
  };
}

function visiblePart(
  rect: CaptureRect,
  viewport: CaptureViewport,
): CaptureRect | null {
  const left = Math.max(rect.x, 0);
  const top = Math.max(rect.y, 0);
  const right = Math.min(rect.x + rect.width, viewport.width);
  const bottom = Math.min(rect.y + rect.height, viewport.height);
  if (right <= left || bottom <= top) return null;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function planCapture(
  targetThenAncestors: readonly CaptureRect[],
  viewport: CaptureViewport,
): CapturePlan | null {
  const [target] = targetThenAncestors;
  if (target === undefined) return null;
  const maxArea =
    MAX_RENDER_AREA_IN_VIEWPORTS * viewport.width * viewport.height;
  const fits = (rect: CaptureRect) => rect.width * rect.height <= maxArea;

  const crop = computeScreenshotCrop(target, viewport);
  const index = targetThenAncestors.findIndex(
    (rect) => fits(rect) && contains(rect, crop),
  );
  if (index !== -1)
    return { index, crop: relativeTo(targetThenAncestors[index], crop) };

  const visible = visiblePart(target, viewport);
  if (visible === null || !fits(target)) return null;
  return { index: 0, crop: relativeTo(target, visible) };
}

export function renderScale(crop: CaptureRect): number {
  return Math.min(1, SCREENSHOT_MAX_SIDE / Math.max(crop.width, crop.height));
}

export function fitScreenshot(
  encode: (step: EncodeStep, index: number) => string,
): string | undefined {
  for (const [index, step] of ENCODE_STEPS.entries()) {
    const encoded = encode(step, index);
    if (FeedbackItemSchema.shape.screenshot.safeParse(encoded).success)
      return encoded;
  }
  return undefined;
}
