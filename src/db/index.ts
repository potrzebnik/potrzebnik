import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';

import { resolveDatabaseUrl } from './resolve-database-url';

export const db = drizzle(resolveDatabaseUrl(), { schema });
