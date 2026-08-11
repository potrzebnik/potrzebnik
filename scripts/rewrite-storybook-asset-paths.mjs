// Makes a built Storybook portable under a URL subpath.
//
// Stories reference public assets root-absolutely (`/children.jpg`) because
// that is correct for the Next app. Storybook's next/image mock resolves those
// against the origin, so they 404 once the build is served from
// /potrzebnik/storybook/. The mock ignores `parameters.nextjs.image.loader`
// (it overrides the context loader with the prop loader), so the reference is
// rewritten in the built output instead: `./children.jpg` resolves against
// iframe.html, which is exactly where `staticDirs` put the file.
//
// Usage: node scripts/rewrite-storybook-asset-paths.mjs <build-dir>
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const buildDir = process.argv[2];
if (!buildDir) {
  console.error(
    'usage: node scripts/rewrite-storybook-asset-paths.mjs <build-dir>',
  );
  process.exit(1);
}

const ASSET_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.svg',
  '.webp',
  '.avif',
  '.gif',
]);

// Only rewrite names that actually sit at the root of the build — anything
// else is not a static asset and must be left alone.
const assets = new Set(
  readdirSync(buildDir).filter((name) =>
    ASSET_EXTENSIONS.has(extname(name).toLowerCase()),
  ),
);
// Both of the checks in this script are invariants of a correct Storybook
// build, not tolerable states. This script exists to prevent a failure that is
// otherwise silent — broken images on a deployed page — so it must not fail
// silently itself.
if (assets.size === 0) {
  console.error(
    `storybook asset paths: no image assets at the root of ${buildDir}. ` +
      'Either the build directory is wrong, or staticDirs stopped emitting them.',
  );
  process.exit(1);
}

const pattern = /(["'`])\/([\w.@-]+\.\w+)\1/g;
let rewritten = 0;

/** Built files that can carry an asset reference. */
function* buildFiles() {
  for (const file of readdirSync(buildDir, { recursive: true })) {
    const path = join(buildDir, file);
    // `.css` is deliberately absent: a relative URL in a stylesheet resolves
    // against the stylesheet, not the document, so rewriting one would break it.
    // Nothing in `src/` uses `url(…)`, and the docs state that rule.
    if (/\.(js|html)$/.test(path)) yield path;
  }
}

for (const path of buildFiles()) {
  const source = readFileSync(path, 'utf8');
  const next = source.replace(pattern, (match, quote, name) =>
    assets.has(name) ? `${quote}./${name}${quote}` : match,
  );
  if (next !== source) {
    writeFileSync(path, next);
    rewritten += 1;
  }
}

// Postcondition. Checking the result rather than the number of edits keeps the
// script idempotent while still failing loudly if the rewrite ever stops
// matching — the whole point of this script is to prevent a silent breakage,
// so it must not fail silently itself. The pattern mirrors the rewrite pattern
// exactly, so the check verifies only what the rewrite was meant to touch.
const leftover = [];
for (const path of buildFiles()) {
  const source = readFileSync(path, 'utf8');
  for (const name of assets) {
    const stray = new RegExp(`(["'\`])/${name.replace(/\./g, '\\.')}\\1`);
    if (stray.test(source)) leftover.push(`${path} -> /${name}`);
  }
}

if (leftover.length > 0) {
  console.error(
    'storybook asset paths: root-absolute asset references survived the rewrite. ' +
      'They will 404 when the gallery is served under a subpath:\n  ' +
      leftover.join('\n  '),
  );
  process.exit(1);
}

console.log(
  `storybook asset paths: rewrote ${rewritten} file(s) in ${buildDir}`,
);
