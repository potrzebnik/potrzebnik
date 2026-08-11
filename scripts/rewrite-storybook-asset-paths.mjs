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
if (assets.size === 0) {
  console.log('storybook asset paths: nothing to rewrite');
  process.exit(0);
}

const pattern = /(["'`])\/([\w.@-]+\.\w+)\1/g;
let rewritten = 0;

for (const file of readdirSync(buildDir, { recursive: true })) {
  const path = join(buildDir, file);
  if (!/\.(js|css|html)$/.test(path)) continue;
  const source = readFileSync(path, 'utf8');
  const next = source.replace(pattern, (match, quote, name) =>
    assets.has(name) ? `${quote}./${name}${quote}` : match,
  );
  if (next !== source) {
    writeFileSync(path, next);
    rewritten += 1;
  }
}

console.log(
  `storybook asset paths: rewrote ${rewritten} file(s) in ${buildDir}`,
);
