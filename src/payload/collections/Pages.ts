import type { CollectionConfig, Where } from "payload";
import { projectConfig } from "../../project/project.config.ts";
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
	hooks: {
		beforeValidate: [
			({ data }) => {
				if (!data || typeof data.slug !== "string") return data;
				const slug = data.slug.trim().replace(/^\/+/, "");
				const path = `/${slug}`;
				const reserved = projectConfig.reservedNamespaces.some(
					(namespace) =>
						path === namespace || path.startsWith(`${namespace}/`),
				);
				if (reserved) {
					throw new Error(
						`CMS page slug cannot occupy reserved namespace ${path}.`,
					);
				}
				data.slug = slug;
				return data;
			},
		],
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
