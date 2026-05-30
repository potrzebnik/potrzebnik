# Integration Test Harness

This directory contains reusable harnesses for integration tests.

## Available Harnesses

- `createPostgresIntegrationHarness` in `src/test/postgres-integration-harness.ts`
  creates a fresh Postgres Testcontainers instance, runs Drizzle migrations, and
  returns helpers for table cleanup and assertions.
- `createAuthIntegrationHarness` in `src/test/auth-integration/harness.ts` wraps
  the base harness with auth-specific helpers (`createTestAuth`, `resetAuthTables`,
  `getAuthCounts`, `listExistingAuthTables`).

## Typical Lifecycle

Use the harness with the test lifecycle:

1. Create once in `beforeAll`.
2. Reset/truncate relevant tables in `afterEach`.
3. Dispose once in `afterAll`.

```ts
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';

import { createAuthIntegrationHarness } from '../test/auth-integration/harness';

describe('example integration suite', () => {
  let harness: Awaited<ReturnType<typeof createAuthIntegrationHarness>>;

  beforeAll(async () => {
    harness = await createAuthIntegrationHarness();
  });

  afterEach(async () => {
    await harness.resetAuthTables();
  });

  afterAll(async () => {
    await harness.dispose();
  });

  it('uses migrated db', async () => {
    const counts = await harness.getAuthCounts();
    // assertions...
  });
});
```

## `createPostgresIntegrationHarness` API

```ts
const harness = await createPostgresIntegrationHarness({
  schema,
  envOverrides,
  managedEnvKeys,
});
```

### Input Options

- `schema`: Drizzle schema object used by `drizzle(pool, { schema })`.
- `envOverrides` (optional): values assigned to `process.env` before tests run.
  Postgres environment variables are always set from the container.
- `managedEnvKeys` (optional): extra env keys that should be restored on
  `dispose()`.

### Returned Values

- `container`: started Testcontainers Postgres container.
- `databaseUrl`: connection string for the container database.
- `db`: Drizzle database client.
- `pool`: `pg` pool connected to the container.
- `trackPool(poolLike)`: registers additional pools so `dispose()` also closes
  them.
- `countRows(tableSql)`: row count helper (pass trusted static table SQL, for
  example `"user"`).
- `listExistingTables(tableNames)`: lists tables that currently exist in
  `public`.
- `truncateTables(tablesSql)`: truncates given tables with `CASCADE`.
- `dispose()`: closes tracked pools, stops container, and restores managed env.

## Environment Setup

Integration tests in this repo run with Vitest `integration` project, which
loads `src/test/setup-integration.ts` and applies base auth test env settings.
