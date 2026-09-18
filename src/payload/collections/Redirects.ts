import type { CollectionConfig } from "payload";
import { sanitizeExplicitRedirectPath } from "../../server/seo/redirect-path.ts";
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
	hooks: {
		beforeValidate: [
			({ data }) => {
				if (!data) return data;
				const to = sanitizeExplicitRedirectPath(
					typeof data.to === "string" ? data.to : null,
				);
				if (!to) {
					throw new Error(
						"Redirect destination must be an explicit public path and must not target the homepage.",
					);
				}
				data.to = to;
				if (typeof data.from === "string") {
					const from = data.from.trim();
					if (from === to) {
						throw new Error("Redirect must not form a self-chain.");
					}
				}
				return data;
			},
		],
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
