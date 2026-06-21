import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const address = pgTable('address', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  city: text('city').notNull(),
  street: text('street').notNull(),
  building: text('building').notNull(),
  apartment: text('apartment'),
  zipCode: text('zip_code').notNull(),
});
