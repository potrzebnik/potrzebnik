#!/usr/bin/env node
// Reports Figma semantic colours missing from theme.css (informational), and
// fails on theme.css literals with no active Figma primitive backing —
// baselined like check-duplicate-arbitrary-values.mjs, so only new drift
// fails CI. "Active" skips anything Figma marks nieaktualne/nieaktualnie.

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const figmaTokensPath = path.join(repoRoot, 'figma-tokens.json');
const themeCssPath = path.join(repoRoot, 'src', 'app', 'theme.css');
const baselinePath = path.join(
  repoRoot,
  'scripts',
  'figma-token-baseline.json',
);

const isDeprecated = (name) => /nieaktualn[ei]e?/i.test(name);

function normalizeHex(hex) {
  const lower = hex.toLowerCase();
  return lower.length === 4
    ? `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`
    : lower;
}

function collectionVariables(data, name) {
  const collection = data.collections[name];
  if (!collection) {
    throw new Error(
      `figma-tokens.json has no "${name}" collection — it was renamed in Figma, or the export is stale.`,
    );
  }
  return collection.variables;
}

async function loadFigmaTokens() {
  const data = JSON.parse(await readFile(figmaTokensPath, 'utf8'));
  const primitives = collectionVariables(data, '.primitive colors');
  const semantic = collectionVariables(data, 'Semantic Colors');

  const primitiveHexByName = new Map(
    Object.entries(primitives).map(([name, variable]) => [
      name,
      normalizeHex(variable.modes['Mode 1']),
    ]),
  );

  const activePrimitiveHexes = new Set(
    [...primitiveHexByName.entries()]
      .filter(([name]) => !isDeprecated(name))
      .map(([, hex]) => hex),
  );

  const activeSemanticColors = [];
  for (const [name, variable] of Object.entries(semantic)) {
    if (isDeprecated(name)) continue;

    const target = variable.modes.shadcn;
    if (!target) continue;

    if (target.startsWith('#')) {
      activeSemanticColors.push({ name, resolvedHex: normalizeHex(target) });
      continue;
    }

    if (isDeprecated(target)) continue;

    const resolvedHex = primitiveHexByName.get(target);
    if (!resolvedHex) {
      console.warn(
        `check-figma-tokens: could not resolve alias "${target}" for "${name}"`,
      );
      continue;
    }
    activeSemanticColors.push({ name, resolvedHex });
  }

  return { activePrimitiveHexes, activeSemanticColors };
}

async function loadThemeLiterals() {
  const css = await readFile(themeCssPath, 'utf8');
  const rootBlock = css.split(':root {')[1] ?? '';
  const literals = [];
  for (const match of rootBlock.matchAll(
    /--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g,
  )) {
    literals.push({ name: match[1], hex: normalizeHex(match[2]) });
  }
  return literals;
}

const { activePrimitiveHexes, activeSemanticColors } = await loadFigmaTokens();
const themeLiterals = await loadThemeLiterals();

// A gate that parses nothing must not pass: no literals means this script no
// longer understands theme.css, not that theme.css is clean.
if (themeLiterals.length === 0) {
  console.error(
    'No colour literals found in the :root block of src/app/theme.css — this check can no longer read it.',
  );
  process.exit(1);
}

const themeHexes = new Set(themeLiterals.map((literal) => literal.hex));

const missing = activeSemanticColors
  .filter((color) => !themeHexes.has(color.resolvedHex))
  .sort((a, b) => a.name.localeCompare(b.name));

console.log(
  `Figma semantic colours not yet represented in theme.css: ${missing.length}/${activeSemanticColors.length}`,
);
for (const color of missing) {
  console.log(`  ${color.name} (${color.resolvedHex})`);
}
console.log('');

const strayLiterals = themeLiterals
  .filter((literal) => !activePrimitiveHexes.has(literal.hex))
  .sort((a, b) => a.name.localeCompare(b.name));

if (process.argv.includes('--update-baseline')) {
  const baseline = Object.fromEntries(
    strayLiterals.map((literal) => [`--${literal.name}`, literal.hex]),
  );
  await writeFile(
    baselinePath,
    `${JSON.stringify(baseline, null, 2)}\n`,
    'utf8',
  );
  console.log(
    `Baseline updated: ${strayLiterals.length} stray token(s) recorded.`,
  );
  process.exit(0);
}

const baseline = existsSync(baselinePath)
  ? JSON.parse(await readFile(baselinePath, 'utf8'))
  : {};

// Keyed on name *and* value: a new token reusing a baselined colour is still
// new, and an existing token swapped to a different off-palette colour is
// still a new colour. Either one has to be accepted deliberately.
const isBaselined = (literal) => baseline[`--${literal.name}`] === literal.hex;

const known = strayLiterals.filter(isBaselined);
const regressions = strayLiterals.filter((literal) => !isBaselined(literal));

console.log(
  `theme.css literals with no active Figma primitive backing (baselined, non-blocking): ${known.length}`,
);
for (const literal of known) {
  console.log(`  --${literal.name}: ${literal.hex};`);
}
console.log('');

if (regressions.length === 0) {
  process.exit(0);
}

console.error('theme.css has off-palette tokens that are not baselined:\n');
for (const literal of regressions) {
  console.error(`  --${literal.name}: ${literal.hex};`);
}
console.error(
  '\nTrace the colour to a Figma primitive and reuse its value, or run\n' +
    '`pnpm check:figma-tokens:update-baseline` to accept it deliberately.',
);
process.exit(1);
