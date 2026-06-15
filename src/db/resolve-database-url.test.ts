import { describe, expect, it } from 'vitest';

import { resolveDatabaseUrl } from './resolve-database-url';

const POSTGRES_ENV = {
  POSTGRES_USER: 'app',
  POSTGRES_PASSWORD: 'secret',
  POSTGRES_DB: 'potrzebnik',
  POSTGRES_HOST: 'db.example.com',
  POSTGRES_PORT: '6543',
};

function createEnv(
  overrides: Partial<NodeJS.ProcessEnv> = {},
): NodeJS.ProcessEnv {
  const { NODE_ENV = 'test', ...env } = overrides;

  return {
    ...env,
    NODE_ENV,
  };
}

describe('resolveDatabaseUrl', () => {
  it('builds a connection URL from Postgres environment variables', () => {
    expect(
      resolveDatabaseUrl(
        createEnv({
          ...POSTGRES_ENV,
        }),
      ),
    ).toBe('postgres://app:secret@db.example.com:6543/potrzebnik');
  });

  it('defaults the Postgres host to localhost for backward compatibility', () => {
    const env = createEnv({
      ...POSTGRES_ENV,
    });
    delete env.POSTGRES_HOST;

    expect(resolveDatabaseUrl(env)).toBe(
      'postgres://app:secret@localhost:6543/potrzebnik',
    );
  });

  it.each([
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'POSTGRES_PORT',
  ] as const)('throws when %s is missing', (key) => {
    const env = createEnv({
      ...POSTGRES_ENV,
    });

    delete env[key];

    expect(() => resolveDatabaseUrl(env)).toThrow(
      `Missing required database environment variable(s): ${key}. Set POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB and POSTGRES_PORT.`,
    );
  });
});
