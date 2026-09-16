import type { CollectionConfig } from "payload";
import { adminsAndOwners, ownersOnly } from "../access/roles.ts";

export const ImportIssues: CollectionConfig = {
	slug: "import-issues",
	admin: {
		useAsTitle: "code",
		defaultColumns: ["severity", "code", "property", "importRun", "createdAt"],
	},
	access: {
		create: adminsAndOwners,
		read: adminsAndOwners,
		update: adminsAndOwners,
		delete: ownersOnly,
	},
	fields: [
		{
			name: "importRun",
			type: "relationship",
			relationTo: "import-runs",
			required: true,
			index: true,
		},
		{
			name: "feedSource",
			type: "relationship",
			relationTo: "feed-sources",
			index: true,
		},
		{
			name: "property",
			type: "relationship",
			relationTo: "properties",
			index: true,
		},
		{
			name: "externalId",
			type: "text",
		},
		{
			name: "severity",
			type: "select",
			required: true,
			defaultValue: "warning",
			index: true,
			options: [
				{ label: "Info", value: "info" },
				{ label: "Warning", value: "warning" },
				{ label: "Error", value: "error" },
			],
		},
		{
			name: "code",
			type: "text",
			required: true,
			index: true,
		},
		{
			name: "messageRedacted",
			type: "textarea",
			required: true,
		},
		{
			name: "field",
			type: "text",
		},
	],
};
