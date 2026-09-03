import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { describe, it } from 'vitest';

import { viewportOptions } from '../.storybook/viewports.mjs';
import validStoryViewport from './valid-story-viewport.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const [projectKey] = Object.keys(viewportOptions);
const [minimalKey] = Object.keys(MINIMAL_VIEWPORTS);
const UNKNOWN_KEY = 'no-such-viewport';

const ruleTester = new RuleTester({
  languageOptions: { parser: tsParser },
});

ruleTester.run('valid-story-viewport', validStoryViewport, {
  valid: [
    `export const Desktop = { globals: { viewport: { value: '${projectKey}' } } };`,
    `export const Minimal = { globals: { viewport: { value: '${minimalKey}' } } };`,
    `export const Legacy = { parameters: { viewport: { defaultViewport: '${projectKey}' } } };`,
    `export const Narrowed = { globals: { viewport: { value: '${projectKey}' as const } } };`,
    `export const Satisfied = { globals: { viewport: { value: '${projectKey}' } satisfies object } };`,
    'export const Default = { parameters: { layout: "centered" } };',
    'export const Elsewhere = { args: { viewport: { value: "whatever" } } };',
    `const meta = { parameters: { viewport: { options: { '${UNKNOWN_KEY}': { name: 'Local' } } } } };\n` +
      `export const Local = { globals: { viewport: { value: '${UNKNOWN_KEY}' } } };`,
  ],
  invalid: [
    {
      code: `export const Mobile = { globals: { viewport: { value: '${UNKNOWN_KEY}' } } };`,
      errors: [{ messageId: 'unknownViewport' }],
    },
    {
      code: `export const Legacy = { parameters: { viewport: { defaultViewport: '${UNKNOWN_KEY}' } } };`,
      errors: [{ messageId: 'unknownViewport' }],
    },
    {
      code: `export const Dead = { parameters: { viewport: { value: '${projectKey}' } } };`,
      errors: [{ messageId: 'unreadViewportPath' }],
    },
    {
      code: `export const Dead = { globals: { viewport: { defaultViewport: '${projectKey}' } } };`,
      errors: [{ messageId: 'unreadViewportPath' }],
    },
    {
      code: `export const Satisfied = { parameters: { viewport: { value: '${UNKNOWN_KEY}' } satisfies object } };`,
      errors: [{ messageId: 'unreadViewportPath' }],
    },
    {
      code: `const KEY = '${projectKey}';\nexport const Mobile = { globals: { viewport: { value: KEY } } };`,
      errors: [{ messageId: 'nonLiteralViewport' }],
    },
    {
      code: 'const size = 390;\nexport const Mobile = { globals: { viewport: { value: `${size}-844` } } };',
      errors: [{ messageId: 'nonLiteralViewport' }],
    },
  ],
});
