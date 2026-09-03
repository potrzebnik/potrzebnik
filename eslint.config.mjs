// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

import noUntokenizedTailwind from './eslint-rules/no-untokenized-tailwind.mjs';
import requireColocatedStory from './eslint-rules/require-colocated-story.mjs';
import validStoryViewport from './eslint-rules/valid-story-viewport.mjs';

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
    // The docs site is a separate workspace package with its own toolchain.
    'docs/site/**',
  ]),
  eslintPluginPrettier,
  ...storybook.configs['flat/recommended'],
  {
    plugins: {
      potrzebnik: {
        rules: {
          'no-untokenized-tailwind': noUntokenizedTailwind,
          'require-colocated-story': requireColocatedStory,
          'valid-story-viewport': validStoryViewport,
        },
      },
    },
    rules: {
      'potrzebnik/no-untokenized-tailwind': 'error',
    },
  },
  {
    files: ['src/components/ui/**/*.tsx', 'src/components/shared/**/*.tsx'],
    rules: {
      'potrzebnik/require-colocated-story': 'error',
    },
  },
  {
    files: ['**/*.stories.tsx'],
    rules: {
      'potrzebnik/valid-story-viewport': 'error',
    },
  },
]);

export default eslintConfig;
