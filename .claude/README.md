# `.claude/` — Project Agents & Skills

Custom Claude Code agents and skills scoped to this repository. Loaded automatically when Claude Code runs from the project root.

## Agents

### `code-reviewer`

General-purpose code reviewer. Focuses on correctness, security, maintainability, and performance. Language-agnostic. Emits structured YAML findings consumed by the `mentor-review` skill.

### `frontend-reviewer`

Repo-aware reviewer for the Next.js 16 / React 19 / Tailwind v4 / shadcn-ui / Storybook stack. Enforces conventions distilled from past PR review history (a11y, React patterns, Tailwind/CSS hygiene, asset checks). Emits structured YAML findings consumed by the `mentor-review` skill.

## Usage

Agents are invoked through Claude Code's `Task` tool. Trigger by mentioning the agent name or describing the task — Claude picks the matching agent based on its `description` frontmatter.

### Examples

**Review a pull request**

```
> Review PR #50 with the frontend-reviewer
> Use code-reviewer to look at the auth changes on this branch
```

**Review staged changes**

```
> Run frontend-reviewer on my staged changes
> code-reviewer: review the diff against main
```

**Review specific files**

```
> Have frontend-reviewer check src/components/features/public-header.tsx
> code-reviewer: review src/db/schema/needs.ts
```

**Combined pass**

```
> Review the current branch — code-reviewer for backend files, frontend-reviewer for src/app and src/components
```

### Direct invocation

In Claude Code you can force a specific agent via the `Agent` tool (renamed from `Task` in v2.1.63; `Task(...)` still works as an alias):

```
Agent(subagent_type="frontend-reviewer", prompt="Review the diff in PR #48")
Agent(subagent_type="code-reviewer",     prompt="Review src/db/schema/")
```

## Output

Both agents emit a structured YAML document (`findings:` list) with severity (`blocker` / `major` / `nit`), file, lines, title, `principle` slug, rationale, impact, code snippet, and fix proposal. Neither agent edits code — they're read-only. Run them directly for raw YAML, or via the `mentor-review` skill below for a guided teaching experience.

## Skills

### `mentor-review`

Pre-PR review designed for junior devs. Orchestrates `code-reviewer` + `frontend-reviewer` in parallel against `git diff main...HEAD` (plus uncommitted), then presents findings as teaching cards: **Concept · Why · Impact · Code · Fix · References**.

**Modes**

- `/mentor-review` — informative. Prints all findings as teaching cards. No interaction, no edits.
- `/mentor-review --fix` — interactive. Shows an overview, then walks findings one-by-one. **Accept** spawns a Sonnet sub-agent that applies the fix and prints the resulting `git diff` inline; **Reject** silently skips.

**Trigger phrases**

```
> mentor review
> review my changes with teaching
> /mentor-review
> /mentor-review --fix
```

**Example flow**

```
mentor-review — 4 findings on diff vs main

#  sev      file:line                          title                          principle
1  blocker  src/components/header.tsx:27       target="_blank" without rel    a11y-external-rel
2  major    src/components/list.tsx:14         using array index as key       react-no-index-key
…

Counts: blocker 1, major 2, nit 1
```

In `--fix` mode the user is prompted Accept/Reject for each finding; accepted fixes are applied and shown as a diff before moving on. No reports are persisted — the flow is session-scoped.

## Adding a new agent

1. Create `.claude/agents/<name>.md` with frontmatter:
   ```yaml
   ---
   name: my-agent
   description: When this agent should run.
   tools: Read, Grep, Glob, Bash
   ---
   ```
2. Body = system prompt for that agent.
3. Commit. Available immediately on next Claude Code session.
