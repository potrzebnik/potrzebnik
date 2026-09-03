import path from 'node:path';

const KEBAB_CASE = 'kebab-case';
const PASCAL_CASE = 'PascalCase';

const IS_KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IS_PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;

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

function topLevelDeclarationNames(body) {
  const names = new Set();
  for (const statement of body) {
    if (
      (statement.type === 'FunctionDeclaration' ||
        statement.type === 'ClassDeclaration') &&
      statement.id
    ) {
      names.add(statement.id.name);
      continue;
    }
    if (statement.type !== 'VariableDeclaration') continue;
    for (const declarator of statement.declarations) {
      if (declarator.id.type === 'Identifier') names.add(declarator.id.name);
    }
  }
  return names;
}

const componentFilenameConvention = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a component filename to follow its directory convention and, where the ' +
        'project owns the file, to match the name of the component it exports.',
    },
    messages: {
      wrongConvention:
        '`{{basename}}` breaks the naming convention of its directory — expected a ' +
        '{{convention}} basename, e.g. {{suggestion}}. The boundary is code ownership, not ' +
        'taste: `src/components/ui` is the output directory declared in components.json and ' +
        'the shadcn CLI writes kebab-case filenames there, so renaming those means the next ' +
        '`shadcn add button` drops a second `button.tsx` beside `Button.tsx`. Everything the ' +
        'project owns — sections, shared, features — stays PascalCase instead, and is named ' +
        'after the component it exports.',
      filenameExportMismatch:
        '`{{basename}}` exports no component named `{{componentName}}` — expected `export ' +
        'function {{componentName}}`, `export const {{componentName}}`, `export default ' +
        'function {{componentName}}`, or a default export of a local `{{componentName}}`. A ' +
        'file the project owns is named after the component it exports, so an import path ' +
        'reads the same as the symbol it binds. This half of the gate is skipped for ' +
        '`src/components/ui/`, whose files export several primitives at once.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          convention: { enum: [KEBAB_CASE, PASCAL_CASE] },
          requireMatchingExport: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const { convention = PASCAL_CASE, requireMatchingExport = false } =
      context.options[0] ?? {};

    const basename = path.basename(context.filename);
    if (!basename.endsWith('.tsx')) return {};

    const isStory = basename.endsWith('.stories.tsx');
    const componentName = basename
      .replace(/\.stories\.tsx$/, '')
      .replace(/\.tsx$/, '');

    const matchesConvention =
      convention === KEBAB_CASE
        ? IS_KEBAB_CASE.test(componentName)
        : IS_PASCAL_CASE.test(componentName);

    if (!matchesConvention) {
      const suggestion =
        convention === KEBAB_CASE
          ? toKebabCase(componentName)
          : toPascalCase(componentName);
      return {
        Program(node) {
          context.report({
            node,
            messageId: 'wrongConvention',
            data: {
              basename,
              convention,
              suggestion: basename.replace(componentName, suggestion),
            },
          });
        },
      };
    }

    if (!requireMatchingExport || isStory) return {};

    let exportsComponent = false;
    let defaultExportedIdentifier = null;

    return {
      ExportDefaultDeclaration(node) {
        const { declaration } = node;
        if (
          (declaration.type === 'FunctionDeclaration' ||
            declaration.type === 'ClassDeclaration') &&
          declaration.id?.name === componentName
        ) {
          exportsComponent = true;
          return;
        }
        if (declaration.type === 'Identifier') {
          defaultExportedIdentifier = declaration.name;
        }
      },
      ExportNamedDeclaration(node) {
        const { declaration } = node;
        if (!declaration) return;
        if (
          declaration.type === 'FunctionDeclaration' ||
          declaration.type === 'ClassDeclaration'
        ) {
          if (declaration.id?.name === componentName) exportsComponent = true;
          return;
        }
        if (declaration.type !== 'VariableDeclaration') return;
        for (const declarator of declaration.declarations) {
          if (
            declarator.id.type === 'Identifier' &&
            declarator.id.name === componentName
          ) {
            exportsComponent = true;
          }
        }
      },
      'Program:exit'(node) {
        if (exportsComponent) return;
        if (
          defaultExportedIdentifier === componentName &&
          topLevelDeclarationNames(node.body).has(componentName)
        ) {
          return;
        }
        context.report({
          node,
          messageId: 'filenameExportMismatch',
          data: { basename, componentName },
        });
      },
    };
  },
};

export default componentFilenameConvention;
