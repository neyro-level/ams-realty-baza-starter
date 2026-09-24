import type { CollectionConfig } from "payload";
import { adminsAndOwners, ownersOnly } from "../../core/access/roles.ts";
import { geoReadAccess } from "../geo/access.ts";
import { validateDistrictWrite } from "../geo/collection-guards.ts";
import {
	createGeoIdentityFields,
	createGeoPublicationFields,
} from "./geo-fields.ts";

export const Districts: CollectionConfig = {
	slug: "districts",
	admin: {
		group: "Geo catalog",
		useAsTitle: "title",
		defaultColumns: ["slug", "title", "city", "status", "updatedAt"],
	},
	access: {
		create: adminsAndOwners,
		read: geoReadAccess,
		update: adminsAndOwners,
		delete: ownersOnly,
	},
	hooks: {
		beforeValidate: [
			async ({ data, originalDoc, req }) => {
				if (!data) return data;
				return validateDistrictWrite({ data, originalDoc, req });
			},
		],
	},
	fields: [
		...createGeoIdentityFields(),
		{
			name: "districtType",
			type: "select",
			required: true,
			options: [
				{ label: "Административный район", value: "administrative" },
				{ label: "Микрорайон", value: "microdistrict" },
			],
		},
		{
			name: "city",
			type: "relationship",
			relationTo: "cities",
			required: true,
			index: true,
		},
		{
			name: "parent",
			type: "relationship",
			relationTo: "districts",
			index: true,
			admin: { description: "Optional parent district in the same city." },
		},
		{
			name: "synonyms",
			type: "array",
			maxRows: 20,
			fields: [{ name: "value", type: "text", required: true }],
		},
		{
			name: "preposition",
			type: "select",
			required: true,
			options: [
				{ label: "в", value: "v" },
				{ label: "на", value: "na" },
			],
		},
		{
			name: "morphologyApproved",
			type: "checkbox",
			required: true,
			defaultValue: false,
		},
		{ name: "sortOrder", type: "number", required: true, defaultValue: 0 },
		...createGeoPublicationFields(),
	],
};
