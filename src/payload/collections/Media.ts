import type { CollectionConfig } from "payload";
import { adminsAndOwners, authenticated } from "../access/roles.ts";

export const Media: CollectionConfig = {
	slug: "media",
	upload: {
		mimeTypes: ["image/*", "application/pdf"],
	},
	admin: {
		useAsTitle: "alt",
		defaultColumns: ["alt", "mimeType", "updatedAt"],
	},
	access: {
		create: authenticated,
		read: adminsAndOwners,
		update: adminsAndOwners,
		delete: adminsAndOwners,
	},
	fields: [
		{
			name: "alt",
			type: "text",
			required: true,
		},
	],
};
