import { db } from '../db';
import { createAuth } from './auth-config';

export { createAuth, getAuthEnv } from './auth-config';

export const auth = createAuth({
  database: db,
});
