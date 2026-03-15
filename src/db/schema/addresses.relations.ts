import { relations } from 'drizzle-orm';
import { addresses } from './addresses';
import { needs } from './needs';
import { organizationAddresses } from './organizations';

export const addressesRelations = relations(addresses, ({ many }) => ({
  organizationLinks: many(organizationAddresses),
  needs: many(needs),
}));
