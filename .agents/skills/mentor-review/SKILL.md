---
name: mentor-review
description: Teaching-mode code review for junior developers. Runs code-reviewer and frontend-reviewer in parallel on the diff vs main, ranks findings, and prints each as a teaching card (concept, why, impact, code, fix). Use when the user wants a pre-PR review pitched as a lesson rather than a checklist, or invokes /mentor-review or --fix to walk findings interactively and apply accepted fixes.
---

# mentor-review

Trigger fix mode when the invocation contains the literal string `--fix`; otherwise run informative mode.

## Step 1 — Resolve scope

Run in parallel:

```bash
git diff main...HEAD --name-only
git status --porcelain
```

Concatenate both file lists, dedupe, call it `<diff-files>`. If empty, print `No changes vs main — nothing to review.` and stop. **Completion:** every changed and staged/unstaged file is in `<diff-files>`, or the empty-case message printed.

## Step 2 — Spawn both reviewers, one message, two Agent calls

1. `subagent_type: "code-reviewer"` — prompt: "Review these files against the current diff (`git diff main...HEAD` plus uncommitted changes): `<diff-files>`. Emit findings as YAML per the Output Format in your agent definition. Backend / non-frontend concerns only; skip TSX/CSS files (frontend-reviewer handles those)."
2. `subagent_type: "frontend-reviewer"` — prompt: "Review these files against `git diff main`: `<diff-files>`. Filter to TSX, CSS, Storybook stories. Emit findings as YAML per the Output Format in your agent definition."

Both are read-only — neither may edit files. Parse `findings` from each YAML block. If either fails to parse, surface the raw output and stop. **Completion:** both agents returned and their findings parsed, or the failure was surfaced.

## Step 3 — Merge, sort, hydrate

1. Concatenate finding lists; drop entries whose `severity` isn't `blocker`, `major`, or `nit`.
2. Sort by severity (blocker → major → nit), then `file`, then `lines.start`.
3. Number `1..N`.
4. For each finding with an empty/whitespace `code_snippet`: parse `lines` as `<start>-<end>`, Read `file` with `offset=<start>`, `limit=min(<end>-<start>+1, 40)`; set `code_snippet` to that content, appending `… (truncated, <N> more lines)` if the range exceeded 40. On a Read error, set it to `(snippet unavailable: <reason>)`.

**Completion:** every finding in the merged list has a non-empty `code_snippet` (real or a sentinel).

## Step 4 — Overview

Print:

```
mentor-review — <N> findings on diff vs main

#  sev      file:line              title                            principle
1  blocker  src/foo.tsx:42         target="_blank" without rel       a11y-external-rel
…

Counts: blocker <Nb>, major <Nm>, nit <Nn>
Recurring principles: <slug> ×<count>, …   (only slugs with count ≥ 2)
```

Then branch:

- **Informative** (no `--fix`): render every finding as a teaching card per [TEMPLATES.md](TEMPLATES.md#teaching-card), in order, then print `Done. <N> findings shown. Re-run with --fix to walk through them interactively.` Stop.
- **Fix** (`--fix`): walk findings interactively per [TEMPLATES.md](TEMPLATES.md#fix-walk).

## Constraints

- No persistence — findings live only in this session; nothing is written to disk.
- Self-contained — don't reference general workflow scripts or `~/.claude/scripts/*`.
- Both reviewer agents stay read-only; only the fix sub-agent (fix mode only) edits files.
- Fixes apply one at a time, foreground, so the user sees each diff before the next.
