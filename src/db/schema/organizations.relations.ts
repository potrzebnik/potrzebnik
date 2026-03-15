import { relations } from 'drizzle-orm';
import { addresses } from './addresses';
import { needs } from './needs';
import {
  addressTypes,
  organizationCategories,
  organizationAddresses,
  organizations,
} from './organizations';
import { users } from './users';

export const addressTypesRelations = relations(addressTypes, ({ many }) => ({
  organizationAddresses: many(organizationAddresses),
}));

export const organizationCategoriesRelations = relations(
  organizationCategories,
  ({ many }) => ({
    organizations: many(organizations),
  }),
);

export const organizationsRelations = relations(
  organizations,
  ({ many, one }) => ({
    user: one(users, {
      fields: [organizations.userId],
      references: [users.id],
    }),
    addresses: many(organizationAddresses),
    needs: many(needs),
    category: one(organizationCategories, {
      fields: [organizations.categoryId],
      references: [organizationCategories.id],
    }),
  }),
);

export const organizationAddressesRelations = relations(
  organizationAddresses,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationAddresses.organizationId],
      references: [organizations.id],
    }),
    address: one(addresses, {
      fields: [organizationAddresses.addressId],
      references: [addresses.id],
    }),
    addressType: one(addressTypes, {
      fields: [organizationAddresses.addressTypeId],
      references: [addressTypes.id],
    }),
  }),
);
