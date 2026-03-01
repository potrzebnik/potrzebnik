import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { resolveDatabaseUrl } from './src/db/resolve-database-url';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: resolveDatabaseUrl(),
  },
});
