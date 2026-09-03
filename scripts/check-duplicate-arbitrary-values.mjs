#!/usr/bin/env node
// Detects Tailwind arbitrary spacing/sizing values (e.g. `px-[25px]`) that are
// repeated often enough across the codebase to deserve a named design token.
//
// Detection only — it never rewrites source. It compares the current repo-wide
// tally against `scripts/duplicate-value-baseline.json` and fails only when a
// value's count grows past its baseline, so pre-existing debt does not block CI
// while new duplication does. Run with `--update-baseline` to deliberately
// accept the current state.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const sourceRoot = path.join(repoRoot, 'src');
const baselinePath = path.join(
  repoRoot,
  'scripts',
  'duplicate-value-baseline.json',
);

const SPACING_PREFIXES = [
  'gap',
  'gap-x',
  'gap-y',
  'p',
  'px',
  'py',
  'pt',
  'pb',
  'pl',
  'pr',
  'm',
  'mx',
  'my',
  'mt',
  'mb',
  'ml',
  'mr',
  'w',
  'min-w',
  'max-w',
  'h',
  'min-h',
  'max-h',
  'size',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
];

// Bounded on the left so `bg-w-[..]`-style false positives cannot occur; the
// value class excludes `]` and whitespace so the match cannot run past one
// utility (no nested quantifiers, so no catastrophic backtracking).
const ARBITRARY_VALUE = new RegExp(
  `(?:^|[^\\w-])(?:${SPACING_PREFIXES.join('|')})-\\[([^\\]\\s]+)\\]`,
  'g',
);

async function collectSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(full);
      return /\.tsx?$/.test(entry.name) ? [full] : [];
    }),
  );
  return files.flat();
}

async function tally() {
  const counts = new Map();
  const files = await collectSourceFiles(sourceRoot);

  for (const file of files.sort()) {
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, index) => {
      for (const match of line.matchAll(ARBITRARY_VALUE)) {
        const value = match[1];
        const existing = counts.get(value) ?? [];
        existing.push(`${path.relative(repoRoot, file)}:${index + 1}`);
        counts.set(value, existing);
      }
    });
  }

  return counts;
}

const counts = await tally();

if (process.argv.includes('--update-baseline')) {
  const baseline = Object.fromEntries(
    [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, hits]) => [value, hits.length]),
  );
  await writeFile(
    baselinePath,
    `${JSON.stringify(baseline, null, 2)}\n`,
    'utf8',
  );
  console.log(
    `Baseline updated: ${Object.keys(baseline).length} arbitrary values recorded.`,
  );
  process.exit(0);
}

const baseline = existsSync(baselinePath)
  ? JSON.parse(await readFile(baselinePath, 'utf8'))
  : {};

const regressions = [...counts.entries()]
  .filter(([value, hits]) => hits.length > (baseline[value] ?? 0))
  .sort(([a], [b]) => a.localeCompare(b));

if (regressions.length === 0) {
  process.exit(0);
}

console.error('New duplication of Tailwind arbitrary values detected.\n');
for (const [value, hits] of regressions) {
  console.error(
    `  [${value}] — ${hits.length} occurrence(s), baseline ${baseline[value] ?? 0}`,
  );
  for (const hit of hits) console.error(`      ${hit}`);
  console.error('');
}
console.error(
  'Extract the repeated value into a named design token in src/app/theme.css,\n' +
    'or run `pnpm check:duplicate-values:update-baseline` to accept it deliberately.',
);
process.exit(1);
