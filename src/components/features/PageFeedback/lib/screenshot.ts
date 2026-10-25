import {
  type CaptureRect,
  type CaptureViewport,
  fitScreenshot,
  planCapture,
  renderScale,
} from './screenshotPlan';

interface RasterizeOptions {
  scale: number;
  backgroundColor: string;
  filter: (node: Node) => boolean;
  onCloneEachNode: (cloned: Node) => void;
  timeout: number;
}

export interface ScreenshotLibrary {
  domToCanvas: (
    node: Node,
    options: RasterizeOptions,
  ) => Promise<HTMLCanvasElement>;
}

export interface CaptureDeps {
  ignoreSelector: string;
  loadLibrary?: () => Promise<ScreenshotLibrary>;
  timeoutMs?: number;
  viewport?: CaptureViewport;
  backgroundColor?: string;
  createCanvas?: () => HTMLCanvasElement;
}

const DEFAULT_TIMEOUT_MS = 4000;
const FALLBACK_BACKGROUND = 'white';

// `import()` here rather than at the top of the module: the library ships as a separate chunk,
// fetched on the first added note instead of on widget activation.
const loadModernScreenshot = (): Promise<ScreenshotLibrary> =>
  import('modern-screenshot');

const LABEL_INPUT_TYPES = new Set([
  'button',
  'submit',
  'reset',
  'image',
  'checkbox',
  'radio',
]);

// The same boundary as `elementText` in `describeElement.ts` — nothing the visitor typed or chose
// leaves the page. The library copies each field's `value` (including `select`) into an attribute
// of the clone and calls this hook after copying values and children, so the clone is scrubbed
// here (verified against the real library in `screenshotMask.test.ts`).
export function maskTypedValue(cloned: Node): void {
  const element = cloned as Element;
  if (typeof element.tagName !== 'string') return;
  const tag = element.tagName.toLowerCase();
  const type = (element.getAttribute('type') ?? 'text').toLowerCase();
  if (tag === 'input' && LABEL_INPUT_TYPES.has(type)) return;
  if (tag === 'select') element.removeAttribute('value');
  if (tag === 'option') element.removeAttribute('selected');
  if (tag === 'input' || tag === 'textarea') element.setAttribute('value', '');
  const editable = element.getAttribute('contenteditable');
  if (tag === 'textarea' || (editable !== null && editable !== 'false'))
    element.textContent = '';
}

function pageBackground(): string {
  const color = getComputedStyle(document.body).backgroundColor;
  return color === '' || color === 'transparent' || color === 'rgba(0, 0, 0, 0)'
    ? FALLBACK_BACKGROUND
    : color;
}

function targetThenAncestors(target: Element): Element[] {
  const chain: Element[] = [];
  for (
    let node: Element | null = target;
    node !== null;
    node = node.parentElement
  ) {
    chain.push(node);
  }
  return chain;
}

function rectOf(element: Element): CaptureRect {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('screenshot timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function encodeCrop(
  source: HTMLCanvasElement,
  crop: CaptureRect,
  scale: number,
  createCanvas: () => HTMLCanvasElement,
  background: string,
) {
  return ({
    scale: stepScale,
    quality,
  }: {
    scale: number;
    quality: number;
  }): string => {
    const output = createCanvas();
    output.width = Math.max(1, Math.round(crop.width * scale * stepScale));
    output.height = Math.max(1, Math.round(crop.height * scale * stepScale));
    const context = output.getContext('2d');
    if (context === null) return '';
    context.fillStyle = background;
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(
      source,
      crop.x * scale,
      crop.y * scale,
      crop.width * scale,
      crop.height * scale,
      0,
      0,
      output.width,
      output.height,
    );
    return output.toDataURL('image/jpeg', quality);
  };
}

export async function captureScreenshot(
  target: Element,
  {
    ignoreSelector,
    loadLibrary = loadModernScreenshot,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    viewport,
    backgroundColor,
    createCanvas = () => document.createElement('canvas'),
  }: CaptureDeps,
): Promise<string | undefined> {
  try {
    const chain = targetThenAncestors(target);
    const plan = planCapture(
      chain.map(rectOf),
      viewport ?? { width: window.innerWidth, height: window.innerHeight },
    );
    if (plan === null) return undefined;
    const background = backgroundColor ?? pageBackground();
    const scale = renderScale(plan.crop);

    const render = async () => {
      const library = await loadLibrary();
      const source = await library.domToCanvas(chain[plan.index], {
        scale,
        backgroundColor: background,
        filter: (node) => !(node as Element).matches?.(ignoreSelector),
        onCloneEachNode: maskTypedValue,
        timeout: timeoutMs,
      });
      return fitScreenshot(
        encodeCrop(source, plan.crop, scale, createCanvas, background),
      );
    };
    return await withTimeout(render(), timeoutMs);
  } catch {
    return undefined;
  }
}
