import { relations } from 'drizzle-orm';
import { donorFavouriteNeeds, donors } from './donors';
import { donations } from './donations';
import { needs } from './needs';
import { users } from './users';

export const donorsRelations = relations(donors, ({ one, many }) => ({
  user: one(users, {
    fields: [donors.userId],
    references: [users.id],
  }),
  donations: many(donations),
  favouriteNeeds: many(donorFavouriteNeeds),
}));

export const donorFavouriteNeedsRelations = relations(
  donorFavouriteNeeds,
  ({ one }) => ({
    donor: one(donors, {
      fields: [donorFavouriteNeeds.donorId],
      references: [donors.id],
    }),
    need: one(needs, {
      fields: [donorFavouriteNeeds.needId],
      references: [needs.id],
    }),
  }),
);
