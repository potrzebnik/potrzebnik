export interface PickRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const LABEL_HEIGHT = 24;
const LABEL_MIN_WIDTH = 200;
const LABEL_GAP = 4;
const LABEL_MARGIN = 8;
const LABEL_FLOOR_WIDTH = 96;

export interface LabelPlacement {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  maxWidth: number;
}

export function rectOfElement(element: Element): PickRect {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left, y: top, width, height };
}

export function labelPlacement(
  rect: PickRect,
  viewportWidth: number,
): LabelPlacement {
  const spaceRight = viewportWidth - rect.x;
  const vertical =
    rect.y > LABEL_HEIGHT + LABEL_GAP
      ? { bottom: rect.height + LABEL_GAP }
      : { top: rect.height + LABEL_GAP };

  // Near the right edge the label anchors to the outline's right side and grows leftwards, so its
  // limit is measured from the element's right edge, not from the free space after it.
  if (spaceRight < LABEL_MIN_WIDTH) {
    return {
      ...vertical,
      right: 0,
      maxWidth: Math.max(rect.x + rect.width - LABEL_MARGIN, LABEL_FLOOR_WIDTH),
    };
  }
  return { ...vertical, left: 0, maxWidth: spaceRight - LABEL_MARGIN };
}
