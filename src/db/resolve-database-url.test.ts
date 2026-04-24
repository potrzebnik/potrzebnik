import { describe, expect, it } from 'vitest';

import { resolveDatabaseUrl } from './resolve-database-url';

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
  it('returns an explicit DATABASE_URL value', () => {
    expect(
      resolveDatabaseUrl(
        createEnv({
          DATABASE_URL: 'postgres://app:secret@db.example.com:5432/potrzebnik',
        }),
      ),
    ).toBe('postgres://app:secret@db.example.com:5432/potrzebnik');
  });

  it('expands environment references in DATABASE_URL', () => {
    expect(
      resolveDatabaseUrl(
        createEnv({
          DATABASE_URL:
            'postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}',
          POSTGRES_USER: 'app',
          POSTGRES_PASSWORD: 'secret',
          POSTGRES_HOST: 'db.example.com',
          POSTGRES_PORT: '6543',
          POSTGRES_DB: 'potrzebnik',
        }),
      ),
    ).toBe('postgres://app:secret@db.example.com:6543/potrzebnik');
  });

  it('falls back to POSTGRES_* variables when DATABASE_URL is absent', () => {
    expect(
      resolveDatabaseUrl(
        createEnv({
          POSTGRES_USER: 'app',
          POSTGRES_PASSWORD: 'secret',
          POSTGRES_DB: 'potrzebnik',
        }),
      ),
    ).toBe('postgres://app:secret@localhost:5432/potrzebnik');
  });

  it('throws when no database environment is configured', () => {
    expect(() => resolveDatabaseUrl(createEnv())).toThrow(
      'DATABASE_URL is not set. Set DATABASE_URL or provide POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB.',
    );
  });
});
