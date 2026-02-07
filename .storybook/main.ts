import path from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/nextjs-vite';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: [path.resolve(__dirname, '../public')],
};
export default config;
