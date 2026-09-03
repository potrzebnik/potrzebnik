import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const componentRoot = path.join(repoRoot, 'src', 'components');

const KEBAB_CASE = 'kebab-case';
const PASCAL_CASE = 'PascalCase';

const CONVENTIONS = new Map([
  ['ui', KEBAB_CASE],
  ['sections', PASCAL_CASE],
  ['shared', PASCAL_CASE],
  ['features', PASCAL_CASE],
]);

const IS_KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IS_PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;

async function collectComponentFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectComponentFiles(full);
      return entry.name.endsWith('.tsx') ? [full] : [];
    }),
  );
  return files.flat();
}

function toPosix(absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/');
}

function componentNameOf(basename) {
  return basename.replace(/\.stories\.tsx$/, '').replace(/\.tsx$/, '');
}

function toPascalCase(name) {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

function toKebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function exportsComponentNamed(source, name) {
  const declaredExports = [
    new RegExp(`\\bexport\\s+default\\s+(?:async\\s+)?function\\s+${name}\\b`),
    new RegExp(`\\bexport\\s+(?:async\\s+)?function\\s+${name}\\b`),
    new RegExp(`\\bexport\\s+(?:const|let|var|class)\\s+${name}\\b`),
  ];
  if (declaredExports.some((pattern) => pattern.test(source))) return true;

  const defaultExportsIdentifier = new RegExp(
    `\\bexport\\s+default\\s+${name}\\s*;?\\s*$`,
    'm',
  );
  const localDeclaration = new RegExp(
    `\\b(?:function|const|let|var|class)\\s+${name}\\b`,
  );

  return defaultExportsIdentifier.test(source) && localDeclaration.test(source);
}

if (!existsSync(componentRoot)) {
  process.exit(0);
}

const componentFiles = (await collectComponentFiles(componentRoot)).sort();

const namingViolations = [];
const exportViolations = [];

for (const file of componentFiles) {
  const area = path
    .relative(componentRoot, file)
    .split(path.sep)
    .filter(Boolean)[0];
  const convention = CONVENTIONS.get(area);
  if (!convention) continue;

  const basename = path.basename(file);
  const isStory = basename.endsWith('.stories.tsx');
  const componentName = componentNameOf(basename);

  const matchesConvention =
    convention === KEBAB_CASE
      ? IS_KEBAB_CASE.test(componentName)
      : IS_PASCAL_CASE.test(componentName);

  if (!matchesConvention) {
    const suggestion =
      convention === KEBAB_CASE
        ? toKebabCase(componentName)
        : toPascalCase(componentName);
    namingViolations.push({
      file: toPosix(file),
      convention,
      suggestion: basename.replace(componentName, suggestion),
    });
    continue;
  }

  if (convention !== PASCAL_CASE || isStory) continue;

  const source = await readFile(file, 'utf8');
  if (exportsComponentNamed(source, componentName)) continue;

  exportViolations.push({ file: toPosix(file), componentName });
}

if (namingViolations.length === 0 && exportViolations.length === 0) {
  process.exit(0);
}

if (namingViolations.length > 0) {
  console.error('Component filenames breaking their directory convention.\n');
  for (const { file, convention, suggestion } of namingViolations) {
    console.error(`  ${file}`);
    console.error(
      `      expected a ${convention} basename, e.g. ${suggestion}`,
    );
    console.error('');
  }
}

if (exportViolations.length > 0) {
  console.error('Component filenames not matching their exported component.\n');
  for (const { file, componentName } of exportViolations) {
    console.error(`  ${file}`);
    console.error(
      `      expected an exported component named \`${componentName}\` —` +
        ` \`export function ${componentName}\`, \`export const ${componentName}\`,\n` +
        `      \`export default function ${componentName}\`, or a default export of a` +
        ` local \`${componentName}\``,
    );
    console.error('');
  }
}

console.error(
  'The boundary is code ownership, not taste. `src/components/ui` is the output\n' +
    'directory declared in components.json, and the shadcn CLI writes kebab-case\n' +
    'filenames there: renaming those means the next `shadcn add button` drops a\n' +
    'second `button.tsx` beside `Button.tsx`. Everything the project owns —\n' +
    'sections, shared, features — stays PascalCase and names the file after the\n' +
    'component it exports, so an import path reads the same as the symbol it binds.\n' +
    'The export check is skipped for ui/, whose files export several primitives.',
);
process.exit(1);
