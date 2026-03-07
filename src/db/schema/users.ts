import { pgEnum, pgTable, serial, text, unique } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './shared';

export const userRole = pgEnum('user_role', ['DONOR', 'ORGANIZATION_ADMIN']);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRole('role').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('users_email_unique').on(table.email)],
);
