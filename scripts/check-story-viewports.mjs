import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const sourceRoot = path.join(repoRoot, 'src');
const previewPath = path.join(repoRoot, '.storybook', 'preview.tsx');

const VIEWPORT_VALUE =
  /viewport\s*:\s*\{[^{}]*?\bvalue\s*:\s*['"]([^'"]+)['"]/g;
const KEY_BEFORE_OBJECT = /(?:'([^']*)'|"([^"]*)"|([A-Za-z_$][\w$]*))\s*:\s*$/;

function findObjectBody(source, keyPattern) {
  const match = keyPattern.exec(source);
  if (!match) return null;

  const bodyStart = match.index + match[0].length;
  let depth = 1;

  for (let cursor = bodyStart; cursor < source.length; cursor += 1) {
    if (source[cursor] === '{') depth += 1;
    else if (source[cursor] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(bodyStart, cursor);
    }
  }

  return null;
}

function readKey(segment) {
  const match = KEY_BEFORE_OBJECT.exec(segment.trimEnd());
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? null;
}

function topLevelKeys(body) {
  const keys = [];
  let depth = 0;
  let segmentStart = 0;

  for (let cursor = 0; cursor < body.length; cursor += 1) {
    const character = body[cursor];

    if (character === '{' || character === '[') {
      if (depth === 0) {
        const key = readKey(body.slice(segmentStart, cursor));
        if (key) keys.push(key);
      }
      depth += 1;
    } else if (character === '}' || character === ']') {
      depth -= 1;
      if (depth === 0) segmentStart = cursor + 1;
    } else if (character === ',' && depth === 0) {
      segmentStart = cursor + 1;
    }
  }

  return keys;
}

async function collectStoryFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectStoryFiles(full);
      return entry.name.endsWith('.stories.tsx') ? [full] : [];
    }),
  );
  return files.flat();
}

async function configuredViewportKeys() {
  const source = await readFile(previewPath, 'utf8');
  const viewportBody = findObjectBody(source, /\bviewport\s*:\s*\{/);
  if (!viewportBody) return [];

  const optionsBody = findObjectBody(viewportBody, /\boptions\s*:\s*\{/);
  if (!optionsBody) return [];

  return topLevelKeys(optionsBody);
}

const allowedKeys = new Set([
  ...Object.keys(MINIMAL_VIEWPORTS),
  ...(await configuredViewportKeys()),
]);

const storyFiles = (await collectStoryFiles(sourceRoot)).sort();
const unknownUses = [];

for (const file of storyFiles) {
  const source = await readFile(file, 'utf8');

  for (const match of source.matchAll(VIEWPORT_VALUE)) {
    const key = match[1];
    if (allowedKeys.has(key)) continue;

    const line = source.slice(0, match.index).split('\n').length;
    unknownUses.push({
      key,
      location: `${path.relative(repoRoot, file).split(path.sep).join('/')}:${line}`,
    });
  }
}

if (unknownUses.length === 0) {
  process.exit(0);
}

console.error('Unknown Storybook viewport key pinned in stories.\n');
for (const { key, location } of unknownUses) {
  console.error(`  [${key}] — ${location}`);
}
console.error(
  `\nAllowed keys: ${[...allowedKeys].sort().join(', ')}\n\n` +
    'An unknown key is not an error at runtime: setViewport silently falls back to\n' +
    '1200x900, so a story named "Mobile" quietly renders — and gets tested — as\n' +
    'desktop. Define the key once in `parameters.viewport.options` in\n' +
    '.storybook/preview.tsx, or pin one of the allowed keys.',
);
process.exit(1);
