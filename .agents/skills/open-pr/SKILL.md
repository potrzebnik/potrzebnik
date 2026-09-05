---
name: open-pr
description: Open a draft pull request for the current branch, filling the PR template from its commits.
disable-model-invocation: true
---

# Open a draft PR from the current branch

The template is the contract with the reviewer; the branch is the evidence. This skill reads the
evidence and writes the contract. Two markers keep the body honest: `TODO:` where the evidence is
silent, and `(inferred)` where the body guesses from the diff. The PR is created as a **draft**; the
user promotes it to ready after resolving both.

## Process

### 1. Establish the branch

- `git branch --show-current`. On `main`, stop: there is nothing to open a PR from.
- `git status --porcelain`. Uncommitted changes stay uncommitted: list them and ask, with
  `AskUserQuestion`, which belong in this PR before going on.
- `git fetch origin main` then `git log --oneline origin/main..HEAD`. Zero commits: stop and say so.
- `gh pr view --json url,isDraft 2>/dev/null`. A PR already exists: report its URL and stop; editing
  an existing body is the user's call.

### 2. Build the evidence table

The commit list is a table of contents, not the story. Read `git show --stat` for each commit, the
diff where a subject is vague, and `git diff origin/main...HEAD --stat` for the whole picture. Fill
every row:

| Row        | Source                                                               | Lands in           |
| ---------- | -------------------------------------------------------------------- | ------------------ |
| ticket     | commit subject `(#N)`, `Closes #N` trailer, branch name `type/#N-…`  | Top of body, title |
| migration  | anything under `drizzle/`                                            | What               |
| env        | any change to `.env.example`                                         | What               |
| dependency | any `package.json` dependency change                                 | What               |
| docs       | files under `docs/site/src/content/docs/` changed                    | What               |
| coverage   | `*.stories.tsx` and `*.test.ts*` added or changed                    | Testing            |
| why        | commit bodies that state a constraint, trade-off, or rejected option | Design             |

Ticket sources that disagree: ask which one the PR closes. Behaviour, setup, or a dependency changed
with no docs row: the docs row becomes `TODO: docs`.

### 3. Write the contract

Read `.github/pull_request_template.md` fresh each run. Each HTML comment becomes an answer to it;
the comment is dropped. Every evidence row lands where its **Lands in** column names, so the
reviewer meets a migration or dependency before the diff.

`Closes #N` is the body's first line, above every heading and with no heading of its own, when the
ticket row is filled. Nothing else precedes it.

Section content is **bullets** — one point per bullet, one row per bullet. A paragraph appears only
where a single point genuinely needs the connective tissue; a section that reads as one long
paragraph is rewritten as a list.

Testing carries only what CI cannot prove: coverage the change added, and hand-checks the user
reports. A gate the CI workflow already runs is reported by the checks list, so its bullet is the
`TODO:` that asks the user what they verified by hand instead.

A bullet the evidence supports is plain. A bullet guessed from the diff carries `(inferred)`.
A fact outside the evidence, such as commands run or hand-checks, is `TODO:`. A section whose
comment allows deletion, and whose rows are empty, is deleted.

Title: `type: description (#N)`, the format `contributing.mdx` requires. `type` comes from the
commit that carries the ticket; on a mixed branch with no ticket, ask.

### 4. Confirm, then create

Write the body to a file in the scratchpad. Its last line is exactly, and only:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

The body stays free of session URLs (`claude.ai/code/session_…`): a session link is private to the
machine that ran it and useless to a reviewer. Attribution belongs in the commit trailers.

Print the title and body, then gate on `AskUserQuestion`: confirm or edit. Only after confirmation:

```sh
git push -u origin "$(git branch --show-current)"
gh pr create --draft --base main --title "<title>" --body-file <body>
```

Report the PR URL, every `TODO:`, and every `(inferred)` left in the body.

## Completion criterion

A draft PR exists. Its body opens with a bare `Closes #N` line when a ticket exists, has no HTML
comment, carries every filled evidence row in its named section, and states each point as its own
bullet, with a Testing section free of CI-run gates. Its last line is the bare `🤖 Generated with …` line. The report lists the URL, every
`TODO:`, and every `(inferred)`. The user confirmed the body before `gh pr create` ran.
