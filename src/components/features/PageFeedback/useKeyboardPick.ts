'use client';

import { useEffect, useState } from 'react';

export interface KeyboardPick {
  focused: Element | null;
  picked: Element | null;
}

// Pointer picking is unreachable from the keyboard — here Tab moves the outline across the page's
// focusable elements, and Enter or Space picks the element instead of activating it.
export function useKeyboardPick(
  active: boolean,
  ignoreSelector: string,
): KeyboardPick {
  const [focused, setFocused] = useState<Element | null>(null);
  const [picked, setPicked] = useState<Element | null>(null);
  const [wasActive, setWasActive] = useState(active);

  if (wasActive !== active) {
    setWasActive(active);
    if (!active) {
      setFocused(null);
      setPicked(null);
    }
  }

  useEffect(() => {
    if (!active || picked !== null) return;
    function outsideWidget(target: EventTarget | null): Element | null {
      if (!(target instanceof Element) || target === document.body) return null;
      return target.closest(ignoreSelector) === null ? target : null;
    }
    function handleFocusIn(event: FocusEvent) {
      setFocused(outsideWidget(event.target));
    }
    // Captured on keydown: Enter on a link and Space on a button fire `click`, which the pointer
    // picker would read as a pick at point (0, 0).
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = outsideWidget(event.target);
      if (target === null) return;
      event.preventDefault();
      event.stopPropagation();
      setPicked(target);
    }
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [active, picked, ignoreSelector]);

  return { focused, picked };
}
