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

Then start local database + migrations + development server:

```bash
bash startup_dev.sh
```

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

**Questions?** Contact the project coordinator or open a discussion.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
