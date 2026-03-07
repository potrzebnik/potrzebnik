import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
} from 'drizzle-orm/pg-core';
import { addresses, donors, organizations, users } from './users';
import { createdAt, needStatus, needType, updatedAt } from './shared';

export const needCategories = pgTable('need_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const needs = pgTable(
  'needs',
  {
    id: serial('id').primaryKey(),
    description: text('description').notNull(),
    price: integer('price').notNull(),
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id),
    donee: text('donee').notNull(),
    item: text('item').notNull(),
    addressId: integer('address_id')
      .notNull()
      .references(() => addresses.id),
    expiry: date('expiry').notNull(),
    photo: text('photo'),
    status: needStatus('status').notNull(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => needCategories.id),
    type: needType('type').notNull(),
    important: boolean('important').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('needs_organization_id_idx').on(table.organizationId)],
);

export const needStatusHistory = pgTable('need_status_history', {
  id: serial('id').primaryKey(),
  needId: integer('need_id')
    .notNull()
    .references(() => needs.id),
  status: needStatus('status').notNull(),
  changedById: integer('changed_by_id')
    .notNull()
    .references(() => users.id),
  createdAt: createdAt(),
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

export const needCategoriesRelations = relations(
  needCategories,
  ({ many }) => ({
    needs: many(needs),
  }),
);

export const needsRelations = relations(needs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [needs.organizationId],
    references: [organizations.id],
  }),
  address: one(addresses, {
    fields: [needs.addressId],
    references: [addresses.id],
  }),
  category: one(needCategories, {
    fields: [needs.categoryId],
    references: [needCategories.id],
  }),
  statusHistory: many(needStatusHistory),
  favouritedBy: many(donorFavouriteNeeds),
}));

export const needStatusHistoryRelations = relations(
  needStatusHistory,
  ({ one }) => ({
    need: one(needs, {
      fields: [needStatusHistory.needId],
      references: [needs.id],
    }),
    changedBy: one(users, {
      fields: [needStatusHistory.changedById],
      references: [users.id],
    }),
  }),
);

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
