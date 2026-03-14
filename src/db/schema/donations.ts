import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { needs } from './needs';
import { donors } from './donors';
import { createdAt, updatedAt } from '@/db/schema/shared';

export const donationStatuses = pgTable(
  'donation_statuses',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [unique('donation_statuses_code_unique').on(table.code)],
);

export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  donorId: integer('donor_id')
    .notNull()
    .references(() => donors.id),
  needId: integer('need_id')
    .notNull()
    .references(() => needs.id),
  statusId: integer('status_id')
    .notNull()
    .references(() => donationStatuses.id),
  bookedAt: timestamp('booked_at', { withTimezone: true }).notNull(),
  fulfilledAt: timestamp('fulfilled_at', { withTimezone: true }),
  updatedAt: updatedAt(),
});

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
