import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import componentFilenameConvention from './component-filename-convention.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const owned = [{ convention: 'PascalCase', requireMatchingExport: true }];
const shadcn = [{ convention: 'kebab-case' }];

const ruleTester = new RuleTester();

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
      code: 'function StepItem() {}\nexport default StepItem;',
      filename: 'src/components/shared/StepItem.tsx',
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
      errors: [{ messageId: 'wrongConvention' }],
    },
    {
      code: 'export default { title: "Shared/BadgeGroup" };',
      filename: 'src/components/shared/badge-group.stories.tsx',
      options: owned,
      errors: [{ messageId: 'wrongConvention' }],
    },
    {
      code: 'export function BadgeCluster() {}',
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
      code: 'export const Button = () => null;',
      filename: 'src/components/ui/Button.tsx',
      options: shadcn,
      errors: [{ messageId: 'wrongConvention' }],
    },
  ],
});
