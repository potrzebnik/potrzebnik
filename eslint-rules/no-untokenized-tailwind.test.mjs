import tsParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe, expect, it } from 'vitest';

import noUntokenizedTailwind, {
  parseColorTokens,
} from './no-untokenized-tailwind.mjs';

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
    'const c = "border-s-border border-e-header-rule border-s-2 border-e";',
    'const el = <div style={{ boxSizing: "border-box" }} />;',
    'const c = { transformBox: "fill-box", other: "stroke-box" };',
    'expect(el).toHaveStyle("text-align: center");',
    'import TextField from "@/components/ui/text-field";',
    'export { x } from "./bg-nope";',
    'const img = "/img/bg-image.png";',
    'const c = "see file bg-nope.png or bg-nope: here";',
    'const c = "bg-top-left bg-top-right bg-bottom-left bg-bottom-right bg-left-top bg-right-bottom";',
    'const c = "shadow-md shadow-2xs shadow-none inset-shadow-sm text-shadow-lg inset-ring-2";',
    'const c = "shadow-foreground/20 inset-ring-border placeholder-muted-foreground";',
    'const c = "!bg-background bg-background! md:hover:bg-accent/[0.3] group-hover/item:text-primary";',
    'const c = `bg-carousel-dot-${state} ${prefix}bg-nope text-nope${suffix}`;',
    'const props = ["text-align", "text-decoration", "text-shadow", "text-transform", "border-width", "border-style", "border-radius", "outline-color"];',
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
    {
      code: 'const c = "border-s-nope border-e-header-rulee";',
      errors: [
        {
          messageId: 'unknownColorToken',
          data: { match: 'border-s-nope', name: 'nope' },
        },
        {
          messageId: 'unknownColorToken',
          data: { match: 'border-e-header-rulee', name: 'header-rulee' },
        },
      ],
    },
    {
      code: 'const c = "shadow-nope inset-ring-nope placeholder-nope text-shadow-nope/40";',
      errors: [
        {
          messageId: 'unknownColorToken',
          data: { match: 'shadow-nope', name: 'nope' },
        },
        {
          messageId: 'unknownColorToken',
          data: { match: 'inset-ring-nope', name: 'nope' },
        },
        {
          messageId: 'unknownColorToken',
          data: { match: 'placeholder-nope', name: 'nope' },
        },
        {
          messageId: 'unknownColorToken',
          data: { match: 'text-shadow-nope/40', name: 'nope' },
        },
      ],
    },
    {
      code: 'const c = `flex ${a} bg-nope! ${b}`;',
      errors: [
        {
          messageId: 'unknownColorToken',
          data: { match: 'bg-nope!', name: 'nope' },
          column: 22,
          endColumn: 30,
        },
      ],
    },
  ],
});

describe('parseColorTokens', () => {
  it('collects --color-* from every @theme block, ignoring comments and nested blocks', () => {
    const css = `
      @theme inline {
        --color-first: var(--a);
        /* --color-commented: var(--b); } */
        @keyframes spin { to { rotate: 1turn; } }
        --color-after-keyframes: var(--c);
      }
      :root { --color-not-theme: #fff; }
      @theme {
        --color-second: var(--d);
        --font-sans: var(--e);
      }
    `;
    expect([...parseColorTokens(css)].sort()).toEqual([
      'after-keyframes',
      'first',
      'second',
    ]);
  });
});
