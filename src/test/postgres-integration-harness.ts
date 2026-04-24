import path from 'node:path';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const DEFAULT_MANAGED_ENV_KEYS = ['DATABASE_URL'] as const;

type ClosablePool = {
  end: () => Promise<void>;
};

type ManagedEnvSnapshot = Record<string, string | undefined>;

type SchemaDefinition = Record<string, unknown>;

export type CreatePostgresIntegrationHarnessOptions<
  TSchema extends SchemaDefinition,
> = {
  schema: TSchema;
  env?: NodeJS.ProcessEnv;
  envOverrides?: Record<string, string>;
  managedEnvKeys?: readonly string[];
  migrationsFolder?: string;
  containerImage?: string;
  databaseName?: string;
  username?: string;
  password?: string;
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

export async function createPostgresIntegrationHarness<
  TSchema extends SchemaDefinition,
>({
  schema,
  env = process.env,
  envOverrides = {},
  managedEnvKeys = [],
  migrationsFolder = path.resolve(process.cwd(), 'drizzle'),
  containerImage = 'postgres:18.3',
  databaseName = 'potrzebnik_test',
  username = 'postgres',
  password = 'postgres',
}: CreatePostgresIntegrationHarnessOptions<TSchema>) {
  const allManagedEnvKeys = Array.from(
    new Set([
      ...DEFAULT_MANAGED_ENV_KEYS,
      ...managedEnvKeys,
      ...Object.keys(envOverrides),
    ]),
  );
  const previousEnv = snapshotManagedEnv(allManagedEnvKeys, env);
  const trackedPools = new Set<ClosablePool>();
  let container: Awaited<ReturnType<PostgreSqlContainer['start']>> | undefined;
  let disposed = false;

  function trackPool<T extends ClosablePool>(pool: T): T {
    trackedPools.add(pool);

    return pool;
  }

  async function dispose() {
    if (disposed) {
      return;
    }

    disposed = true;
    const errors: unknown[] = [];

    for (const trackedPool of trackedPools) {
      trackedPools.delete(trackedPool);

      try {
        await trackedPool.end();
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

  try {
    container = await new PostgreSqlContainer(containerImage)
      .withDatabase(databaseName)
      .withUsername(username)
      .withPassword(password)
      .start();
    const databaseUrl = container.getConnectionUri();

    applyEnvOverrides(
      {
        ...envOverrides,
        DATABASE_URL: databaseUrl,
      },
      env,
    );

    const pool = trackPool(
      new Pool({
        connectionString: databaseUrl,
      }),
    );
    const db = drizzle(pool, { schema });

    await migrate(db, { migrationsFolder });

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
      container,
      databaseUrl,
      db,
      pool,
      trackPool,
      countRows,
      listExistingTables,
      truncateTables,
      dispose,
    };
  } catch (error) {
    try {
      await dispose();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        'Failed to initialize postgres integration harness.',
      );
    }

    throw error;
  }
}
