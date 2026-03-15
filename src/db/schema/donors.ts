import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  unique,
} from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './shared';
import { needs } from './needs';
import { users } from './users';

export const donors = pgTable(
  'donors',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('donors_user_id_unique').on(table.userId)],
);

export const donorFavouriteNeeds = pgTable(
  'donor_favourite_needs',
  {
    donorId: integer('donor_id')
      .notNull()
      .references(() => donors.id),
    needId: integer('need_id')
      .notNull()
      .references(() => needs.id),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.donorId, table.needId],
      name: 'donor_favourite_needs_pkey',
    }),
  ],
);
