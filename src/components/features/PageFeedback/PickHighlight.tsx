'use client';

import { cn } from '@/lib/utils';

import { labelPlacement, type PickRect } from './lib/labelPlacement';
import { FEEDBACK_UI_ATTRIBUTE } from './lib/uiAttribute';

export interface PickHighlightProps {
  rect: PickRect;
  label: string;
  frozen: boolean;
}

export function PickHighlight({ rect, label, frozen }: PickHighlightProps) {
  return (
    <div
      {...{ [FEEDBACK_UI_ATTRIBUTE]: '' }}
      aria-hidden="true"
      className="pointer-events-none fixed z-[140]"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    >
      <div
        className={cn(
          'outline-page-feedback-highlight h-full w-full rounded-sm outline',
          frozen
            ? 'bg-page-feedback-highlight/15 outline-2'
            : 'bg-page-feedback-highlight/10 outline-1',
        )}
      />
      <span
        className="bg-page-feedback-highlight text-page-feedback-highlight-fg absolute truncate rounded-sm px-1.5 py-0.5 font-mono text-xs shadow-sm"
        style={labelPlacement(rect, window.innerWidth)}
      >
        {label}
      </span>
    </div>
  );
}
