---
name: open-pr
description: Open a draft pull request for the current branch, filling the PR template from its commits.
disable-model-invocation: true
---

# Open a draft PR from the current branch

The template is the contract with the reviewer; the branch is the evidence. This skill reads the
evidence and writes the contract. The body is the reviewer's **briefing** before they open the
diff — what changed and what to watch for — never an inventory of it: the diff lists files better
than prose can. Two markers keep the body honest: `TODO:` where the evidence is
silent, and `(inferred)` where the body guesses from the diff. The PR is created as a **draft**; the
user promotes it to ready after resolving both.

## Process

### 1. Establish the branch

- `gh repo view --json defaultBranchRef -q .defaultBranchRef.name` is the base for every command
  below; `$BASE` stands for it.
- `git branch --show-current`. On `$BASE`, stop: there is nothing to open a PR from.
- `git status --porcelain`. Uncommitted changes stay uncommitted: list them and ask, with
  `AskUserQuestion`, which belong in this PR before going on.
- `git fetch origin $BASE` then `git log --oneline origin/$BASE..HEAD`. Zero commits: stop and say so.
- `gh pr view --json url,isDraft 2>/dev/null`. A PR already exists: report its URL and stop; editing
  an existing body is the user's call.

### 2. Build the evidence table

The commit list is a table of contents, not the story. Read `git show --stat` for each commit, the
diff where a subject is vague, and `git diff origin/$BASE...HEAD --stat` for the whole picture. Fill
every row:

| Row        | Source                                                               | Lands in           |
| ---------- | -------------------------------------------------------------------- | ------------------ |
| ticket     | commit subject `(#N)`, `Closes #N` trailer, branch name `type/#N-…`  | Top of body, title |
| migration  | anything under the repo's migrations directory                       | What               |
| env        | any change to an example environment file                            | What               |
| dependency | any manifest or lockfile dependency change                           | What               |
| docs       | whether the documentation directory moved with the behaviour         | What, if missing   |
| coverage   | test and story files added or changed                                | Testing            |
| why        | commit bodies that state a constraint, trade-off, or rejected option | Design             |

Ticket sources that disagree: ask which one the PR closes. Behaviour, setup, or a dependency changed
with no docs row: the docs row becomes `TODO: docs`.

### 3. Write the contract

[`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md) beside this skill is the contract, read
fresh each run — a repo ships no template of its own. Each HTML comment becomes an answer to it;
the comment is dropped. Every evidence row lands where its **Lands in** column names, so the reviewer meets a migration or
dependency before the diff.

`Closes #N` is the body's first line, above every heading and with no heading of its own, when the
ticket row is filled. Nothing else precedes it.

Section content is **bullets** — one point per bullet. A paragraph appears only where a single
point genuinely needs the connective tissue; a section that reads as one long paragraph is
rewritten as a list.

A bullet is one **change**, not one file. Several files serving one change are one bullet, written
as the behaviour that changed. What holds about five bullets; past that, group harder.

**Name a thing, don't locate it.** The reviewer opens the diff a minute later; it gives locations
better than prose can, so a bullet spends its words on behaviour instead. A new skill is
`open-pr`, not the directory holding it. A settings change is the option it adds, not the file and
line it lands on. A docs change is its subject. A path earns its place only where the path itself
is the point — a migration, a dependency manifest, a file the reviewer would not think to open —
and a bullet whose only content is a filename is cut. `docs`, `env` and `dependency` rows earn a
bullet when they are present; their absence is silence, not a bullet claiming nothing changed.

Testing carries only what CI cannot prove: coverage the change added, and hand-checks the user
reports. A gate the repo's CI workflow already runs is reported by the checks list, so its bullet is
the `TODO:` that asks the user what they verified by hand instead.

A bullet the evidence supports is plain. A bullet guessed from the diff carries `(inferred)`.
A fact outside the evidence, such as commands run or hand-checks, is `TODO:`. A section whose
comment allows deletion, and whose rows are empty, is deleted.

Title: match the format the repo's own history uses — read `git log --oneline origin/$BASE -20` and
any contributing guide. Absent a convention, `type: description (#N)`. `type` comes from the commit
that carries the ticket; on a mixed branch with no ticket, ask.

### 4. Confirm, then create

Write the body to a file in the scratchpad. It ends on its last section: no `🤖 Generated with …`
footer and no session URL (`claude.ai/code/session_…`) — the PR author records who opened it.

Print the title and body, then gate on `AskUserQuestion`: confirm or edit. Only after confirmation:

```sh
git push -u origin "$(git branch --show-current)"
gh pr create --draft --base "$BASE" --title "<title>" --body-file <body>
```

Report the PR URL, every `TODO:`, and every `(inferred)` left in the body.

## Completion criterion

A draft PR exists. Its body opens with a bare `Closes #N` line when a ticket exists, has no HTML
comment, carries every filled evidence row in its named section, states each point as its own
bullet with What holding about five change-shaped bullets that name what changed rather than
where it lives, a Testing
section free of CI-run gates, and no attribution footer or session URL. The report lists the URL,
every `TODO:`, and every `(inferred)`. The user confirmed the body before `gh pr create` ran.
