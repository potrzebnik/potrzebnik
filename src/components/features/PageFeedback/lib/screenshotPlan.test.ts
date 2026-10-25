import { describe, expect, it } from 'vitest';
import { FEEDBACK_SCREENSHOT_MAX_CHARS } from './contract';
import {
  computeScreenshotCrop,
  ENCODE_STEPS,
  fitScreenshot,
  planCapture,
  renderScale,
  SCREENSHOT_MAX_SIDE,
} from './screenshotPlan';

const viewport = { width: 1280, height: 800 };

function dataUrl(chars: number): string {
  const prefix = 'data:image/jpeg;base64,';
  return prefix + 'A'.repeat(chars - prefix.length);
}

describe('computeScreenshotCrop', () => {
  it('adds a margin around the element', () => {
    expect(
      computeScreenshotCrop(
        { x: 400, y: 300, width: 200, height: 100 },
        viewport,
      ),
    ).toEqual({
      x: 350,
      y: 250,
      width: 300,
      height: 200,
    });
  });

  it('clips the crop to the viewport', () => {
    const crop = computeScreenshotCrop(
      { x: -50, y: 700, width: 300, height: 300 },
      viewport,
    );
    expect(crop.x).toBe(0);
    expect(crop.y + crop.height).toBeLessThanOrEqual(viewport.height);
  });

  it('an element fully outside the viewport yields the whole viewport', () => {
    expect(
      computeScreenshotCrop({ x: 0, y: 2000, width: 50, height: 50 }, viewport),
    ).toEqual({
      x: 0,
      y: 0,
      ...viewport,
    });
  });
});

describe('planCapture', () => {
  const target = { x: 400, y: 300, width: 200, height: 100 };

  it('takes the nearest ancestor that contains the crop with its margin', () => {
    const tight = { x: 390, y: 290, width: 220, height: 120 };
    const section = { x: 0, y: 100, width: 1280, height: 600 };
    const page = { x: 0, y: -2000, width: 1280, height: 9000 };
    expect(planCapture([target, tight, section, page], viewport)).toEqual({
      index: 2,
      crop: { x: 350, y: 150, width: 300, height: 200 },
    });
  });

  it('skips an ancestor over the render limit and takes the element alone without a margin', () => {
    const page = { x: 0, y: -2000, width: 1280, height: 9000 };
    expect(planCapture([target, page], viewport)).toEqual({
      index: 0,
      crop: { x: 0, y: 0, width: 200, height: 100 },
    });
  });

  it('takes only the visible part of the element alone', () => {
    const partly = { x: 100, y: 600, width: 400, height: 400 };
    expect(planCapture([partly], viewport)).toEqual({
      index: 0,
      crop: { x: 0, y: 0, width: 400, height: 200 },
    });
  });

  it('returns null when nothing fits the limit or the element is not visible', () => {
    expect(
      planCapture([{ x: 0, y: 0, width: 5000, height: 9000 }], viewport),
    ).toBeNull();
    expect(
      planCapture([{ x: 0, y: 2000, width: 50, height: 50 }], viewport),
    ).toBeNull();
    expect(planCapture([], viewport)).toBeNull();
  });
});

describe('renderScale', () => {
  it('does not upscale a small crop and downscales a large one to the longer-side limit', () => {
    expect(renderScale({ x: 0, y: 0, width: 300, height: 200 })).toBe(1);
    expect(
      renderScale({ x: 0, y: 0, width: SCREENSHOT_MAX_SIDE * 2, height: 100 }),
    ).toBe(0.5);
  });
});

describe('fitScreenshot', () => {
  it('returns the first encode step that fits the contract limit', () => {
    const sizes = [
      FEEDBACK_SCREENSHOT_MAX_CHARS + 1,
      FEEDBACK_SCREENSHOT_MAX_CHARS - 10,
      100,
    ];
    const tried: number[] = [];
    const result = fitScreenshot((_step, index) => {
      tried.push(index);
      return dataUrl(sizes[index] ?? 100);
    });
    expect(result?.length).toBe(FEEDBACK_SCREENSHOT_MAX_CHARS - 10);
    expect(tried).toEqual([0, 1]);
  });

  it('returns undefined when no step fits the limit', () => {
    const tried: number[] = [];
    const result = fitScreenshot((_step, index) => {
      tried.push(index);
      return dataUrl(FEEDBACK_SCREENSHOT_MAX_CHARS + 1);
    });
    expect(result).toBeUndefined();
    expect(tried).toHaveLength(ENCODE_STEPS.length);
  });

  it('rejects output outside the contract format (an empty canvas yields `data:,`)', () => {
    expect(fitScreenshot(() => 'data:,')).toBeUndefined();
  });

  it('later steps never raise the scale and lower scale times quality', () => {
    for (let i = 1; i < ENCODE_STEPS.length; i++) {
      const [previous, current] = [ENCODE_STEPS[i - 1], ENCODE_STEPS[i]];
      expect(current.scale).toBeLessThanOrEqual(previous.scale);
      expect(current.scale * current.quality).toBeLessThan(
        previous.scale * previous.quality,
      );
    }
  });
});
