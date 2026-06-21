import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { address } from './address';
import { need } from './need';

export const organization = pgTable('organization', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id),
  name: text('name').notNull(),
  krs: text('krs').notNull().unique(),
  mainAddressId: integer('main_address_id')
    .notNull()
    .references(() => address.id),
  phoneNumber: text('phone_number').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const organizationShippingAddress = pgTable(
  'organization_shipping_address',
  {
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organization.id),
    addressId: integer('address_id')
      .notNull()
      .references(() => address.id),
  },
  (table) => [
    primaryKey({
      columns: [table.organizationId, table.addressId],
    }),
  ],
);

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    user: one(user, {
      fields: [organization.userId],
      references: [user.id],
    }),
    mainAddress: one(address, {
      fields: [organization.mainAddressId],
      references: [address.id],
    }),
    shippingAddresses: many(organizationShippingAddress),
    publishedNeeds: many(need),
  }),
);

export const organizationShippingAddressRelations = relations(
  organizationShippingAddress,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationShippingAddress.organizationId],
      references: [organization.id],
    }),
    address: one(address, {
      fields: [organizationShippingAddress.addressId],
      references: [address.id],
    }),
  }),
);
