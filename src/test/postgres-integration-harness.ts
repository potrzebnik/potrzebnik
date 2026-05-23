import path from 'node:path';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const DEFAULT_MANAGED_ENV_KEYS = [
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
] as const;
const DEFAULT_MIGRATIONS_FOLDER = path.resolve(process.cwd(), 'drizzle');
const DEFAULT_CONTAINER_IMAGE = 'postgres:18.3';
const DEFAULT_DATABASE_NAME = 'potrzebnik_test';
const DEFAULT_USERNAME = 'postgres';
const DEFAULT_PASSWORD = 'postgres';

type ClosablePool = {
  end: () => Promise<void>;
};

type ManagedEnvSnapshot = Record<string, string | undefined>;

type SchemaDefinition = Record<string, unknown>;
type StartedPostgresContainer = Awaited<
  ReturnType<PostgreSqlContainer['start']>
>;

export type CreatePostgresIntegrationHarnessOptions<
  TSchema extends SchemaDefinition,
> = {
  schema: TSchema;
  envOverrides?: Record<string, string>;
  managedEnvKeys?: readonly string[];
};

function snapshotManagedEnv(
  keys: readonly string[],
  env: NodeJS.ProcessEnv,
): ManagedEnvSnapshot {
  return Object.fromEntries(keys.map((key) => [key, env[key]]));
}

function restoreManagedEnv(
  snapshot: ManagedEnvSnapshot,
  env: NodeJS.ProcessEnv,
) {
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete env[key];
      continue;
    }

    env[key] = value;
  }
}

function applyEnvOverrides(
  overrides: Record<string, string>,
  env: NodeJS.ProcessEnv,
) {
  Object.assign(env, overrides);
}

function resolveManagedEnvKeys(
  managedEnvKeys: readonly string[],
  envOverrides: Record<string, string>,
) {
  return Array.from(
    new Set([
      ...DEFAULT_MANAGED_ENV_KEYS,
      ...managedEnvKeys,
      ...Object.keys(envOverrides),
    ]),
  );
}

function createPostgresEnv(container: StartedPostgresContainer) {
  return {
    POSTGRES_USER: container.getUsername(),
    POSTGRES_PASSWORD: container.getPassword(),
    POSTGRES_DB: container.getDatabase(),
    POSTGRES_HOST: container.getHost(),
    POSTGRES_PORT: container.getPort().toString(),
  };
}

function createResourceLifecycle({
  env,
  previousEnv,
}: {
  env: NodeJS.ProcessEnv;
  previousEnv: ManagedEnvSnapshot;
}) {
  const trackedPools = new Set<ClosablePool>();
  let container: StartedPostgresContainer | undefined;
  let disposed = false;

  function trackPool<T extends ClosablePool>(pool: T): T {
    trackedPools.add(pool);

    return pool;
  }

  function setContainer(nextContainer: StartedPostgresContainer) {
    container = nextContainer;
  }

  async function dispose() {
    if (disposed) {
      return;
    }

    disposed = true;
    const errors: unknown[] = [];
    const poolsToClose = Array.from(trackedPools);
    trackedPools.clear();

    for (const pool of poolsToClose) {
      try {
        await pool.end();
      } catch (error) {
        errors.push(error);
      }
    }

    if (container) {
      try {
        await container.stop();
      } catch (error) {
        errors.push(error);
      }
    }

    restoreManagedEnv(previousEnv, env);

    if (errors.length === 1) {
      throw errors[0];
    }

    if (errors.length > 1) {
      throw new AggregateError(
        errors,
        'Failed to dispose postgres integration harness.',
      );
    }
  }

  return {
    trackPool,
    setContainer,
    dispose,
  };
}

async function startContainer() {
  return new PostgreSqlContainer(DEFAULT_CONTAINER_IMAGE)
    .withDatabase(DEFAULT_DATABASE_NAME)
    .withUsername(DEFAULT_USERNAME)
    .withPassword(DEFAULT_PASSWORD)
    .start();
}

function createTableHelpers(pool: Pool) {
  async function countRows(tableSql: string) {
    const result = await pool.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM ${tableSql}`,
    );

    return result.rows[0]?.count ?? 0;
  }

  async function listExistingTables(tableNames: readonly string[]) {
    const result = await pool.query<{ table_name: string }>(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ANY($1::text[])
        ORDER BY table_name
      `,
      [tableNames],
    );

    return result.rows.map((row) => row.table_name);
  }

  async function truncateTables(tablesSql: readonly string[]) {
    if (tablesSql.length === 0) {
      return;
    }

    await pool.query(`TRUNCATE TABLE ${tablesSql.join(', ')} CASCADE`);
  }

  return {
    countRows,
    listExistingTables,
    truncateTables,
  };
}

/**
 * Creates a disposable Postgres integration test harness.
 *
 * Usage pattern:
 * - Call once in `beforeAll`.
 * - Clean test data in `afterEach` with `truncateTables(...)`.
 * - Call `dispose()` in `afterAll` to close pools, stop the container, and
 *   restore managed env variables.
 *
 * `countRows` and `truncateTables` accept SQL table identifiers, so pass only
 * trusted static values (for example `"user"` for reserved names).
 */
export async function createPostgresIntegrationHarness<
  TSchema extends SchemaDefinition,
>({
  schema,
  envOverrides = {},
  managedEnvKeys = [],
}: CreatePostgresIntegrationHarnessOptions<TSchema>) {
  const env = process.env;
  const allManagedEnvKeys = resolveManagedEnvKeys(managedEnvKeys, envOverrides);
  // Tests share one process, so process.env is global mutable state.
  // Snapshot managed keys now and restore them on dispose to prevent env leaks.
  const previousEnv = snapshotManagedEnv(allManagedEnvKeys, env);
  const resources = createResourceLifecycle({ env, previousEnv });

  try {
    const container = await startContainer();
    resources.setContainer(container);

    const databaseUrl = container.getConnectionUri();
    const postgresEnv = createPostgresEnv(container);

    applyEnvOverrides(
      {
        ...envOverrides,
        ...postgresEnv,
      },
      env,
    );

    const pool = resources.trackPool(
      new Pool({
        connectionString: databaseUrl,
      }),
    );
    const db = drizzle(pool, { schema });

    await migrate(db, { migrationsFolder: DEFAULT_MIGRATIONS_FOLDER });
    const tableHelpers = createTableHelpers(pool);

    return {
      container,
      databaseUrl,
      db,
      pool,
      trackPool: resources.trackPool,
      ...tableHelpers,
      dispose: resources.dispose,
    };
  } catch (error) {
    try {
      await resources.dispose();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        'Failed to initialize postgres integration harness.',
      );
    }

    throw error;
  }
}
