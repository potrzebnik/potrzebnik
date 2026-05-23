# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **pnpm**. Node + Docker required.

- `bash startup_dev.sh` — full local bootstrap: requires `.env` (copy from `.env.example`); runs `pnpm install`, `docker compose up -d --wait` (Postgres 18.3, service `postgres`, container `potrzebnik-db` in `compose.yml`), `pnpm db:migrate`, then `npm run dev` (script uses npm at the end — inconsistent with pnpm elsewhere).
- `pnpm dev` / `pnpm build` / `pnpm start` — Next.js (Next 16, React 19, React Compiler enabled).
- `pnpm check` — `tsc --noEmit && eslint . && prettier --check .` (run before PRs).
- `pnpm lint` / `pnpm lint:fix` / `pnpm format` / `pnpm type-check`.
- `pnpm db:generate` — generate Drizzle migration into `./drizzle` (schema path per `drizzle.config.ts` is `./src/db/schema.ts`; file is not yet created — add it before first generate).
- `pnpm db:migrate` — apply pending migrations.
- `pnpm db:studio` — Drizzle Studio.
- `pnpm storybook:dev` (port 6006) / `pnpm storybook:build`.
- Tests: Vitest via Storybook addon, browser mode (`@vitest/browser-playwright` → Chromium, headless). No `test` script defined — invoke directly: `pnpm exec vitest` (all) or `pnpm exec vitest run path/to/file.stories.tsx` (single). Project name: `storybook` (see `vitest.config.ts`); tests come from `*.stories.*` files, not standalone `*.test.ts`.

Husky + lint-staged run `eslint --fix` on staged TS/JS and `prettier --write` on JSON/MD/CSS. Commits validated by commitlint (Conventional Commits).

## Architecture

Next.js App Router under `src/app/` with two route groups:

- `(public)/` — marketing + public pages (`about`, `contact`, `faqs`, `needs`, `organizations`, `privacy-policy`, `terms`) sharing `layout.tsx`.
- `(dashboard)/dashboard` — authed app area with route-level `layout.tsx` and pages `needs`, `settings`. No group-level `(dashboard)/layout.tsx` yet; only `(public)/` has one. Note: `needs` exists in both route groups (public vs. dashboard).
- `api/` — route handlers (e.g. `api/orgs`).

Path alias `@/*` → `src/*`.

`src/components/ui/` holds shadcn-style primitives (configured via `components.json`, Radix + CVA + tailwind-merge). `src/components/features/` holds feature-scoped composites. Tailwind v4 via `@tailwindcss/postcss`; `prettier-plugin-tailwindcss` sorts classes.

### Database

Drizzle ORM + `pg` against Postgres (compose service `potrzebnik-db`). Client in `src/db/index.ts`. Schema path configured as `src/db/schema.ts` but not yet created. Migrations in `./drizzle`.

`src/db/resolve-database-url.ts` is the single source for the connection URL — used by both runtime (`db/index.ts`) and `drizzle.config.ts`. It accepts `DATABASE_URL` (expanding `${VAR}` references) or falls back to building one from `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` (+ optional `POSTGRES_HOST` / `POSTGRES_PORT`). Throws fast on missing vars — preserve this behavior; do not silently default secrets.

### Storybook + Vitest

Storybook (`.storybook/`) is the test surface. `vitest.config.ts` defines one project (`storybook`) that runs every `*.stories.*` in a real Chromium browser via `@vitest/browser-playwright`. Treat stories as the primary component test harness.

### Repo-local agents

`.claude/agents/` ships `code-reviewer.md` and `frontend-reviewer.md` — invoke via the Agent tool when reviewing diffs in this repo.

## Contribution rules (from README)

- Branches: `type/#ticket_number-short-description` (types: feat/fix/docs/refactor/test/chore).
- PR title: `type: description (#ticket)`. Squash-merge. ≥1 approval required. No direct push to `main`.
- At least one commit on the branch must reference the ticket number (preserved on squash).
- Run `pnpm check` before review.
