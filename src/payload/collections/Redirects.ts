import type { CollectionConfig } from "payload";
import { adminsAndOwners, ownersOnly } from "../access/roles.ts";

export const Redirects: CollectionConfig = {
	slug: "redirects",
	admin: {
		useAsTitle: "from",
		defaultColumns: ["from", "to", "statusCode", "updatedAt"],
	},
	access: {
		create: ownersOnly,
		read: adminsAndOwners,
		update: ownersOnly,
		delete: ownersOnly,
	},
	fields: [
		{
			name: "from",
			type: "text",
			required: true,
			unique: true,
			index: true,
			admin: {
				description: "Old public path. Must be created explicitly by owner action or approved migration.",
			},
		},
		{
			name: "to",
			type: "text",
			required: true,
		},
		{
			name: "statusCode",
			type: "select",
			required: true,
			defaultValue: "301",
			options: [
				{ label: "301 Permanent", value: "301" },
				{ label: "302 Temporary", value: "302" },
			],
		},
		{
			name: "reason",
			type: "textarea",
		},
		{
			name: "createdBy",
			type: "relationship",
			relationTo: "users",
		},
	],
};
