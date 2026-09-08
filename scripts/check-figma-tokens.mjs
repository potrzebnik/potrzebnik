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

async function loadFigmaTokens() {
  const data = JSON.parse(await readFile(figmaTokensPath, 'utf8'));
  const primitives = data.collections['.primitive colors'].variables;
  const semantic = data.collections['Semantic Colors'].variables;

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

const strayLiterals = themeLiterals.filter(
  (literal) => !activePrimitiveHexes.has(literal.hex),
);

if (process.argv.includes('--update-baseline')) {
  const baseline = [
    ...new Set(strayLiterals.map((literal) => literal.hex)),
  ].sort();
  await writeFile(
    baselinePath,
    `${JSON.stringify(baseline, null, 2)}\n`,
    'utf8',
  );
  console.log(`Baseline updated: ${baseline.length} stray colour(s) recorded.`);
  process.exit(0);
}

const baseline = new Set(
  existsSync(baselinePath)
    ? JSON.parse(await readFile(baselinePath, 'utf8'))
    : [],
);

const regressions = strayLiterals.filter(
  (literal) => !baseline.has(literal.hex),
);

if (regressions.length === 0) {
  process.exit(0);
}

console.error(
  'theme.css defines colours with no match in the active Figma palette:\n',
);
for (const literal of regressions) {
  console.error(`  --${literal.name}: ${literal.hex};`);
}
console.error(
  '\nTrace the colour to a Figma primitive and reuse its value, or run\n' +
    '`pnpm check:figma-tokens:update-baseline` to accept it deliberately.',
);
process.exit(1);
