const ENV_REFERENCE_PATTERN = /\$\{([A-Z0-9_]+)}/g;

function expandEnvReferences(value: string, env: NodeJS.ProcessEnv): string {
  return value.replace(ENV_REFERENCE_PATTERN, (_, key: string) => {
    const resolved = env[key];

    if (!resolved) {
      throw new Error(
        `Missing environment variable: ${key}. It is required to build DATABASE_URL.`,
      );
    }

    return resolved;
  });
}

export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const { DATABASE_URL } = env;

  if (DATABASE_URL) {
    return DATABASE_URL.includes('${')
      ? expandEnvReferences(DATABASE_URL, env)
      : DATABASE_URL;
  }

  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = env;

  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
    throw new Error(
      'DATABASE_URL is not set. Set DATABASE_URL or provide POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB.',
    );
  }

  const url = new URL('postgres://localhost');
  url.username = POSTGRES_USER;
  url.password = POSTGRES_PASSWORD;
  url.hostname = env.POSTGRES_HOST ?? 'localhost';
  url.port = env.POSTGRES_PORT ?? '5432';
  url.pathname = `/${POSTGRES_DB}`;

  return url.toString();
}
