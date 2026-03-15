import { index, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { createdAt, updatedAt } from './shared';

export const addresses = pgTable(
  'addresses',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id),
    city: text('city').notNull(),
    street: text('street').notNull(),
    building: text('building').notNull(),
    apartment: text('apartment'),
    zipCode: text('zip_code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('addresses_organization_id_idx').on(table.organizationId)],
);
