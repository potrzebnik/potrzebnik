import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { donors } from './donors';
import { needs } from './needs';
import { createdAt, deletedAt, updatedAt } from './shared';

export const donationStatuses = pgTable(
  'donation_statuses',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
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
  deletedAt: deletedAt(),
});
