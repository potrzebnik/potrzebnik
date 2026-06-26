# Potrzebnik

## Prerequisites

Before running the project locally, make sure you have:

- Node.js and npm: [install instructions](https://nodejs.org/en/download)
- pnpm: [install instructions](https://pnpm.io/installation)
- Docker with Docker Compose: [install instructions](https://docs.docker.com/get-docker/)

## Getting Started

Set up environment variables first:

```bash
cp .env.example .env
```

Local development startup works without Google OAuth keys when
`GOOGLE_AUTH_ENABLED=false`.

To enable Google sign-in locally for testing, set `GOOGLE_AUTH_ENABLED=true`,
`GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` in `.env`, then register this
redirect URI in Google Cloud:

```text
http://localhost:3000/api/auth/callback/google
```

Then start local database and development server:

```bash
bash startup_dev.sh
```

## Database Migrations

Apply all pending migrations:

```bash
pnpm run db:migrate
```

Generate a new migration after schema changes:

```bash
pnpm run db:generate
```

Open Drizzle Studio:

```bash
pnpm run db:studio
```

## Integration Tests

Run integration tests:

```bash
pnpm test:integration
```

The Postgres test harness documentation (API and examples) is in
`src/test/README.md`.

## Contributing

We welcome contributions! Please follow these guidelines to ensure smooth collaboration.

### Getting Assigned

- **Tickets are assigned** by maintainers - if you're interested in contributing, comment on an existing ticket on the [project board](https://github.com/orgs/potrzebnik/projects/1/views/1) or contact the project coordinator
- **Do not start work** on a ticket unless you are the assigned contributor

### Branch Naming

Create branches using the pattern: `type/#ticket_number-short-description`

- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Example: `feat/#12-tailwind-setup`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and include the ticket number in **at least one commit** on your branch:

```
feat: add organizations API endpoint (#18)
```

**Why?** Mentioning the ticket number links your work to the ticket and Pull Request. Since we squash-merge PRs, only one commit needs the ticket number - it will be preserved in the final squashed commit.

### Pull Requests

- **Required**: All changes must go through PR - no direct pushes to `main`
- **Title format**: `type: description (#ticket)` (e.g., `feat: add orgs API (#18)`)
- **Scope**: Keep PRs small and focused on a single logical change
- **Checks**: Ensure all checks pass before requesting review:
  ```bash
  pnpm run check
  pnpm run lint:fix
  pnpm run format
  ```
- **Merge**:
  - You are **NOT ALLOWED** to merge to main without at least **one** approval
  - Squash merge unless there's a strong reason not to

### Code Quality

- Follow existing code style (Prettier + ESLint)
- Add/update tests for behavior changes
- Update documentation (README, comments)

### Git Hooks

[Husky](https://typicode.github.io/husky/) hooks run automatically — no manual
setup beyond `pnpm install` (wired via the `prepare` script):

- **pre-commit**: `lint-staged` (ESLint + Prettier on staged files)
- **commit-msg**: `commitlint` (Conventional Commits)
- **pre-push**: `pnpm type-check && pnpm lint && pnpm test` — blocks the push if
  types, lint, or unit tests fail. Integration tests and `build` run in CI, not
  here, to keep pushes fast.

Bypass in an emergency (use sparingly):

```bash
git push --no-verify
```

### Continuous Integration

GitHub Actions runs the **full** verification suite on every PR and push to
`main`:

- **`quality`** job: `type-check`, `lint`, `format:check`, `build`, unit tests
- **`integration`** job: integration tests (testcontainers spins up Postgres —
  no secrets needed)

This is a superset of the pre-push hook: `build`, `format:check`, and the
integration tests run here rather than locally to keep pushes fast. `main` is
protected — PRs **cannot merge** until both checks pass (and you have at least
one approval). The hook is a fast local pre-filter; CI is the authoritative,
unbypassable gate.

**Questions?** Contact the project coordinator or open a discussion.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
