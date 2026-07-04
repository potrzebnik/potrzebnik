import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { donor } from './donor';
import { need } from './need';

export const donation = pgTable('donation', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  donorId: integer('donor_id')
    .notNull()
    .references(() => donor.id),
  needId: integer('need_id')
    .notNull()
    .references(() => need.id),
  status: text('status').notNull(),
  bookedAt: timestamp('booked_at').notNull(),
  fulfilledAt: timestamp('fulfilled_at'),
});

export const donationRelations = relations(donation, ({ one }) => ({
  donor: one(donor, {
    fields: [donation.donorId],
    references: [donor.id],
  }),
  need: one(need, {
    fields: [donation.needId],
    references: [need.id],
  }),
}));
