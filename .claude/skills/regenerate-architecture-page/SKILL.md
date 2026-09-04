---
name: regenerate-architecture-page
description: Regenerate the Architecture docs page and its SVG diagram from the current repository layout. Run this by hand whenever the shape of the codebase changes; it is deliberately not part of the docs build.
---

# Regenerate the architecture page

Rewrites `docs/site/src/content/docs/architecture.mdx` and
`docs/site/src/assets/architecture.svg` from what the repository actually looks
like right now. Output is committed, so the diff lands in the same pull request
as the change that altered the architecture.

Do not wire this into `astro build`. A generator in the build makes the docs
build nondeterministic and slow, and hides the diff from review.

## Steps

1. Read the current layout. At minimum: `src/app/` route groups, `src/components/`
   (`ui/`, `shared/`, `features/`, `sections/`), `src/db/`, `src/test/`,
   `.storybook/`, and the root config files (`next.config.ts`,
   `drizzle.config.ts`, `vitest.config.ts`, `vitest.node.config.ts`,
   `components.json`).
2. Rewrite `architecture.mdx`. Keep the frontmatter contract: `title` and
   `description`, nothing else. State **why** each layer exists, its **shape**,
   and the **path** to it. Do not restate script lists, dependency versions, or
   config file contents — the reader can open the repo. Reference every repo
   path with `<RepoFile path="…" />`.
3. Regenerate the diagram at `docs/site/src/assets/architecture.svg` and embed
   it from the page. Keep it to the boxes a newcomer needs: browser → Next App
   Router → components → database, with Storybook alongside the component layer.
4. Run `pnpm --filter docs build` and fix anything it reports. `RepoFile` fails
   the build on a path that no longer exists; `starlight-links-validator` fails
   on a broken internal link.
5. Commit the page and the SVG together.

## Diagram constraints — both are mandatory

1. **One SVG element per line.** Every `<rect>`, `<line>`, `<path>`, `<text>` and
   `<g>` starts on its own line, so a regenerated diagram produces a reviewable
   diff instead of one changed line.
2. **No literal colours.** Use `currentColor`, or Starlight's own custom
   properties (`var(--sl-color-accent)`, `var(--sl-color-gray-5)`,
   `var(--sl-color-text)`). A baked-in hex desyncs the diagram from the site's
   light/dark toggle, which switches on `[data-theme]`.

Also set `role="img"` and give the SVG a `<title>` so the diagram is announced
to screen readers.
