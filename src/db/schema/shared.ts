import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull();

export const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull();

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  street: text('street').notNull(),
  building: text('building').notNull(),
  apartment: text('apartment'),
  zipCode: text('zip_code').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
