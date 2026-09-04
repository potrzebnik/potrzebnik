import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { afterAll, describe, it } from 'vitest';

import requireColocatedStory from './require-colocated-story.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const fixtureDir = mkdtempSync(path.join(tmpdir(), 'require-colocated-story-'));

function fixture(name) {
  return path.join(fixtureDir, name);
}

writeFileSync(fixture('Storied.tsx'), '');
writeFileSync(fixture('Storied.stories.tsx'), '');
writeFileSync(fixture('Unstoried.tsx'), '');

afterAll(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

const ruleTester = new RuleTester({
  languageOptions: { parser: tsParser },
});

ruleTester.run('require-colocated-story', requireColocatedStory, {
  valid: [
    {
      code: 'export function Storied(): null { return null; }',
      filename: fixture('Storied.tsx'),
    },
    {
      code: 'export default {};',
      filename: fixture('Storied.stories.tsx'),
    },
  ],
  invalid: [
    {
      code: 'export function Unstoried(): null { return null; }',
      filename: fixture('Unstoried.tsx'),
      errors: [{ messageId: 'missingStory' }],
    },
  ],
});
