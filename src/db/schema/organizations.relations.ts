import { relations } from 'drizzle-orm';
import { addresses } from './addresses';
import { needs } from './needs';
import { organizationCategories, organizations } from './organizations';
import { users } from './users';

export const organizationCategoriesRelations = relations(
  organizationCategories,
  ({ many }) => ({
    organizations: many(organizations),
  }),
);

export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [organizations.userId],
      references: [users.id],
    }),
    addresses: many(addresses),
    needs: many(needs),
    category: one(organizationCategories, {
      fields: [organizations.categoryId],
      references: [organizationCategories.id],
    }),
  }),
);
