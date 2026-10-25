// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { activationScriptSource, TOKEN_STORAGE_KEY } from './activation';

const TOKEN = `fb_${'c'.repeat(43)}`;

function runInlineScript() {
  new Function(activationScriptSource())();
}

const currentPath = () =>
  window.location.pathname + window.location.search + window.location.hash;

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('activation script before hydration', () => {
  it('blocked storage still leaves no token in the URL', () => {
    window.history.replaceState(null, '', `/oferta?uwagi=${TOKEN}`);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    expect(runInlineScript).not.toThrow();
    expect(window.location.href).not.toContain(TOKEN);
    expect(currentPath()).toBe('/oferta');
  });

  it('is self-contained: a fragment token is stored and leaves the whole URL', () => {
    window.history.replaceState(null, '', `/blog?x=1#uwagi=${TOKEN}&h`);

    runInlineScript();

    expect(window.location.href).not.toContain(TOKEN);
    expect(currentPath()).toBe('/blog?x=1#h');
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(TOKEN);
  });

  it('reads the legacy query form and removes it from the URL too', () => {
    window.history.replaceState(null, '', `/blog?uwagi=${TOKEN}&x=1#h`);

    runInlineScript();

    expect(window.location.href).not.toContain(TOKEN);
    expect(currentPath()).toBe('/blog?x=1#h');
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(TOKEN);
  });

  it('an invalid token leaves the URL and is not stored', () => {
    window.history.replaceState(null, '', '/#uwagi=fb_short');

    runInlineScript();

    expect(window.location.href).not.toContain('fb_short');
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('touches nothing without the parameter', () => {
    window.history.replaceState(null, '', '/?utm=a#cennik');

    runInlineScript();

    expect(window.location.search + window.location.hash).toBe('?utm=a#cennik');
    expect(window.localStorage.length).toBe(0);
  });
});
