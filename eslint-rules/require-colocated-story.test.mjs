import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import requireColocatedStory from './require-colocated-story.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

function componentPath(name) {
  return path.join(repoRoot, 'src', 'components', 'shared', name);
}

const ruleTester = new RuleTester();

ruleTester.run('require-colocated-story', requireColocatedStory, {
  valid: [
    {
      code: 'export function BadgeGroup() {}',
      filename: componentPath('BadgeGroup.tsx'),
    },
    {
      code: 'export default {};',
      filename: componentPath('BadgeGroup.stories.tsx'),
    },
  ],
  invalid: [
    {
      code: 'export function Unstoried() {}',
      filename: componentPath('Unstoried.tsx'),
      errors: [{ messageId: 'missingStory' }],
    },
  ],
});
