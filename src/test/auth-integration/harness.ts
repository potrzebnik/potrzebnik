import * as schema from '../../db/schema';
import { createAuth } from '../../lib/auth-config';
import type { AuthDatabase } from '../../lib/auth-config';
import { createPostgresIntegrationHarness } from '../postgres-integration-harness';

import {
  AUTH_MANAGED_ENV_KEYS,
  AUTH_TEST_ENV,
  createIntegrationEnv,
} from './env';
import { createGoogleOverrides } from './google';

const AUTH_TABLES = ['account', 'session', 'user', 'verification'] as const;

const AUTH_TABLE_SQL = {
  account: 'account',
  session: '"session"',
  user: '"user"',
  verification: 'verification',
} as const;

type AuthTable = (typeof AUTH_TABLES)[number];
type AuthTableCounts = Record<AuthTable, number>;

const AUTH_TABLE_SQL_LIST = AUTH_TABLES.map((table) => AUTH_TABLE_SQL[table]);

async function countAuthTableRows(
  countRows: (table: AuthTable) => Promise<number>,
): Promise<AuthTableCounts> {
  const counts = await Promise.all(
    AUTH_TABLES.map(async (table) => [table, await countRows(table)] as const),
  );

  return Object.fromEntries(counts) as AuthTableCounts;
}

export async function createAuthIntegrationHarness() {
  const harness = await createPostgresIntegrationHarness({
    schema,
    managedEnvKeys: AUTH_MANAGED_ENV_KEYS,
    envOverrides: AUTH_TEST_ENV,
  });
  const authDb = harness.db as AuthDatabase;

  const countAuthRows = (table: AuthTable) =>
    harness.countRows(AUTH_TABLE_SQL[table]);
  const createTestAuth = () =>
    createAuth({
      database: authDb,
      env: createIntegrationEnv(harness.databaseUrl),
      googleOverrides: createGoogleOverrides(),
    });
  const getAuthCounts = () => countAuthTableRows(countAuthRows);
  const listExistingAuthTables = () => harness.listExistingTables(AUTH_TABLES);
  const resetAuthTables = () => harness.truncateTables(AUTH_TABLE_SQL_LIST);

  return {
    ...harness,
    db: authDb,
    createTestAuth,
    countRows: countAuthRows,
    getAuthCounts,
    listExistingAuthTables,
    resetAuthTables,
  };
}
