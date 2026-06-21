import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { address } from './address';
import { user } from './auth';
import { donation } from './donation';
import { donorFavouriteNeed } from './donor';
import { organization } from './organization';

export const need = pgTable('need', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organization.id),
  deliveryAddressId: integer('delivery_address_id')
    .notNull()
    .references(() => address.id),
  description: text('description').notNull(),
  beneficiaryName: text('beneficiary_name').notNull(),
  requestedItem: text('requested_item').notNull(),
  photo: text('photo'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const needStatusHistory = pgTable('need_status_history', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  needId: integer('need_id')
    .notNull()
    .references(() => need.id),
  toStatus: text('to_status').notNull(),
  changedByUserId: text('changed_by_user_id')
    .notNull()
    .references(() => user.id),
  changedAt: timestamp('changed_at').notNull(),
});

export const needRelations = relations(need, ({ many, one }) => ({
  organization: one(organization, {
    fields: [need.organizationId],
    references: [organization.id],
  }),
  deliveryAddress: one(address, {
    fields: [need.deliveryAddressId],
    references: [address.id],
  }),
  statusTimeline: many(needStatusHistory),
  donationCommitments: many(donation),
  savedByDonors: many(donorFavouriteNeed),
}));

export const needStatusHistoryRelations = relations(
  needStatusHistory,
  ({ one }) => ({
    need: one(need, {
      fields: [needStatusHistory.needId],
      references: [need.id],
    }),
    changedBy: one(user, {
      fields: [needStatusHistory.changedByUserId],
      references: [user.id],
    }),
  }),
);
