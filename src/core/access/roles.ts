import type { Access } from "payload";

export const userRoles = ["owner", "admin", "editor"] as const;

export type UserRole = (typeof userRoles)[number];

type RoleUser = {
	roles?: UserRole[] | null;
};

export function hasRole(user: unknown, allowed: readonly UserRole[]) {
	const roles = (user as RoleUser | null | undefined)?.roles;
	return Array.isArray(roles) && roles.some((role) => allowed.includes(role));
}

export const adminsAndOwners: Access = ({ req }) => hasRole(req.user, ["owner", "admin"]);

export const ownersOnly: Access = ({ req }) => hasRole(req.user, ["owner"]);

export const authenticated: Access = ({ req }) => Boolean(req.user);
