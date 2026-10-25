'use client';

import { lazy, Suspense, useEffect, useSyncExternalStore } from 'react';

import {
  activateFromLocation,
  endFeedbackSession,
  readActiveToken,
  readServerToken,
  subscribeToken,
} from './lib/tokenStore';

export const DEFAULT_FEEDBACK_ENDPOINT = 'https://app.ideaxpose.com';

// The lazy import keeps zod, the UI primitives and the picker out of an ordinary visitor's bundle —
// only a browser holding an active token ever downloads them.
const FeedbackWidget = lazy(() => import('./FeedbackWidget'));

export interface PageFeedbackProps {
  endpoint?: string;
}

export function PageFeedback({
  endpoint = DEFAULT_FEEDBACK_ENDPOINT,
}: PageFeedbackProps) {
  // The server snapshot is always null, so hydration matches the server HTML and the widget only
  // appears in the render that follows.
  const token = useSyncExternalStore(
    subscribeToken,
    readActiveToken,
    readServerToken,
  );

  useEffect(activateFromLocation, []);

  if (token === null) return null;
  return (
    <Suspense fallback={null}>
      <FeedbackWidget
        token={token}
        endpoint={endpoint}
        onEnd={endFeedbackSession}
      />
    </Suspense>
  );
}
