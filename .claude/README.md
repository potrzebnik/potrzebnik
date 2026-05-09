# `.claude/` — Project Agents

Custom Claude Code agents scoped to this repository. Loaded automatically when Claude Code runs from the project root.

## Agents

### `code-reviewer`

General-purpose code reviewer. Focuses on correctness, security, maintainability, and performance. Language-agnostic.

### `frontend-reviewer`

Repo-aware reviewer for the Next.js 16 / React 19 / Tailwind v4 / shadcn-ui / Storybook stack. Enforces conventions distilled from past PR review history (a11y, React patterns, Tailwind/CSS hygiene, asset checks).

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

In Claude Code you can force a specific agent via the `Task` tool:

```
Task(subagent_type="frontend-reviewer", prompt="Review the diff in PR #48")
Task(subagent_type="code-reviewer",    prompt="Review src/db/schema/")
```

## Output

Both agents produce read-only feedback grouped by file with severity tags:

- `code-reviewer` — 🔴 blocker / 🟡 suggestion / 💭 nit
- `frontend-reviewer` — `[blocker]` / `[major]` / `[nit]` plus a rule id (`a11y-external-rel`, `react-no-index-key`, …)

Neither agent edits code. Apply fixes manually or ask Claude to follow up.

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
