export const ACTIVATION_PARAM = 'uwagi';
export const TOKEN_STORAGE_KEY = 'agency-feedback:token';

// A copy of `FEEDBACK_TOKEN_PATTERN` from the contract, not an import: this module reaches EVERY
// visitor, and importing the contract would pull zod into that bundle. `activation.test.ts` catches
// drift between the two.
export const TOKEN_PATTERN = /^fb_[A-Za-z0-9_-]{43}$/;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Merely reading `window.localStorage` throws a SecurityError when site data is blocked, so the
// try/catch has to wrap the property access, not just getItem/setItem.
export function browserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readStored(
  storage: StorageLike | null,
  key: string,
): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStored(
  storage: StorageLike | null,
  key: string,
  value: string,
): boolean {
  try {
    storage?.setItem(key, value);
    return storage !== null;
  } catch {
    return false;
  }
}

export function removeStored(
  storage: StorageLike | null,
  key: string,
): boolean {
  try {
    storage?.removeItem(key);
    return storage !== null;
  } catch {
    return false;
  }
}

export interface ActivationParam {
  token: string | null;
  cleanedHref: string | null;
}

// The link carries the token in the fragment (`#uwagi=…`), which the browser never sends to the
// server, so it stays out of the site's request logs; `?uwagi=` is still read for older links. The
// fragment is a list of `&`-separated segments and whatever is left stays as the anchor. This
// function is serialised into the HTML via `toString()`, so it must not reach outside its own body.
export function splitActivationHref(
  href: string,
  param: string,
  pattern: string,
): ActivationParam {
  const url = new URL(href);
  const prefix = `${param}=`;
  const hashParts = url.hash.slice(1).split('&');
  const fromHash = hashParts.find((part) => part.startsWith(prefix));
  const inSearch = url.searchParams.has(param);
  if (fromHash === undefined && !inSearch)
    return { token: null, cleanedHref: null };
  const value =
    fromHash !== undefined
      ? fromHash.slice(prefix.length)
      : (url.searchParams.get(param) ?? '');
  if (inSearch) url.searchParams.delete(param);
  url.hash = hashParts.filter((part) => !part.startsWith(prefix)).join('&');
  return {
    token: new RegExp(pattern).test(value) ? value : null,
    cleanedHref: url.toString(),
  };
}

export function takeActivationParam(href: string): ActivationParam {
  return splitActivationHref(href, ACTIVATION_PARAM, TOKEN_PATTERN.source);
}

// Serialised into the HTML via `toString()`, so it must not reach for module constants or imports.
// It runs while the HTML is parsed, BEFORE hydration, so nothing that reads the URL during the
// first render (analytics, `useSearchParams`) ever sees the token.
export function stripActivationParamInline(
  param: string,
  storageKey: string,
  pattern: string,
  split: typeof splitActivationHref,
): void {
  try {
    const { token, cleanedHref } = split(window.location.href, param, pattern);
    if (cleanedHref === null) return;
    window.history.replaceState(window.history.state, '', cleanedHref);
    if (token !== null) window.localStorage.setItem(storageKey, token);
  } catch {
    return;
  }
}

export function activationScriptSource(): string {
  const args = [ACTIVATION_PARAM, TOKEN_STORAGE_KEY, TOKEN_PATTERN.source].map(
    (value) => JSON.stringify(value),
  );
  return `(${stripActivationParamInline.toString()})(${args.join(',')},${splitActivationHref.toString()});`;
}

export interface ResolveTokenInput {
  href: string;
  storage: StorageLike | null;
  replaceHref: (href: string) => void;
}

export function resolveActiveToken({
  href,
  storage,
  replaceHref,
}: ResolveTokenInput): string | null {
  const { token, cleanedHref } = takeActivationParam(href);
  // The parameter leaves the URL even when the token is invalid — otherwise the token would end up
  // in the site's analytics and in the browser history.
  if (cleanedHref !== null) replaceHref(cleanedHref);
  if (token !== null) {
    writeStored(storage, TOKEN_STORAGE_KEY, token);
    return token;
  }
  const stored = readStored(storage, TOKEN_STORAGE_KEY);
  return stored !== null && TOKEN_PATTERN.test(stored) ? stored : null;
}
