import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Colors, radii and other visual values must come from design tokens declared
// in `src/app/theme.css` (see CLAUDE.md). This rule reports the offending
// class itself — name and location — instead of the whole string literal.
const DEFAULT_PALETTE =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

// Utility prefixes that take a color value. Entries are interpolated into a
// regex alternation, so `border-[trblxy]` is a character class (border-t, -r,
// -b, -l, -x, -y), not a literal prefix.
const COLOR_PREFIXES =
  'bg|text|border|border-[trblxy]|outline|ring|ring-offset|fill|stroke|decoration|from|via|to|caret|accent|divide';

const THEME_CSS = readFileSync(
  fileURLToPath(new URL('../src/app/theme.css', import.meta.url)),
  'utf8',
);

const COLOR_TOKENS = new Set(
  [
    ...(THEME_CSS.match(/@theme\s+inline\s*\{([^}]*)\}/)?.[1] ?? '').matchAll(
      /--color-([\w-]+)\s*:/g,
    ),
  ].map((m) => m[1]),
);

const BUILT_IN_COLORS = new Set(['transparent', 'current', 'inherit']);

const NON_COLOR_VALUES = new RegExp(
  `^(?:${[
    'xs|sm|base|lg|xl|\\d+xl|left|center|right|justify|start|end',
    'wrap|nowrap|balance|pretty|ellipsis|clip|shadow(?:-[\\w-]+)?',
    '[trblxyse](?:-\\d+)?|[xy]-reverse|solid|dashed|dotted|double|hidden|none',
    'collapse|separate|spacing(?:-[\\w-]+)?|offset(?:-\\d+)?|inset',
    'wavy|auto|from-font|clone|slice',
    'cover|contain|top|bottom|(?:left|right)-(?:top|bottom)|fixed|local|scroll',
    '(?:no-)?repeat(?:-[\\w-]+)?|(?:clip|origin|blend|size|position)-[\\w-]+',
    '(?:linear|radial|conic|gradient)(?:-[\\w-]+)?',
  ].join('|')})$`,
);

const PALETTE_VALUE = new RegExp(`^(?:${DEFAULT_PALETTE})(?:-\\d{2,3})?$`);

// Longer prefixes come first so `border-t-header-rule` splits as `border-t` +
// `header-rule`, not `border` + `t-header-rule`.
const LONGEST_COLOR_PREFIX_FIRST = COLOR_PREFIXES.split('|')
  .sort((a, b) => b.length - a.length)
  .join('|');

const CHECKS = [
  {
    id: 'rawColor',
    // Captures the whole class around the literal, e.g. `bg-[#1a1a1a]`.
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
    re: new RegExp(
      `(?<![\\w-])(?:${LONGEST_COLOR_PREFIX_FIRST})-(?<name>[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?:\\/[\\w.%[\\]()-]+)?(?![\\w[(%-])`,
      'g',
    ),
    accept: ({ groups: { name } }) =>
      !COLOR_TOKENS.has(name) &&
      !BUILT_IN_COLORS.has(name) &&
      !NON_COLOR_VALUES.test(name) &&
      !PALETTE_VALUE.test(name),
    message:
      '`{{match}}` names no colour token — there is no `--color-{{name}}` in the `@theme inline` block of src/app/theme.css. Use an existing token (e.g. bg-background) or add one there.',
  },
];

const noUntokenizedTailwind = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce design tokens in Tailwind class strings.' },
    messages: Object.fromEntries(CHECKS.map((c) => [c.id, c.message])),
    schema: [],
  },
  create(context) {
    const src = context.sourceCode;

    function check(node, text, textStart) {
      for (const { id, re, accept } of CHECKS) {
        re.lastIndex = 0;
        for (const m of text.matchAll(re)) {
          if (accept && !accept(m)) continue;
          const start = textStart + m.index;
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
        // +1 skips the opening quote so columns land on the class itself.
        check(node, node.value, node.range[0] + 1);
      },
      TemplateElement(node) {
        check(node, node.value.raw, node.range[0]);
      },
    };
  },
};

export default noUntokenizedTailwind;
