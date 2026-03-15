import { integer, pgTable, serial, text, unique } from 'drizzle-orm/pg-core';
import { createdAt, deletedAt, updatedAt } from './shared';

export const userRoles = pgTable(
  'user_roles',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (table) => [unique('user_roles_code_unique').on(table.code)],
);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash'),
    roleId: integer('role_id')
      .notNull()
      .references(() => userRoles.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (table) => [unique('users_email_unique').on(table.email)],
);
