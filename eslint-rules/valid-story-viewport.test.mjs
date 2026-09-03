import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import validStoryViewport from './valid-story-viewport.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('valid-story-viewport', validStoryViewport, {
  valid: [
    "export const Mobile = { parameters: { viewport: { value: '390-844' } } };",
    "export const Tablet = { parameters: { viewport: { value: 'mobile1' } } };",
    'export const Default = { parameters: { layout: "centered" } };',
  ],
  invalid: [
    {
      code: "export const Mobile = { parameters: { viewport: { value: 'phone' } } };",
      errors: [{ messageId: 'unknownViewport' }],
    },
  ],
});
