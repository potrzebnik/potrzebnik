import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  test: {
    // Vitest 4 inline projects do not inherit root options by default.
    // `extends` makes shared options such as the `@` alias available to them.
    // https://vitest.dev/guide/projects.html#configuration
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'eslint-rules/**/*.test.mjs'],
          exclude: ['src/**/*.integration.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['src/**/*.integration.test.ts'],
          maxWorkers: 1,
          hookTimeout: 120_000,
          setupFiles: ['src/test/setup-integration.ts'],
          testTimeout: 30_000,
        },
      },
    ],
  },
});
