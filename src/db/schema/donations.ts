import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { needs } from './needs';
import { donors } from './donors';
import { updatedAt } from '@/db/schema/shared';

export const donationStatus = pgEnum('donation_status', [
  'BOOKED',
  'FULFILLED',
  'CANCELLED',
]);

export const donations = pgTable(
  'donations',
  {
    id: serial('id').primaryKey(),
    donorId: integer('donor_id')
      .notNull()
      .references(() => donors.id),
    needId: integer('need_id')
      .notNull()
      .references(() => needs.id),
    status: donationStatus('status').notNull(),
    bookedAt: timestamp('booked_at', { withTimezone: true }).notNull(),
    fulfilledAt: timestamp('fulfilled_at', { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (table) => [
    unique('donations_donor_need_unique').on(table.donorId, table.needId),
  ],
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
}));
