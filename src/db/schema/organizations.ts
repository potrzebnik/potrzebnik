import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  unique,
} from 'drizzle-orm/pg-core';
import { addresses } from './addresses';
import { createdAt, deletedAt, updatedAt } from './shared';
import { users } from './users';

export const organizationCategories = pgTable('organization_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const addressTypes = pgTable(
  'address_types',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (table) => [unique('address_types_code_unique').on(table.code)],
);

export const organizationAddresses = pgTable(
  'organization_addresses',
  {
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id),
    addressId: integer('address_id')
      .notNull()
      .references(() => addresses.id),
    addressTypeId: integer('address_type_id')
      .notNull()
      .references(() => addressTypes.id),
    createdAt: createdAt(),
    deletedAt: deletedAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.organizationId, table.addressId, table.addressTypeId],
      name: 'organization_addresses_pkey',
    }),
  ],
);

export const organizations = pgTable(
  'organizations',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    krs: text('krs').notNull(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => organizationCategories.id),
    phoneNumber: text('phone_number').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (table) => [
    unique('organizations_user_id_unique').on(table.userId),
    unique('organizations_krs_unique').on(table.krs),
  ],
);
