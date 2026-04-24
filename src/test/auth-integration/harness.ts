import * as schema from '../../db/schema';
import type { AuthDatabase } from '../../lib/auth-config';
import { createPostgresIntegrationHarness as createBasePostgresIntegrationHarness } from '../postgres-integration-harness';

import { AUTH_MANAGED_ENV_KEYS, AUTH_TEST_ENV } from './env';

const AUTH_TABLES = ['account', 'session', 'user', 'verification'] as const;

const AUTH_TABLE_SQL = {
  account: 'account',
  session: '"session"',
  user: '"user"',
  verification: 'verification',
} as const;

type AuthTable = (typeof AUTH_TABLES)[number];

export async function createAuthIntegrationHarness() {
  const harness = await createBasePostgresIntegrationHarness({
    schema,
    managedEnvKeys: AUTH_MANAGED_ENV_KEYS,
    envOverrides: AUTH_TEST_ENV,
  });

  const countAuthRows = (table: AuthTable) =>
    harness.countRows(AUTH_TABLE_SQL[table]);

  return {
    ...harness,
    db: harness.db as AuthDatabase,
    loadProductionSingletons: async () => {
      const dbModule = await import('../../db');
      const authModule = await import('../../lib/auth');

      harness.trackPool(dbModule.db.$client);

      return { dbModule, authModule };
    },
    countRows: countAuthRows,
    getAuthCounts: async () => {
      const [account, session, user, verification] = await Promise.all(
        AUTH_TABLES.map(
          async (table) => [table, await countAuthRows(table)] as const,
        ),
      );

      return {
        account: account[1],
        session: session[1],
        user: user[1],
        verification: verification[1],
      };
    },
    listExistingAuthTables: async () => harness.listExistingTables(AUTH_TABLES),
    resetAuthTables: async () =>
      harness.truncateTables(AUTH_TABLES.map((table) => AUTH_TABLE_SQL[table])),
  };
}
