import { integer, pgTable, serial, text, unique } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './shared';

export const userRoles = pgTable(
  'user_roles',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('user_roles_code_unique').on(table.code)],
);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    roleId: integer('role_id')
      .notNull()
      .references(() => userRoles.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('users_email_unique').on(table.email)],
);
