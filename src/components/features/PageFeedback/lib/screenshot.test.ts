import { describe, expect, it, vi } from 'vitest';
import { FEEDBACK_SCREENSHOT_MAX_CHARS } from './contract';
import {
  type CaptureDeps,
  captureScreenshot,
  maskTypedValue,
} from './screenshot';

const viewport = { width: 1280, height: 800 };
const VALID = 'data:image/jpeg;base64,AAAA';

interface FakeNode {
  name: string;
  getBoundingClientRect: () => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  parentElement: FakeNode | null;
  matches: (selector: string) => boolean;
}

function fakeNode(
  name: string,
  rect: { x: number; y: number; width: number; height: number },
  parentElement: FakeNode | null = null,
): FakeNode {
  return {
    name,
    getBoundingClientRect: () => rect,
    parentElement,
    matches: (selector) => selector === `[${name}]`,
  };
}

const section = fakeNode('section', { x: 0, y: 100, width: 1280, height: 600 });
const target = fakeNode(
  'target',
  { x: 400, y: 300, width: 200, height: 100 },
  section,
);

function fakeCanvasFactory(dataUrl: (quality: number) => string) {
  const drawn: unknown[][] = [];
  const createCanvas = () =>
    ({
      width: 0,
      height: 0,
      getContext: () => ({
        fillStyle: '',
        fillRect: () => undefined,
        drawImage: (...args: unknown[]) => drawn.push(args),
      }),
      toDataURL: (_type: string, quality: number) => dataUrl(quality),
    }) as unknown as HTMLCanvasElement;
  return { createCanvas, drawn };
}

function deps(overrides: Partial<CaptureDeps>): CaptureDeps {
  return {
    viewport,
    ignoreSelector: '[widget]',
    backgroundColor: 'white',
    timeoutMs: 50,
    ...overrides,
  };
}

const capture = (overrides: Partial<CaptureDeps>) =>
  captureScreenshot(target as unknown as Element, deps(overrides));

function clonedElement(
  tagName: string,
  attributes: Record<string, string>,
  text = '',
) {
  const attrs = new Map(Object.entries(attributes));
  return {
    tagName,
    textContent: text,
    getAttribute: (name: string) => attrs.get(name) ?? null,
    setAttribute: (name: string, value: string) => attrs.set(name, value),
    value: () => attrs.get('value'),
  };
}

describe('maskTypedValue', () => {
  it('clears values the visitor typed in the clone', () => {
    const email = clonedElement('INPUT', {
      type: 'email',
      value: 'jan@example.com',
    });
    const untyped = clonedElement('INPUT', { value: 'secret' });
    const textarea = clonedElement('TEXTAREA', { value: 'message' }, 'message');
    const editable = clonedElement('DIV', { contenteditable: '' }, 'note');
    for (const node of [email, untyped, textarea, editable])
      maskTypedValue(node as never);
    expect([email.value(), untyped.value(), textarea.value()]).toEqual([
      '',
      '',
      '',
    ]);
    expect([textarea.textContent, editable.textContent]).toEqual(['', '']);
  });

  it('keeps button labels and plain page text', () => {
    const submit = clonedElement('INPUT', { type: 'submit', value: 'Wyślij' });
    const paragraph = clonedElement('P', {}, 'Cennik');
    const notEditable = clonedElement(
      'DIV',
      { contenteditable: 'false' },
      'fixed copy',
    );
    for (const node of [submit, paragraph, notEditable])
      maskTypedValue(node as never);
    expect(submit.value()).toBe('Wyślij');
    expect([paragraph.textContent, notEditable.textContent]).toEqual([
      'Cennik',
      'fixed copy',
    ]);
    expect(() => maskTypedValue({ nodeType: 3 } as never)).not.toThrow();
  });
});

vi.mock('modern-screenshot', () => {
  throw new Error('chunk load failed');
});

describe('captureScreenshot', () => {
  it('a rejected `import()` of the default library yields a note without a screenshot', async () => {
    await expect(capture({})).resolves.toBeUndefined();
  });

  it('a library load error yields a note without a screenshot, without throwing', async () => {
    await expect(
      capture({
        loadLibrary: () => Promise.reject(new Error('chunk load failed')),
      }),
    ).resolves.toBeUndefined();
  });

  it('an unresponsive library ends after the timeout without a screenshot', async () => {
    await expect(
      capture({ loadLibrary: () => new Promise(() => undefined) }),
    ).resolves.toBeUndefined();
  });

  it('a rasterisation error yields a note without a screenshot', async () => {
    const domToCanvas = vi.fn(() =>
      Promise.reject(new Error('tainted canvas')),
    );
    await expect(
      capture({ loadLibrary: async () => ({ domToCanvas }) }),
    ).resolves.toBeUndefined();
  });

  it('an element outside the viewport does not load the library', async () => {
    const offscreen = fakeNode('offscreen', {
      x: 0,
      y: 5000,
      width: 50,
      height: 50,
    });
    const loadLibrary = vi.fn();
    await expect(
      captureScreenshot(offscreen as unknown as Element, deps({ loadLibrary })),
    ).resolves.toBeUndefined();
    expect(loadLibrary).not.toHaveBeenCalled();
  });

  it('rasterises the planned ancestor without the widget overlay and crops the fragment', async () => {
    const domToCanvas = vi.fn(async () => ({}) as HTMLCanvasElement);
    const { createCanvas, drawn } = fakeCanvasFactory(() => VALID);
    const result = await capture({
      loadLibrary: async () => ({ domToCanvas }),
      createCanvas,
    });

    expect(result).toBe(VALID);
    const [node, options] = domToCanvas.mock.calls[0] as unknown as [
      FakeNode,
      { filter: (n: unknown) => boolean; onCloneEachNode: unknown },
    ];
    expect(node).toBe(section);
    expect(options.onCloneEachNode).toBe(maskTypedValue);
    expect(
      options.filter(fakeNode('widget', { x: 0, y: 0, width: 1, height: 1 })),
    ).toBe(false);
    expect(options.filter(target)).toBe(true);
    expect(options.filter({ nodeType: 3 })).toBe(true);
    expect(drawn[0]?.slice(1, 5)).toEqual([350, 150, 300, 200]);
  });

  it('lowers quality until the screenshot fits the contract limit', async () => {
    const domToCanvas = async () => ({}) as HTMLCanvasElement;
    const { createCanvas } = fakeCanvasFactory((quality) =>
      quality > 0.7
        ? `data:image/jpeg;base64,${'A'.repeat(FEEDBACK_SCREENSHOT_MAX_CHARS)}`
        : VALID,
    );
    await expect(
      capture({ loadLibrary: async () => ({ domToCanvas }), createCanvas }),
    ).resolves.toBe(VALID);
  });
});
