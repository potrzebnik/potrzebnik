import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  unique,
} from 'drizzle-orm/pg-core';
import { addresses } from './addresses';
import { organizations } from './organizations';
import { createdAt, updatedAt } from './shared';
import { users } from './users';

export const needCategories = pgTable('need_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const needStatuses = pgTable(
  'need_statuses',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('need_statuses_code_unique').on(table.code)],
);

export const needTypes = pgTable(
  'need_types',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('need_types_code_unique').on(table.code)],
);

export const needs = pgTable(
  'needs',
  {
    id: serial('id').primaryKey(),
    description: text('description').notNull(),
    price: integer('price').notNull(), // as cents / grosze
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id),
    donee: text('donee').notNull(), // for whom
    item: text('item').notNull(),
    addressId: integer('address_id')
      .notNull()
      .references(() => addresses.id),
    expiry: date('expiry').notNull(),
    photo: text('photo'),
    statusId: integer('status_id')
      .notNull()
      .references(() => needStatuses.id),
    categoryId: integer('category_id')
      .notNull()
      .references(() => needCategories.id),
    typeId: integer('type_id')
      .notNull()
      .references(() => needTypes.id),
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
  statusId: integer('status_id')
    .notNull()
    .references(() => needStatuses.id),
  changedById: integer('changed_by_id')
    .notNull()
    .references(() => users.id),
  createdAt: createdAt(),
});
