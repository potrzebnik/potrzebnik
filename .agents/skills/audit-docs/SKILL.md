---
name: audit-docs
description: Check the prose in CLAUDE.md, README.md and docs/site/src/content/docs against what the repository actually does. Verifies checkable claims — pnpm scripts, ESLint rule names, hook and workflow behaviour, described conventions — not taste. Fixes objective drift on the spot and surfaces judgement calls before editing. Run it after a refactor, after moving a gate, or on "is the documentation still true".
---

# Audit the docs against the repository

Prose rots quietly. The build already stops a docs page from pointing at a file that does not exist,
and from linking to a page that does not exist, but nothing checks a _sentence_. This skill checks
sentences. It is not a code review, and it is not a style pass: it looks only at whether documents
describing the repository still match it.

## Skip what a gate already covers

Do not spend the audit re-checking what fails the build on its own:

- File and directory paths behind `<RepoFile path="…" />` — `docs/site/src/components/RepoFile.astro`
  throws during the docs build when the path is missing.
- Internal links between docs pages — `starlight-links-validator` fails the build.

Everything below is unguarded, which is why it is the scope.

## Scope

- `CLAUDE.md` and `README.md`.
- Every `.mdx` under `docs/site/src/content/docs/`.
- The `name` and `description` frontmatter of every definition under `.claude/`, which the docs
  agent index reads.

If the user named a file, audit that file only.

## Process

### 1. Collect checkable claims

For each document in scope, list the **specific, checkable** claims. Checkable means one `cat`,
`grep` or `ls` settles it, with no judgement:

- "`pnpm X` does Y" — read `scripts` in `package.json`, or in `docs/site/package.json` for the docs
  workspace.
- "`pnpm check` runs A, B and C" — read the `check` script and follow every command it chains.
- "Rule `potrzebnik/X` applies to Z" — read the `files` and `rules` blocks in `eslint.config.mjs`,
  and the rule's own `meta` and `messages` in `eslint-rules/`.
- "The `pre-push` hook runs Y" — read `.husky/pre-push`. A hook is a frequent source of drift because
  nothing else reads it.
- "CI runs J on every pull request" — read the `on:` triggers and job names in
  `.github/workflows/*.yml`. A workflow that triggers only on `branches: [main]` does not run on a
  pull request aimed anywhere else.
- "Colour values live only in `src/app/theme.css`" — read `.stylelintrc.json` and the file.
- "Directory D holds only kebab-case files" — list the directory.
- A named script under `scripts/` — check it still exists. Gates move into ESLint rules here, and the
  script they replaced is deleted.

Skip claims with no unambiguous test ("the code should be readable"). Those are not this audit.

### 2. Verify each claim

Mark each one: confirmed / **objective drift** / **needs a decision**.

- **Objective drift** — the fact changed and the description did not: a script renamed, a gate moved,
  a file deleted, a command that no longer exists. No judgement is involved.
- **Needs a decision** — the document is technically accurate but proposes a convention the
  repository no longer follows, or the fix would change something other people rely on. This goes to
  the user.

### 3. Fix objective drift immediately

Edit the description to the current state. Do not ask permission for these; they are checkable and
git makes them reversible.

`CLAUDE.md` and the docs pages describe **current state only** — no dates, no "this used to be X",
no record of how a decision was reached. A fix is therefore a rewrite of the sentence, never an
appended note about the change.

### 4. Show the rest before editing

A numbered list: document, claim, what the repository actually does, proposed change. Wait for the
user to choose. Edit nothing from this list without confirmation.

### 5. Follow `writing-for-agents` while editing

Every one of these documents is consumed by an agent. One source of truth per fact, no duplication
between sections, no sediment. If a rule's own `messages` already explain something when the rule
fires, that is the source of truth and the docs page should not restate it.

If the edit runs to more than a sentence or two, read `.claude/skills/writing-for-agents/SKILL.md`
before saving.

### 6. Report

Three lists: confirmed unchanged, fixed automatically, waiting on a decision and which. Name the
files touched so the diff is easy to read.

## Completion criterion

Every checkable claim in scope has a verdict, and every objective drift is either fixed or listed
with the reason it was not. A document reported as clean means its claims were checked, not that it
was skimmed.
