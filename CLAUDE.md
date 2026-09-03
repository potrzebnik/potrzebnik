# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

This file is deliberately thin. It records only the gotchas that are cheap to violate and
expensive to catch, and points at the canonical sources for everything else. Do not duplicate
their contents here.

## Gotchas — do not violate these

- `src/db/resolve-database-url.ts` is the single source of the database connection URL, for both
  runtime and `drizzle.config.ts`. It **throws fast** on missing environment variables. Preserve
  that; never silently default a secret.
- No raw colour literals in styles. Styling is Tailwind utility classes co-located in JSX — no
  hand-written component CSS, no BEM classes. `.stylelintrc.json` enforces it.
- Stories are the primary component test harness. A change to a component is tested by its
  `*.stories.tsx`, which `vitest.config.ts` runs in a real browser.
- No `.tsx` file in `src/components/ui/` or `src/components/shared/` ships without a co-located
  `*.stories.tsx`; the `potrzebnik/require-colocated-story` ESLint rule enforces it.
- Viewport options live in exactly one place: `.storybook/viewports.mjs`, imported by both
  `.storybook/preview.tsx` and the lint rule. A story pins a viewport only by a key defined there
  or by one of `MINIMAL_VIEWPORTS` — an unknown key silently falls back to 1200px and tests the
  wrong layout; the `potrzebnik/valid-story-viewport` ESLint rule enforces it.
- Every image renders through `next/image`. A raw `<img>` or a CSS `url(/…)` breaks the published
  Storybook, which is served under a URL subpath.
- Project prose lives in exactly one place: `./docs/site/src/content/docs/`. This file and
  `./README.md` are the only exceptions, because a tool reads each at a fixed path.

## Where to look

Documentation source, by topic:

- Running the project locally: `./docs/site/src/content/docs/index.mdx`
- Code layout and why: `./docs/site/src/content/docs/architecture.mdx`
- Schema and migrations: `./docs/site/src/content/docs/database.mdx`
- Authentication: `./docs/site/src/content/docs/auth.mdx`
- Tokens and styling rules: `./docs/site/src/content/docs/design-system/tokens.mdx`
- Tests and the three vitest projects: `./docs/site/src/content/docs/testing.mdx`
- Branches, commits, PRs, and quality gates: `./docs/site/src/content/docs/contributing.mdx`
- Repo-local agents and skills: `./docs/site/src/content/docs/agents/usage.mdx`
- Deployment: `./docs/site/src/content/docs/deployment.mdx`

Scripts and dependency versions are canonical in `./package.json`. Agent and skill definitions are
canonical in `./.claude/`.
