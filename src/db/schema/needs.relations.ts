import { relations } from 'drizzle-orm';
import { addresses } from './addresses';
import { donorFavouriteNeeds } from './donors';
import {
  needCategories,
  needStatusHistory,
  needStatuses,
  needs,
  needTypes,
} from './needs';
import { organizations } from './organizations';
import { users } from './users';

export const needCategoriesRelations = relations(
  needCategories,
  ({ many }) => ({
    needs: many(needs),
  }),
);

export const needStatusesRelations = relations(needStatuses, ({ many }) => ({
  needs: many(needs),
  historyEntries: many(needStatusHistory),
}));

export const needTypesRelations = relations(needTypes, ({ many }) => ({
  needs: many(needs),
}));

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
  status: one(needStatuses, {
    fields: [needs.statusId],
    references: [needStatuses.id],
  }),
  type: one(needTypes, {
    fields: [needs.typeId],
    references: [needTypes.id],
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
    status: one(needStatuses, {
      fields: [needStatusHistory.statusId],
      references: [needStatuses.id],
    }),
  }),
);
