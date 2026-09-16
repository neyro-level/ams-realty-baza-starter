import type { CollectionConfig, FieldAccess } from "payload";
import { adminsAndOwners, hasRole, ownersOnly } from "../access/roles.ts";

const fieldAdminsAndOwners: FieldAccess = ({ req }) => hasRole(req.user, ["owner", "admin"]);
const fieldOwnersOnly: FieldAccess = ({ req }) => hasRole(req.user, ["owner"]);

const privateFieldAccess = {
	read: fieldAdminsAndOwners,
	create: fieldAdminsAndOwners,
	update: fieldAdminsAndOwners,
};

export const Properties: CollectionConfig = {
	slug: "properties",
	versions: false,
	admin: {
		useAsTitle: "title",
		defaultColumns: ["slug", "origin", "market", "status", "updatedAt"],
	},
	access: {
		create: adminsAndOwners,
		read: adminsAndOwners,
		update: adminsAndOwners,
		delete: ownersOnly,
	},
	fields: [
		{
			name: "feedSource",
			type: "relationship",
			relationTo: "feed-sources",
			index: true,
			admin: {
				description: "Required for origin=feed; empty for manual properties.",
			},
		},
		{
			name: "externalId",
			type: "text",
			index: true,
			admin: {
				description: "Required for origin=feed; paired with feedSource by SQL guard.",
			},
		},
		{
			name: "origin",
			type: "select",
			required: true,
			defaultValue: "manual",
			index: true,
			options: [
				{ label: "Feed", value: "feed" },
				{ label: "Manual", value: "manual" },
			],
		},
		{
			name: "importHash",
			type: "text",
		},
		{
			name: "firstSeenAt",
			type: "date",
		},
		{
			name: "lastSeenAt",
			type: "date",
		},
		{
			name: "lastImportRun",
			type: "relationship",
			relationTo: "import-runs",
		},
		{
			name: "externalComplexId",
			type: "text",
			index: true,
		},
		{
			name: "externalComplexName",
			type: "text",
		},
		{
			name: "externalBuildingId",
			type: "text",
			index: true,
		},
		{
			name: "externalLayoutId",
			type: "text",
			index: true,
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "active",
			index: true,
			options: [
				{ label: "Active", value: "active" },
				{ label: "Archived", value: "archived" },
			],
		},
		{
			name: "deactivatedAt",
			type: "date",
		},
		{
			name: "deactivatedByRun",
			type: "relationship",
			relationTo: "import-runs",
		},
		{
			name: "needsReview",
			type: "checkbox",
			defaultValue: false,
			index: true,
		},
		{
			name: "publishedAt",
			type: "date",
		},
		{
			name: "contentPurgedAt",
			type: "date",
			index: true,
			admin: {
				description: "Set after lifecycle retention purges object content.",
			},
		},
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			index: true,
			access: {
				update: fieldOwnersOnly,
			},
			admin: {
				description:
					"Public immutable page identity. Feed imports must not rotate it after first publish.",
			},
		},
		{
			name: "market",
			type: "select",
			required: true,
			defaultValue: "secondary",
			index: true,
			options: [
				{ label: "Secondary", value: "secondary" },
				{ label: "Newbuild", value: "newbuild" },
			],
		},
		{
			name: "category",
			type: "select",
			required: true,
			index: true,
			options: [
				{ label: "Apartment", value: "apartment" },
				{ label: "House", value: "house" },
				{ label: "Land", value: "land" },
				{ label: "Commercial", value: "commercial" },
			],
		},
		{
			name: "dealType",
			type: "select",
			required: true,
			index: true,
			options: [
				{ label: "Sale", value: "sale" },
				{ label: "Rent", value: "rent" },
			],
		},
		{
			name: "priceMinor",
			type: "number",
			min: 0,
			index: true,
		},
		{
			name: "currency",
			type: "select",
			defaultValue: "RUB",
			options: [{ label: "RUB", value: "RUB" }],
		},
		{
			name: "pricePerMeterMinor",
			type: "number",
			min: 0,
		},
		{
			name: "rooms",
			type: "number",
			min: 0,
			index: true,
		},
		{
			name: "totalArea",
			type: "number",
			min: 0,
		},
		{
			name: "livingArea",
			type: "number",
			min: 0,
		},
		{
			name: "kitchenArea",
			type: "number",
			min: 0,
		},
		{
			name: "floor",
			type: "number",
		},
		{
			name: "floors",
			type: "number",
		},
		{
			name: "region",
			type: "text",
		},
		{
			name: "locality",
			type: "text",
		},
		{
			name: "district",
			type: "text",
			index: true,
		},
		{
			name: "street",
			type: "text",
		},
		{
			name: "house",
			type: "text",
		},
		{
			name: "publicAddress",
			type: "text",
		},
		{
			name: "lat",
			type: "number",
		},
		{
			name: "lng",
			type: "number",
		},
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			name: "description",
			type: "textarea",
		},
		{
			name: "images",
			type: "array",
			fields: [
				{
					name: "kind",
					type: "select",
					required: true,
					defaultValue: "external",
					options: [
						{ label: "External feed URL", value: "external" },
						{ label: "Managed media", value: "managed" },
					],
				},
				{
					name: "url",
					type: "text",
				},
				{
					name: "media",
					type: "relationship",
					relationTo: "media",
				},
				{
					name: "alt",
					type: "text",
				},
				{
					name: "order",
					type: "number",
					min: 0,
				},
			],
		},
		{
			name: "manualOverrides",
			type: "array",
			fields: [
				{
					name: "field",
					type: "text",
					required: true,
				},
				{
					name: "setAt",
					type: "date",
					required: true,
				},
				{
					name: "setBy",
					type: "relationship",
					relationTo: "users",
				},
			],
			admin: {
				description:
					"Import-managed fields explicitly owned by manual edits. Slug is not a normal manual override.",
			},
		},
		{
			name: "unitNumber",
			type: "text",
			access: privateFieldAccess,
		},
		{
			name: "cadastralNumber",
			type: "text",
			access: privateFieldAccess,
		},
		{
			name: "internalComment",
			type: "textarea",
			access: privateFieldAccess,
		},
		{
			name: "ownerContact",
			type: "textarea",
			access: privateFieldAccess,
		},
	],
};
