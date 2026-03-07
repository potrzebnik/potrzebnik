import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
} from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './shared';
import { users } from './users';
import { needs } from '@/db/schema/needs';

export const donors = pgTable('donors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

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

export const donorsRelations = relations(donors, ({ one }) => ({
  user: one(users, {
    fields: [donors.userId],
    references: [users.id],
  }),
}));

export const donorFavouriteNeedsRelations = relations(
  donorFavouriteNeeds,
  ({ one }) => ({
    donor: one(donors, {
      fields: [donorFavouriteNeeds.donorId],
      references: [donors.id],
    }),
    need: one(needs, {
      fields: [donorFavouriteNeeds.needId],
      references: [needs.id],
    }),
  }),
);
