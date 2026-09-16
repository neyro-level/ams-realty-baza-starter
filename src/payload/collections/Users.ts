import type { CollectionConfig } from "payload";
import { adminsAndOwners, hasRole, ownersOnly, userRoles } from "../access/roles.ts";

export const Users: CollectionConfig = {
	slug: "users",
	auth: true,
	admin: {
		useAsTitle: "email",
		defaultColumns: ["email", "roles", "updatedAt"],
	},
	access: {
		create: ownersOnly,
		read: adminsAndOwners,
		update: adminsAndOwners,
		delete: ownersOnly,
	},
	fields: [
		{
			name: "roles",
			type: "select",
			hasMany: true,
			required: true,
			defaultValue: ["editor"],
			options: userRoles.map((role) => ({ label: role, value: role })),
			access: {
				create: ({ req }) => hasRole(req.user, ["owner"]),
				update: ({ req }) => hasRole(req.user, ["owner"]),
			},
		},
	],
};
