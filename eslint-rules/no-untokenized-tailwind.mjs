import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DEFAULT_PALETTE =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

// Utility prefixes that take a color value. Entries are interpolated into a
// regex alternation, so `border-[trblxyse]` is a character class (border-t,
// -r, -b, -l, -x, -y, -s, -e), not a literal prefix.
const COLOR_PREFIXES =
  'bg|text|border|border-[trblxyse]|outline|ring|ring-offset|inset-ring|shadow|inset-shadow|text-shadow|fill|stroke|decoration|from|via|to|caret|accent|divide|placeholder';

export function parseColorTokens(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const tokens = new Set();
  for (const block of source.matchAll(/@theme\b[^{;]*\{/g)) {
    let depth = 1;
    let end = block.index + block[0].length;
    while (depth > 0 && end < source.length) {
      if (source[end] === '{') depth += 1;
      else if (source[end] === '}') depth -= 1;
      end += 1;
    }
    const body = source.slice(block.index + block[0].length, end - 1);
    for (const m of body.matchAll(/(?:^|[;{\s])--color-([\w-]+)\s*:/g)) {
      tokens.add(m[1]);
    }
  }
  return tokens;
}

const COLOR_TOKENS = parseColorTokens(
  readFileSync(
    fileURLToPath(new URL('../src/app/theme.css', import.meta.url)),
    'utf8',
  ),
);

const BUILT_IN_COLORS = new Set(['transparent', 'current', 'inherit']);

const NON_COLOR_VALUES = new RegExp(
  `^(?:${[
    '\\d*xs|sm|md|base|lg|xl|\\d+xl|left|center|right|justify|start|end',
    'wrap|nowrap|balance|pretty|ellipsis|clip|box',
    'align|decoration|indent|overflow|shadow|transform|width|style|radius|color',
    '[trblxyse](?:-\\d+)?|[xy]-reverse|solid|dashed|dotted|double|hidden|none',
    'collapse|separate|spacing(?:-[\\w-]+)?|offset(?:-\\d+)?|inset',
    'wavy|auto|from-font|clone|slice',
    'cover|contain|top|bottom|(?:left|right)-(?:top|bottom)|(?:top|bottom)-(?:left|right)|fixed|local|scroll',
    '(?:no-)?repeat(?:-[\\w-]+)?|(?:clip|origin|blend|size|position)-[\\w-]+',
    '(?:linear|radial|conic|gradient)(?:-[\\w-]+)?',
  ].join('|')})$`,
);

const PALETTE_VALUE = new RegExp(`^(?:${DEFAULT_PALETTE})(?:-\\d{2,3})?$`);

const VARIANT = String.raw`(?:[\w/-]+|[\w-]*\[[^\]\s]+\](?:\/[\w-]+)?)`;

const LONGEST_COLOR_PREFIX_FIRST = COLOR_PREFIXES.split('|')
  .sort((a, b) => b.length - a.length)
  .join('|');

const CHECKS = [
  {
    id: 'rawColor',
    re: /[\w-]*\[(?:#|rgb\(|rgba\(|hsl\(|hsla\(|oklch\()[^\]]*\]/g,
    message:
      '`{{match}}` uses a raw color literal — use a design token (e.g. bg-footer-bg) instead (see CLAUDE.md).',
  },
  {
    id: 'palette',
    // Bounded on both sides so `text-header-fg` and `border-b` are not matched.
    re: new RegExp(
      `(?<![\\w-])(?:${COLOR_PREFIXES})-(?:${DEFAULT_PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?(?![\\w-])`,
      'g',
    ),
    message:
      "`{{match}}` is from Tailwind's default palette — use a design token (e.g. bg-header-bg) instead (see CLAUDE.md).",
  },
  {
    id: 'radius',
    re: /(?<![\w-])rounded(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|ee|es))?-\[[^\]]*\]/g,
    message:
      '`{{match}}` hardcodes a corner radius — use a radius scale class (e.g. rounded-lg) or a design token (see CLAUDE.md).',
  },
  {
    id: 'unknownColorToken',
    wholeClass: true,
    re: new RegExp(
      `(?<=(?:^|[\\s'"\`])(?:${VARIANT}:)*!?)(?:${LONGEST_COLOR_PREFIX_FIRST})-(?<name>[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?:\\/(?:\\d+|\\[[^\\]\\s]+\\]|\\([^)\\s]+\\)))?!?(?=$|[\\s'"\`])`,
      'g',
    ),
    accept: ({ groups: { name } }) =>
      !COLOR_TOKENS.has(name) &&
      !BUILT_IN_COLORS.has(name) &&
      !NON_COLOR_VALUES.test(name) &&
      !PALETTE_VALUE.test(name),
    message:
      '`{{match}}` names no colour token — there is no `--color-{{name}}` in any `@theme` block of src/app/theme.css. Use an existing token (e.g. bg-background) or add one there.',
  },
];

const MODULE_SOURCE_PARENTS = new Set([
  'ImportDeclaration',
  'ExportNamedDeclaration',
  'ExportAllDeclaration',
  'ImportExpression',
]);

const noUntokenizedTailwind = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce design tokens in Tailwind class strings.' },
    messages: Object.fromEntries(CHECKS.map((c) => [c.id, c.message])),
    schema: [],
  },
  create(context) {
    const src = context.sourceCode;

    function check(node, text, textStart, { joinedBefore, joinedAfter } = {}) {
      for (const { id, re, accept, wholeClass } of CHECKS) {
        const glued = wholeClass && joinedBefore;
        const subject =
          wholeClass && (joinedBefore || joinedAfter)
            ? `${glued ? '\0' : ''}${text}${joinedAfter ? '\0' : ''}`
            : text;
        const offset = textStart - (glued ? 1 : 0);
        re.lastIndex = 0;
        for (const m of subject.matchAll(re)) {
          if (accept && !accept(m)) continue;
          const start = offset + m.index;
          context.report({
            node,
            loc: {
              start: src.getLocFromIndex(start),
              end: src.getLocFromIndex(start + m[0].length),
            },
            messageId: id,
            data: { match: m[0], name: m.groups?.name },
          });
        }
      }
    }

    return {
      // Class strings are not always written inline in a `className` attribute
      // — `cva()` variant maps, `cn()` arguments and exported style objects all
      // end up there too — so every string literal and template chunk is checked.
      Literal(node) {
        if (typeof node.value !== 'string') return;
        if (MODULE_SOURCE_PARENTS.has(node.parent?.type)) return;
        // +1 skips the opening quote so columns land on the class itself.
        check(node, node.value, node.range[0] + 1);
      },
      TemplateElement(node) {
        const quasis = node.parent.quasis;
        check(node, node.value.raw, node.range[0] + 1, {
          joinedBefore: quasis[0] !== node,
          joinedAfter: !node.tail,
        });
      },
    };
  },
};

export default noUntokenizedTailwind;
