import { relations } from 'drizzle-orm';
import { donors } from './donors';
import { needStatusHistory } from './needs';
import { organizations } from './organizations';
import { userRoles, users } from './users';

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
  }),
  donor: one(donors),
  organization: one(organizations),
  needStatusHistoryEntries: many(needStatusHistory),
}));
