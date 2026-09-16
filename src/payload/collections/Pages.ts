import type { CollectionConfig, Where } from "payload";
import { adminsAndOwners, hasRole, ownersOnly } from "../access/roles.ts";

const publicPageReadWhere: Where = {
	and: [
		{ status: { equals: "published" } },
		{ publishedAt: { exists: true } },
	],
};

export const Pages: CollectionConfig = {
	slug: "pages",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["slug", "status", "updatedAt"],
	},
	access: {
		create: adminsAndOwners,
		read: ({ req }) => {
			if (hasRole(req.user, ["owner", "admin"])) {
				return true;
			}

			return publicPageReadWhere;
		},
		update: adminsAndOwners,
		delete: ownersOnly,
	},
	fields: [
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			index: true,
		},
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "draft",
			index: true,
			options: [
				{ label: "Draft", value: "draft" },
				{ label: "Published", value: "published" },
				{ label: "Archived", value: "archived" },
			],
		},
		{
			name: "publishedAt",
			type: "date",
		},
		{
			name: "seo",
			type: "group",
			fields: [
				{
					name: "title",
					type: "text",
				},
				{
					name: "description",
					type: "textarea",
				},
				{
					name: "noindex",
					type: "checkbox",
					defaultValue: false,
				},
			],
		},
	],
};
