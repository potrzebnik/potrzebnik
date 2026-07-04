import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createAuthIntegrationHarness } from '../test/auth-integration/harness';

const DOMAIN_TABLES = [
  'address',
  'donation',
  'donor',
  'donor_favourite_need',
  'need',
  'need_status_history',
  'organization',
  'organization_shipping_address',
] as const;

describe('database integration', () => {
  let harness: Awaited<ReturnType<typeof createAuthIntegrationHarness>>;

  beforeAll(async () => {
    harness = await createAuthIntegrationHarness();
  });

  afterEach(async () => {
    if (harness) {
      await harness.resetAuthTables();
    }
  });

  afterAll(async () => {
    if (harness) {
      await harness.dispose();
    }
  });

  it('migrates the container database and creates the auth tables', async () => {
    await expect(harness.listExistingAuthTables()).resolves.toEqual([
      'account',
      'session',
      'user',
      'verification',
    ]);
  });

  it('migrates the container database and creates the domain tables', async () => {
    await expect(harness.listExistingTables(DOMAIN_TABLES)).resolves.toEqual(
      DOMAIN_TABLES,
    );
  });

  it('imports the production db and auth singletons after test env setup', async () => {
    vi.resetModules();

    const dbModule = await import('./index');
    const authModule = await import('../lib/auth');

    harness.trackPool(dbModule.db.$client);

    const databaseResult = await dbModule.db.$client.query<{ value: number }>(
      'SELECT 1 AS value',
    );
    const okResponse = await authModule.auth.handler(
      new Request('http://127.0.0.1:3000/api/auth/ok'),
    );

    expect(databaseResult.rows[0]?.value).toBe(1);
    await expect(okResponse.json()).resolves.toEqual({ ok: true });
  });
});
