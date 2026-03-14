import { relations } from 'drizzle-orm';
import { donors } from './donors';
import { organizations } from './organizations';
import { userRoles, users } from './users';

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
  }),
  donor: one(donors),
  organization: one(organizations),
}));
