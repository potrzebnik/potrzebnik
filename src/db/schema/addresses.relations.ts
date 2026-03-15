import { relations } from 'drizzle-orm';
import { addresses } from './addresses';
import { needs } from './needs';
import { organizations } from './organizations';

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [addresses.organizationId],
    references: [organizations.id],
  }),
  needs: many(needs),
}));
