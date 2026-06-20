# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

It is intentionally thin: it **points to** the canonical sources and records only the gotchas you can't infer from them. Read the linked files directly — do not duplicate their contents here, so there is only one thing to keep up to date.

## Commands

- Scripts and dependency versions: [`package.json`](./package.json) (canonical). Package manager is **pnpm**; Node + Docker required.
- Local bootstrap and DB migration steps: [`README.md`](./README.md) → _Getting Started_ / _Database Migrations_.

## Architecture

Next.js App Router under `src/app/` with two route groups: `(public)/` and `(dashboard)/dashboard`. Path alias `@/*` → `src/*`. UI primitives live in `src/components/ui/` (shadcn-style, see [`components.json`](./components.json)); feature composites in `src/components/features/`. Tailwind v4 via `@tailwindcss/postcss`.

### Database

Drizzle ORM + `pg` against Postgres. Config: [`drizzle.config.ts`](./drizzle.config.ts); compose service in [`compose.yml`](./compose.yml); client in `src/db/index.ts`; migrations in `./drizzle`.

- `src/db/resolve-database-url.ts` is the single source for the connection URL (runtime + `drizzle.config.ts`). It **throws fast** on missing vars — preserve this; do not silently default secrets.

### Storybook + Vitest

Storybook (`.storybook/`) is the test surface. See [`vitest.config.ts`](./vitest.config.ts): one project (`storybook`) runs every `*.stories.*` in a real Chromium browser via `@vitest/browser-playwright`. Treat stories as the primary component test harness.

### Repo-local agents

`.claude/agents/` ships `code-reviewer.md` and `frontend-reviewer.md` — invoke via the Agent tool when reviewing diffs. See [`.claude/README.md`](./.claude/README.md).

## Contribution rules

Branch naming, commit conventions, PR rules, and code-quality gates: [`README.md`](./README.md) → _Contributing_.
