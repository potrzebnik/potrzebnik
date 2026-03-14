import { integer, pgTable, serial, text, unique } from 'drizzle-orm/pg-core';
import { addresses } from './addresses';
import { createdAt, updatedAt } from './shared';
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
