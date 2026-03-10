import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { addresses, createdAt, updatedAt } from './shared';
import { users } from './users';
import { donorFavouriteNeeds } from '@/db/schema/donors';

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
    status: text('status').notNull(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => needCategories.id),
    type: text('type').notNull(),
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
  status: text('status').notNull(),
  changedById: integer('changed_by_id')
    .notNull()
    .references(() => users.id),
  createdAt: createdAt(),
});

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
