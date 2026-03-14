import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, unique } from 'drizzle-orm/pg-core';
import { donors } from './donors';
import { addresses, createdAt, updatedAt } from './shared';
import { users } from './users';

export const organizationCategories = pgTable('organization_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const organizations = pgTable(
  'organizations',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    krs: text('krs').notNull(),
    addressId: integer('address_id')
      .notNull()
      .references(() => addresses.id),
    categoryId: integer('category_id')
      .notNull()
      .references(() => organizationCategories.id),
    phoneNumber: text('phone_number').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('organizations_krs_unique').on(table.krs)],
);

export const usersRelations = relations(users, ({ one }) => ({
  donor: one(donors),
  organization: one(organizations),
}));

export const addressesRelations = relations(addresses, ({ many }) => ({
  organizations: many(organizations),
}));

export const organizationCategoriesRelations = relations(
  organizationCategories,
  ({ many }) => ({
    organizations: many(organizations),
  }),
);

export const organizationsRelations = relations(organizations, ({ one }) => ({
  user: one(users, {
    fields: [organizations.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [organizations.addressId],
    references: [addresses.id],
  }),
  category: one(organizationCategories, {
    fields: [organizations.categoryId],
    references: [organizationCategories.id],
  }),
}));
