'use client';

import { useEffect, useState } from 'react';

const PICKER_MOUSE_EVENTS = [
  'pointerdown',
  'mousedown',
  'mouseup',
  'click',
] as const;

function elementUnderPointer(
  x: number,
  y: number,
  ignoreSelector: string,
): Element | null {
  const element = document.elementFromPoint(x, y);
  if (element === null || element.closest(ignoreSelector) !== null) return null;
  return element;
}

// A keyboard-activated click (Enter on the widget's own button) reports clientX/clientY as 0, so
// the point alone would resolve to whatever page element sits in the top-left corner.
function isInsideWidget(target: EventTarget | null, ignoreSelector: string) {
  return target instanceof Element && target.closest(ignoreSelector) !== null;
}

function keepEventFromPage(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

export interface PointerPick {
  hovered: Element | null;
  frozen: Element | null;
}

export function usePointerPick(
  active: boolean,
  onExit: () => void,
  ignoreSelector: string,
): PointerPick {
  const [hovered, setHovered] = useState<Element | null>(null);
  const [frozen, setFrozen] = useState<Element | null>(null);
  const [wasActive, setWasActive] = useState(active);

  if (wasActive !== active) {
    setWasActive(active);
    if (!active) {
      setHovered(null);
      setFrozen(null);
    }
  }

  useEffect(() => {
    if (!active) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      keepEventFromPage(event);
      onExit();
    }
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [active, onExit]);

  useEffect(() => {
    if (!active || frozen !== null) return;

    function handlePointerMove(event: PointerEvent) {
      setHovered(
        elementUnderPointer(event.clientX, event.clientY, ignoreSelector),
      );
    }
    // All four events are captured, not just `click`: the page underneath often reacts on
    // `pointerdown` already, so picking would otherwise trigger its action too. Alt passes through.
    function handlePickerMouseEvent(event: Event) {
      const mouse = event as MouseEvent;
      if (mouse.altKey || isInsideWidget(event.target, ignoreSelector)) return;
      const picked = elementUnderPointer(
        mouse.clientX,
        mouse.clientY,
        ignoreSelector,
      );
      if (picked === null) return;
      keepEventFromPage(event);
      if (event.type === 'click') setFrozen(picked);
    }

    document.addEventListener('pointermove', handlePointerMove, true);
    for (const type of PICKER_MOUSE_EVENTS) {
      document.addEventListener(type, handlePickerMouseEvent, true);
    }
    return () => {
      document.removeEventListener('pointermove', handlePointerMove, true);
      for (const type of PICKER_MOUSE_EVENTS) {
        document.removeEventListener(type, handlePickerMouseEvent, true);
      }
    };
  }, [active, frozen, ignoreSelector]);

  useEffect(() => {
    if (!active || frozen !== null) return;
    const { style } = document.body;
    const previousCursor = style.cursor;
    const previousUserSelect = style.userSelect;
    style.cursor = 'crosshair';
    style.userSelect = 'none';
    return () => {
      style.cursor = previousCursor;
      style.userSelect = previousUserSelect;
    };
  }, [active, frozen]);

  return { hovered, frozen };
}
