import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import noUntokenizedTailwind from './no-untokenized-tailwind.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-untokenized-tailwind', noUntokenizedTailwind, {
  valid: [
    'const c = "bg-background text-foreground border-border";',
    'const c = "hover:bg-header-cta/80 focus-visible:ring-ring/50 dark:bg-input/30";',
    'const c = "border-t-header-rule border-b ring-offset-background fill-org-signup-panel-bg";',
    'const c = "text-2xl text-sm text-base text-center text-left text-justify text-balance";',
    'const c = "border-2 border-t border-x-2 border-t-0 border-none border-solid border-dashed";',
    'const c = "border-r-[0.5px] bg-(--footer-bg) text-(length:--size) bg-[url(/x.png)]";',
    'const c = "bg-transparent bg-current text-inherit border-transparent";',
    'const c = "bg-cover bg-center bg-no-repeat bg-clip-text bg-linear-to-r from-10% to-90%";',
    'const c = "outline-none outline-hidden outline-offset-2 ring-2 ring-inset ring-offset-2";',
    'const c = "divide-x divide-y-reverse decoration-2 decoration-wavy stroke-2 accent-auto";',
    'const c = "data-[slide-in-from-top-2]:animate-in slide-in-from-top-2 fade-in-0";',
    'const c = "Tekst, który nie jest klasą, ale zawiera słowo text i myślnik - oraz border.";',
    'const el = <div className="bg-card text-card-foreground">text-driven height</div>;',
  ],
  invalid: [
    {
      code: 'const c = "bg-muted p-4";',
      errors: [
        {
          messageId: 'unknownColorToken',
          data: { match: 'bg-muted', name: 'muted' },
        },
      ],
    },
    {
      code: 'const el = <p className="text-mutedd text-sm" />;',
      errors: [
        {
          messageId: 'unknownColorToken',
          data: { match: 'text-mutedd', name: 'mutedd' },
        },
      ],
    },
    {
      code: 'const v = cva("px-3", { variants: { tone: { ghost: "hover:bg-nope/50" } } });',
      errors: [
        {
          messageId: 'unknownColorToken',
          data: { match: 'bg-nope/50', name: 'nope' },
        },
      ],
    },
    {
      code: 'const c = `flex ${open ? "block" : "hidden"} border-t-header-rulee`;',
      errors: [
        {
          messageId: 'unknownColorToken',
          data: { match: 'border-t-header-rulee', name: 'header-rulee' },
        },
      ],
    },
    {
      code: 'const c = "bg-red-500";',
      errors: [{ messageId: 'palette' }],
    },
  ],
});
