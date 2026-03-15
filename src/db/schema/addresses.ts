import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createdAt, deletedAt, updatedAt } from './shared';

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  street: text('street').notNull(),
  building: text('building').notNull(),
  apartment: text('apartment'),
  zipCode: text('zip_code').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});
