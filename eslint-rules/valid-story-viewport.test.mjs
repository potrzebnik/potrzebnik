import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import validStoryViewport from './valid-story-viewport.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('valid-story-viewport', validStoryViewport, {
  valid: [
    "export const Desktop = { globals: { viewport: { value: '1280-800' } } };",
    "export const Mobile = { globals: { viewport: { value: 'mobile1' } } };",
    "export const Legacy = { parameters: { viewport: { defaultViewport: '390-844' } } };",
    'export const Default = { parameters: { layout: "centered" } };',
  ],
  invalid: [
    {
      code: "export const Mobile = { globals: { viewport: { value: 'phone' } } };",
      errors: [{ messageId: 'unknownViewport' }],
    },
    {
      code: "export const Mobile = { parameters: { viewport: { value: 'phone' } } };",
      errors: [{ messageId: 'unknownViewport' }],
    },
    {
      code: "export const Legacy = { parameters: { viewport: { defaultViewport: 'phone' } } };",
      errors: [{ messageId: 'unknownViewport' }],
    },
    {
      code: 'const KEY = "390-844";\nexport const Mobile = { globals: { viewport: { value: KEY } } };',
      errors: [{ messageId: 'nonLiteralViewport' }],
    },
    {
      code: 'const size = 390;\nexport const Mobile = { globals: { viewport: { value: `${size}-844` } } };',
      errors: [{ messageId: 'nonLiteralViewport' }],
    },
  ],
});
