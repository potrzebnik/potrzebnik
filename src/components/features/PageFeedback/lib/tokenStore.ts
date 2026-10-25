import {
  browserStorage,
  readStored,
  resolveActiveToken,
  TOKEN_PATTERN,
  TOKEN_STORAGE_KEY,
} from './activation';

const listeners = new Set<() => void>();

// Holds the token only when the browser refused to store it, so a link still works for the
// current visit with site data blocked.
let unstoredToken: string | null = null;

function notify() {
  for (const listener of listeners) listener();
}

export function subscribeToken(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function readActiveToken(): string | null {
  const stored = readStored(browserStorage(), TOKEN_STORAGE_KEY);
  if (stored !== null && TOKEN_PATTERN.test(stored)) return stored;
  return unstoredToken;
}

export function readServerToken(): null {
  return null;
}

export function activateFromLocation(): void {
  const storage = browserStorage();
  const token = resolveActiveToken({
    href: window.location.href,
    storage,
    replaceHref: (href) =>
      window.history.replaceState(window.history.state, '', href),
  });
  unstoredToken =
    token !== null && readStored(storage, TOKEN_STORAGE_KEY) !== token
      ? token
      : null;
  notify();
}

export function endFeedbackSession(): void {
  unstoredToken = null;
  notify();
}
