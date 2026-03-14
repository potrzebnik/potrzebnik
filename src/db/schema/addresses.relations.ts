import { relations } from 'drizzle-orm';
import { addresses } from './addresses';
import { organizations } from './organizations';

export const addressesRelations = relations(addresses, ({ many }) => ({
  organizations: many(organizations),
}));
