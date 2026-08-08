// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

// Tailwind's default palette. Colors must come from design tokens declared in
// `src/app/globals.css` (see CLAUDE.md), so these built-in names are banned.
const defaultPaletteColors = [
  'white',
  'black',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
].join('|');

// Utility prefixes that take a color value. Entries are interpolated into a
// regex alternation, so `border-[trblxy]` is a character class (border-t, -r,
// -b, -l, -x, -y), not a literal prefix.
const colorUtilityPrefixes = [
  'bg',
  'text',
  'border',
  'border-[trblxy]',
  'outline',
  'ring',
  'fill',
  'stroke',
  'decoration',
  'from',
  'via',
  'to',
  'caret',
  'accent',
  'divide',
].join('|');

// Bounded on both sides so `text-header-fg` and `border-b` are not matched.
const namedColorPattern = `(^|[^\\w-])(${colorUtilityPrefixes})-(${defaultPaletteColors})(-\\d{2,3})?(\\/\\d+)?($|[^\\w-])`;

const restrictedClassPatterns = [
  {
    pattern: '\\[(#|rgb\\(|rgba\\(|hsl\\(|hsla\\(|oklch\\()',
    message:
      'Raw color literals in Tailwind arbitrary values are not allowed — use a design token (e.g. bg-footer-bg) instead (see CLAUDE.md).',
  },
  {
    pattern: namedColorPattern,
    message:
      "Tailwind's default color palette is not allowed — use a design token (e.g. bg-header-bg) instead (see CLAUDE.md).",
  },
  {
    pattern: '(^|[^\\w-])rounded(-(t|r|b|l|s|e|tl|tr|br|bl|ss|se|ee|es))?-\\[',
    message:
      'Arbitrary corner-radius values are not allowed — use a radius scale class (e.g. rounded-lg) or a design token (see CLAUDE.md).',
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.storybook/**',
    'storybook-static/**',
  ]),
  eslintPluginPrettier,
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        // Class strings are not always written inline in a `className`
        // attribute — `cva()` variant maps, `cn()` arguments and exported style
        // objects all end up there too — so these match every string literal
        // and template chunk rather than scoping to JSXAttribute.
        ...restrictedClassPatterns.flatMap(({ pattern, message }) => [
          { selector: `Literal[value=/${pattern}/]`, message },
          { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
        ]),
      ],
    },
  },
]);

export default eslintConfig;
