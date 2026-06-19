const REQUIRED_POSTGRES_ENV_KEYS = [
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_PORT',
] as const;

export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
    POSTGRES_HOST = 'localhost', //for backward-compatibility
    POSTGRES_PORT,
  } = env;

  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_PORT) {
    const missingKeys = REQUIRED_POSTGRES_ENV_KEYS.filter((key) => !env[key]);

    throw new Error(
      `Missing required database environment variable(s): ${missingKeys.join(', ')}. Set POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB and POSTGRES_PORT.`,
    );
  }

  const url = new URL('postgres://localhost');
  url.username = POSTGRES_USER;
  url.password = POSTGRES_PASSWORD;
  url.hostname = POSTGRES_HOST;
  url.port = POSTGRES_PORT;
  url.pathname = `/${POSTGRES_DB}`;

  return url.toString();
}
