// Colors, radii and other visual values must come from design tokens declared
// in `src/app/theme.css` (see CLAUDE.md). This rule reports the offending
// class itself — name and location — instead of the whole string literal.
const DEFAULT_PALETTE =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

// Utility prefixes that take a color value. Entries are interpolated into a
// regex alternation, so `border-[trblxy]` is a character class (border-t, -r,
// -b, -l, -x, -y), not a literal prefix.
const COLOR_PREFIXES =
  'bg|text|border|border-[trblxy]|outline|ring|fill|stroke|decoration|from|via|to|caret|accent|divide';

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
      for (const { id, re } of CHECKS) {
        re.lastIndex = 0;
        for (const m of text.matchAll(re)) {
          const start = textStart + m.index;
          context.report({
            node,
            loc: {
              start: src.getLocFromIndex(start),
              end: src.getLocFromIndex(start + m[0].length),
            },
            messageId: id,
            data: { match: m[0] },
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
