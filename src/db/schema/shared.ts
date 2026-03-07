import { pgEnum, timestamp } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['DONOR', 'ORGANIZATION_ADMIN']);

export const needStatus = pgEnum('need_status', [
  'ACTIVE',
  'FULFILLED',
  'EXPIRED',
]);

export const needType = pgEnum('need_type', ['ONE_TIME']);

export const donationStatus = pgEnum('donation_status', [
  'BOOKED',
  'FULFILLED',
  'CANCELLED',
]);

export const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull();

export const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull();
