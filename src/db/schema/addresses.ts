import { index, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { createdAt, deletedAt, updatedAt } from './shared';

export const addresses = pgTable(
  'addresses',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').references(
      () => organizations.id,
    ),
    city: text('city').notNull(),
    street: text('street').notNull(),
    building: text('building').notNull(),
    apartment: text('apartment'),
    zipCode: text('zip_code').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (table) => [index('addresses_organization_id_idx').on(table.organizationId)],
);
