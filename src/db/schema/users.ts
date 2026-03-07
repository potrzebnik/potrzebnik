import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { createdAt, updatedAt, userRole } from './shared';

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

export const donors = pgTable('donors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  street: text('street').notNull(),
  building: text('building').notNull(),
  apartment: text('apartment'),
  zipCode: varchar('zip_code', { length: 16 }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

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
    krs: varchar('krs', { length: 10 }).notNull(),
    addressId: integer('address_id')
      .notNull()
      .references(() => addresses.id),
    categoryId: integer('category_id')
      .notNull()
      .references(() => organizationCategories.id),
    phoneNumber: varchar('phone_number', { length: 32 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('organizations_krs_unique').on(table.krs)],
);

export const usersRelations = relations(users, ({ one }) => ({
  donor: one(donors),
  organization: one(organizations),
}));

export const donorsRelations = relations(donors, ({ one }) => ({
  user: one(users, {
    fields: [donors.userId],
    references: [users.id],
  }),
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
