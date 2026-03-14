import { relations } from 'drizzle-orm';
import { donationStatuses, donations } from './donations';
import { donors } from './donors';
import { needs } from './needs';

export const donationStatusesRelations = relations(
  donationStatuses,
  ({ many }) => ({
    donations: many(donations),
  }),
);

export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(donors, {
    fields: [donations.donorId],
    references: [donors.id],
  }),
  need: one(needs, {
    fields: [donations.needId],
    references: [needs.id],
  }),
  status: one(donationStatuses, {
    fields: [donations.statusId],
    references: [donationStatuses.id],
  }),
}));
