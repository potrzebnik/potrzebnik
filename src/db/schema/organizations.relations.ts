import { relations } from 'drizzle-orm';
import { addresses } from './addresses';
import { organizationCategories, organizations } from './organizations';
import { users } from './users';

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
