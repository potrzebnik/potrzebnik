import { timestamp } from 'drizzle-orm/pg-core';

export const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull();

export const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull();

export const deletedAt = () => timestamp('deleted_at', { withTimezone: true });
