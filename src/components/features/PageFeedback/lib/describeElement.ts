import {
  FEEDBACK_ELEMENT_TEXT_MAX,
  FEEDBACK_PATHNAME_MAX,
  FEEDBACK_SELECTOR_MAX,
  type FeedbackItemContent,
} from './contract';
import { FEEDBACK_UI_ATTRIBUTE } from './uiAttribute';

const STABLE_DATA_ATTRIBUTES = ['data-testid'] as const;
const PLAIN_IDENT = /^-?[A-Za-z_][\w-]*$/;
// Form fields and editable blocks hold what the VISITOR typed (a password, an e-mail), not page
// content, so their text must never leave in a note. `input` has no text nodes, but a `textarea`'s
// value and a `select`'s options are part of `textContent`.
const PRIVATE_SUBTREE =
  'textarea, select, input, script, style, [contenteditable]:not([contenteditable="false"])';

function quoteAttribute(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function isUnique(root: ParentNode, selector: string): boolean {
  try {
    return root.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

function idSelector(id: string): string {
  return PLAIN_IDENT.test(id) ? `#${id}` : `[id=${quoteAttribute(id)}]`;
}

function ownSelector(element: Element): string | null {
  const root = element.ownerDocument;
  if (element.id && isUnique(root, idSelector(element.id)))
    return idSelector(element.id);
  for (const name of STABLE_DATA_ATTRIBUTES) {
    const value = element.getAttribute(name);
    if (!value) continue;
    const selector = `[${name}=${quoteAttribute(value)}]`;
    if (isUnique(root, selector)) return selector;
  }
  return null;
}

function pathSegment(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const parent = element.parentElement;
  if (parent === null) return tag;
  const sameTag = Array.from(parent.children).filter(
    (child) => child.tagName === element.tagName,
  );
  return sameTag.length > 1
    ? `${tag}:nth-of-type(${sameTag.indexOf(element) + 1})`
    : tag;
}

export function buildSelector(element: Element): string {
  const segments: string[] = [];
  let current: Element | null = element;
  while (current !== null) {
    const own = ownSelector(current);
    if (own !== null) {
      segments.unshift(own);
      break;
    }
    segments.unshift(pathSegment(current));
    if (current.tagName === 'BODY') break;
    current = current.parentElement;
  }
  // When the path is too long the START is dropped: the end points at the element itself, and a
  // selector without its anchor is still valid CSS, only less specific.
  while (
    segments.length > 1 &&
    segments.join(' > ').length > FEEDBACK_SELECTOR_MAX
  ) {
    segments.shift();
  }
  return segments.join(' > ').slice(0, FEEDBACK_SELECTOR_MAX);
}

function collectText(node: Node, parts: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    parts.push(node.nodeValue ?? '');
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const element = node as Element;
  if (
    element.matches(PRIVATE_SUBTREE) ||
    element.hasAttribute(FEEDBACK_UI_ATTRIBUTE)
  )
    return;
  for (const child of Array.from(element.childNodes)) collectText(child, parts);
}

export function readElementText(element: Element): string | undefined {
  const parts: string[] = [];
  collectText(element, parts);
  const text = parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, FEEDBACK_ELEMENT_TEXT_MAX);
  return text.length > 0 ? text : undefined;
}

export type PickedElementContent = Omit<FeedbackItemContent, 'kind' | 'note'>;

export interface DescribeContext {
  pathname: string;
  viewport: { width: number; height: number };
}

function clampViewport(value: number): number {
  return Math.min(Math.max(Math.round(value), 1), 20_000);
}

export function describePickedElement(
  element: Element,
  context: DescribeContext,
): PickedElementContent {
  const elementText = readElementText(element);
  const pathname = context.pathname.startsWith('/')
    ? context.pathname
    : `/${context.pathname}`;
  return {
    pathname: pathname.slice(0, FEEDBACK_PATHNAME_MAX),
    selector: buildSelector(element),
    viewport: {
      width: clampViewport(context.viewport.width),
      height: clampViewport(context.viewport.height),
    },
    ...(elementText !== undefined ? { elementText } : {}),
  };
}
