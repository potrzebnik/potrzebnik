import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { donation } from './donation';
import { need } from './need';

export const donor = pgTable('donor', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const donorFavouriteNeed = pgTable(
  'donor_favourite_need',
  {
    donorId: integer('donor_id')
      .notNull()
      .references(() => donor.id),
    needId: integer('need_id')
      .notNull()
      .references(() => need.id),
  },
  (table) => [
    primaryKey({
      columns: [table.donorId, table.needId],
    }),
  ],
);

export const donorRelations = relations(donor, ({ many, one }) => ({
  user: one(user, {
    fields: [donor.userId],
    references: [user.id],
  }),
  donationCommitments: many(donation),
  savedNeeds: many(donorFavouriteNeed),
}));

export const donorFavouriteNeedRelations = relations(
  donorFavouriteNeed,
  ({ one }) => ({
    donor: one(donor, {
      fields: [donorFavouriteNeed.donorId],
      references: [donor.id],
    }),
    need: one(need, {
      fields: [donorFavouriteNeed.needId],
      references: [need.id],
    }),
  }),
);
