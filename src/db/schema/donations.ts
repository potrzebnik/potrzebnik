import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { needs } from './needs';
import { donors } from './donors';
import { updatedAt } from '@/db/schema/shared';

export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  donorId: integer('donor_id')
    .notNull()
    .references(() => donors.id),
  needId: integer('need_id')
    .notNull()
    .references(() => needs.id),
  status: text('status').notNull(),
  bookedAt: timestamp('booked_at', { withTimezone: true }).notNull(),
  fulfilledAt: timestamp('fulfilled_at', { withTimezone: true }),
  updatedAt: updatedAt(),
});

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
