import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const WATCHED_DIRECTORIES = [
  path.join('src', 'components', 'ui'),
  path.join('src', 'components', 'shared'),
];

async function collectComponentFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectComponentFiles(full);
      if (!entry.name.endsWith('.tsx')) return [];
      if (entry.name.endsWith('.stories.tsx')) return [];
      return [full];
    }),
  );
  return files.flat();
}

function toPosix(absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/');
}

const missing = [];

for (const watched of WATCHED_DIRECTORIES) {
  const absolute = path.join(repoRoot, watched);
  if (!existsSync(absolute)) continue;

  const componentFiles = (await collectComponentFiles(absolute)).sort();

  for (const file of componentFiles) {
    const expected = file.replace(/\.tsx$/, '.stories.tsx');
    if (existsSync(expected)) continue;
    missing.push({ component: toPosix(file), expected: toPosix(expected) });
  }
}

if (missing.length === 0) {
  process.exit(0);
}

console.error('Component files without co-located stories detected.\n');
for (const { component, expected } of missing) {
  console.error(`  ${component}`);
  console.error(`      expected ${expected}`);
  console.error('');
}
console.error(
  'Stories are the primary component test harness in this repository: a component\n' +
    'with no `*.stories.tsx` neighbour is never rendered by `pnpm test:storybook`,\n' +
    'so nothing checks it and the axe gate never sees it. Add the missing file next\n' +
    'to each component listed above.',
);
process.exit(1);
