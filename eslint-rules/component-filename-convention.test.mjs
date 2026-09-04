import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import componentFilenameConvention from './component-filename-convention.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const owned = [{ convention: 'PascalCase', requireMatchingExport: true }];
const shadcn = [{ convention: 'kebab-case' }];

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('component-filename-convention', componentFilenameConvention, {
  valid: [
    {
      code: 'export default function PublicHeader() {}',
      filename: 'src/components/features/PublicHeader.tsx',
      options: owned,
    },
    {
      code: 'export function HelpCard() {}',
      filename: 'src/components/shared/HelpCard.tsx',
      options: owned,
    },
    {
      code: 'export const BadgeGroup = () => null;',
      filename: 'src/components/shared/BadgeGroup.tsx',
      options: owned,
    },
    {
      code: 'export let BadgeGroup = () => null;',
      filename: 'src/components/shared/BadgeGroup.tsx',
      options: owned,
    },
    {
      code: 'export class HelpCard {}',
      filename: 'src/components/shared/HelpCard.tsx',
      options: owned,
    },
    {
      code: 'export default class HelpCard {}',
      filename: 'src/components/shared/HelpCard.tsx',
      options: owned,
    },
    {
      code: 'export const BadgeGroup: React.FC = () => <div />;',
      filename: 'src/components/shared/BadgeGroup.tsx',
      options: owned,
    },
    {
      code: 'export default function PublicFooter(props: { year: number }) {\n  return <footer>{props.year}</footer>;\n}',
      filename: 'src/components/features/PublicFooter.tsx',
      options: owned,
    },
    {
      code: 'const StepItem = () => null;\nexport default StepItem; // the component',
      filename: 'src/components/shared/StepItem.tsx',
      options: owned,
    },
    {
      code: 'export function AboutSection() {}',
      filename: 'src/components/sections/AboutSection.tsx',
      options: owned,
    },
    {
      code: 'function StepItem() {}\nexport default StepItem;',
      filename: 'src/components/shared/StepItem.tsx',
      options: owned,
    },
    {
      code: 'const Step2Item = () => null;\nexport default Step2Item;',
      filename: 'src/components/shared/Step2Item.tsx',
      options: owned,
    },
    {
      code: 'import { BadgeGroup } from "./BadgeGroup";\nexport default { title: "Shared/BadgeGroup", component: BadgeGroup };',
      filename: 'src/components/shared/BadgeGroup.stories.tsx',
      options: owned,
    },
    {
      code: 'export const Button = () => null;\nexport const buttonVariants = () => null;',
      filename: 'src/components/ui/button.tsx',
      options: shadcn,
    },
    {
      code: 'export const AlertDialog = () => null;\nexport const AlertDialogTrigger = () => null;',
      filename: 'src/components/ui/alert-dialog.tsx',
      options: shadcn,
    },
  ],
  invalid: [
    {
      code: 'export const BadgeGroup = () => null;',
      filename: 'src/components/shared/badge-group.tsx',
      options: owned,
      errors: [
        {
          messageId: 'pascalCaseFilename',
          data: { basename: 'badge-group.tsx', suggestion: 'BadgeGroup.tsx' },
        },
      ],
    },
    {
      code: 'export default { title: "Shared/Step2Item" };',
      filename: 'src/components/shared/step2-item.stories.tsx',
      options: owned,
      errors: [
        {
          messageId: 'pascalCaseFilename',
          data: {
            basename: 'step2-item.stories.tsx',
            suggestion: 'Step2Item.stories.tsx',
          },
        },
      ],
    },
    {
      code: 'export const Button = () => null;',
      filename: 'src/components/ui/Button.tsx',
      options: shadcn,
      errors: [
        {
          messageId: 'kebabCaseFilename',
          data: { basename: 'Button.tsx', suggestion: 'button.tsx' },
        },
      ],
    },
    {
      code: 'export const Step2Item = () => null;',
      filename: 'src/components/ui/Step2Item.tsx',
      options: shadcn,
      errors: [
        {
          messageId: 'kebabCaseFilename',
          data: { basename: 'Step2Item.tsx', suggestion: 'step2-item.tsx' },
        },
      ],
    },
    {
      code: 'export function BadgeCluster() {}',
      filename: 'src/components/shared/BadgeGroup.tsx',
      options: owned,
      errors: [
        {
          messageId: 'filenameExportMismatch',
          data: { basename: 'BadgeGroup.tsx', componentName: 'BadgeGroup' },
        },
      ],
    },
    {
      code: '// export function BadgeGroup() {}\nexport default function BadgeCluster() {}',
      filename: 'src/components/shared/BadgeGroup.tsx',
      options: owned,
      errors: [{ messageId: 'filenameExportMismatch' }],
    },
    {
      code: 'const snippet = "export const BadgeGroup = () => null;";\nexport default function BadgeCluster() {\n  return snippet;\n}',
      filename: 'src/components/shared/BadgeGroup.tsx',
      options: owned,
      errors: [{ messageId: 'filenameExportMismatch' }],
    },
    {
      code: 'import StepItem from "./step-item";\nexport default StepItem;',
      filename: 'src/components/shared/StepItem.tsx',
      options: owned,
      errors: [{ messageId: 'filenameExportMismatch' }],
    },
    {
      code: 'if (true) {\n  function StepItem() {}\n}\nexport default StepItem;',
      filename: 'src/components/shared/StepItem.tsx',
      options: owned,
      errors: [{ messageId: 'filenameExportMismatch' }],
    },
  ],
});
