---
description: Teaching-mode code review. Runs code-reviewer + frontend-reviewer in parallel on diff vs main, prints teaching cards. Pass --fix to walk findings interactively.
argument-hint: '[--fix]'
---

# mentor-review

Pre-PR code review for junior developers. Orchestrates the repo's two reviewer agents, normalises their YAML output into a single ranked list, and presents each finding as a teaching card. Optional `--fix` mode walks findings one-by-one and applies accepted fixes with a Sonnet sub-agent.

## Modes

- **Informative** — no args. Print all findings as teaching cards. No interaction. No edits.
- **Fix** — `--fix`. Show overview, then for each finding: card → Accept/Reject → on Accept, spawn Sonnet sub-agent to apply `fix_proposal`, show resulting `git diff` inline, move on.

Trigger `--fix` mode when `$ARGUMENTS` contains the literal string `--fix`. Anything else → informative.

## Step 1 — Resolve scope

Run, in parallel:

```bash
git diff main...HEAD --name-only
git status --porcelain
```

Concatenate both file lists; dedupe. If empty: print `No changes vs main — nothing to review.` and exit.

Save the file list as `<diff-files>` for the agent prompts.

## Step 2 — Spawn both reviewers in parallel

**Single message, two `Agent` tool calls**:

1. `subagent_type: "Code Reviewer"` — prompt: "Review the following files in this repo against the current diff (`git diff main...HEAD` plus uncommitted changes): `<diff-files>`. Emit findings as YAML per the Output Format in your agent definition. Backend / non-frontend concerns only; skip TSX/CSS files (frontend-reviewer handles those)."

2. `subagent_type: "frontend-reviewer"` — prompt: "Review the following files in this repo against `git diff main`: `<diff-files>`. Filter to TSX, CSS, Storybook stories. Emit findings as YAML per the Output Format in your agent definition."

Each returns a YAML block. Parse `findings` from each. If parse fails, surface the raw agent output and stop.

## Step 3 — Merge, sort, hydrate

1. Concatenate finding lists. Drop entries with `severity` outside `{blocker, major, nit}`.
2. Sort: `severity` (blocker → major → nit), then `file` alphabetically, then `lines.start` ascending.
3. Number them `1..N`.
4. **Snippet hydration** — for each finding where `code_snippet` is empty/whitespace:
   - Parse `lines` as `<start>-<end>`. Read `file` with `offset=<start>`, `limit=min(<end>-<start>+1, 40)`.
   - Set `code_snippet` to the read content. If range exceeded 40, append `… (truncated, <N> more lines)`.
   - On Read error: set `code_snippet` to `(snippet unavailable: <reason>)`.

## Step 4 — Overview

Print compact table:

```
mentor-review — <N> findings on diff vs main

#  sev      file:line              title                            principle
1  blocker  src/foo.tsx:42         target="_blank" without rel       a11y-external-rel
2  major    src/db/users.ts:18     SQL injection in user lookup      parameterized-queries
…

Counts: blocker <Nb>, major <Nm>, nit <Nn>
Recurring principles: <slug> ×<count>, …   (only show slugs with count ≥ 2)
```

Then:

- **Informative mode** → continue to Step 5 (print all cards), then stop.
- **Fix mode** → continue to Step 6 (interactive walk).

## Step 5 — Teaching card layout

For each finding, in numbered order, render:

````
─────────────────────────────────────────────
[<severity>] #<n> — <title>   (principle: <principle>)
File: <file>:<lines>

Concept:  <one-line restatement of the principle>
Why:      <rationale>
Impact:   <impact>

Code:
```<lang>
<code_snippet>
````

Fix:

```<lang>
<fix_proposal>
```

References: <comma-joined references>

```

- `Concept:` line = a one-sentence restatement of `principle` in plain English. If the agent didn't provide one, derive from the principle slug (e.g. `a11y-external-rel` → "External links opened in a new tab need `rel=\"noopener noreferrer\"` for safety.").
- Omit `References:` line entirely if `references` is empty.
- Omit `Fix:` block if `fix_proposal` is empty.
- If `code_snippet` is a `(snippet unavailable: …)` sentinel, render as italic line, not a fenced block.

**`<lang>` mapping** by file extension:

| Extension | `<lang>` |
|-----------|----------|
| `.ts`, `.tsx` | `ts` |
| `.js`, `.jsx`, `.mjs`, `.cjs` | `js` |
| `.css` | `css` |
| `.md` | `markdown` |
| `.json` | `json` |
| `.yml`, `.yaml` | `yaml` |
| `.sh` | `bash` |
| anything else / no extension | `text` |

In informative mode, after the last card print:

```

Done. <N> findings shown. Re-run with `--fix` to walk through them interactively.

````

## Step 6 — Fix walk (only in `--fix` mode)

For each finding 1..N, in order:

1. Render the teaching card (Step 5 format).
2. Invoke `AskUserQuestion` with one question, header `Finding <n>/<N>`, options:
   - **Accept** — "Apply the fix. A Sonnet sub-agent will edit the file."
   - **Reject** — "Skip this finding. Move on."
3. **On Accept**:
   - Spawn `Agent` (`subagent_type: "general-purpose"`, `model: "sonnet"`, foreground / NOT background). Prompt:
     ```
     Apply this single fix to the potrzebnik repo. Do not make unrelated changes.

     File: <file>
     Lines: <lines>
     Issue: <title> (principle: <principle>)

     Current code at those lines:
     ```
     <code_snippet>
     ```

     Required fix:
     ```
     <fix_proposal>
     ```

     Steps:
     1. Read <file> to confirm the current state.
     2. Apply the fix using Edit. Match indentation exactly.
     3. Do not touch anything outside the targeted lines and their immediate surroundings.
     4. Return a one-line confirmation: "fixed <file>" or "failed: <reason>".
     ```
   - Wait for sub-agent to return.
   - Run `git diff -- <file>` and print the output under a header `Applied:`.
   - Increment `accepted`.
4. **On Reject**: increment `rejected`. Move on silently.
5. After each decision, print running tally: `Progress: <i>/<N> · accepted <accepted>, rejected <rejected>`.

After the loop:

````

mentor-review complete.
Accepted: <accepted> Rejected: <rejected>

Review the staged/unstaged changes (`git diff`) and commit when ready.

```

## Notes

- **No persistence.** Findings live only in this session. No reports written to disk. No KB rules promoted.
- **Self-contained to potrzebnik.** Do not reference general workflow scripts, `$WF_GENERAL_KB`, or `~/.claude/scripts/*` from this skill — those are unrelated infrastructure.
- **Read-only agents.** Both reviewer agents are forbidden from editing. Only the fix sub-agent in Step 6 edits files.
- **Sequential fixes.** Each fix runs foreground so the user sees the diff before moving on. Don't parallelise.
- **No Elaborate option** in this version. If a card is unclear, the user can reject and ask separately.
```
