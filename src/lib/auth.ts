import { db } from '@/db';
import { createAuth } from './auth-config';
import { getAuthEnv } from './auth-env';
import { createResendEmailSender } from './emails';

export { createAuth } from './auth-config';

const authEnv = getAuthEnv();

export const auth = createAuth({
  database: db,
  secret: authEnv.secret,
  baseURL: authEnv.baseURL,
  google: authEnv.google,
  emailSender: authEnv.email
    ? createResendEmailSender(authEnv.email)
    : undefined,
});
