import type { CollectionConfig } from "payload";
import { adminsAndOwners, ownersOnly } from "../access/roles.ts";

export const FeedSources: CollectionConfig = {
	slug: "feed-sources",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["code", "title", "market", "enabled", "nextDueAt"],
	},
	access: {
		create: adminsAndOwners,
		read: adminsAndOwners,
		update: adminsAndOwners,
		delete: ownersOnly,
	},
	fields: [
		{
			name: "code",
			type: "text",
			required: true,
			unique: true,
			admin: {
				description: "Stable source identity used by import jobs and diagnostics.",
			},
		},
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			name: "parser",
			type: "select",
			required: true,
			defaultValue: "yrl",
			options: [{ label: "YRL/XML", value: "yrl" }],
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
			admin: {
				description:
					"Authoritative market for imported properties from this feed source.",
			},
		},
		{
			name: "feedUrlRef",
			type: "text",
			required: true,
			admin: {
				description:
					"Reference to deployment secret/config value. Do not store credential URLs here.",
			},
		},
		{
			name: "enabled",
			type: "checkbox",
			defaultValue: false,
			index: true,
		},
		{
			name: "refreshIntervalMinutes",
			type: "number",
			required: true,
			defaultValue: 1440,
			min: 5,
		},
		{
			name: "nextDueAt",
			type: "date",
			index: true,
		},
		{
			name: "lastAttemptAt",
			type: "date",
		},
		{
			name: "lastSuccessfulRunAt",
			type: "date",
		},
		{
			name: "lastFullRunAt",
			type: "date",
		},
		{
			name: "safetyThresholdPercent",
			type: "number",
			required: true,
			defaultValue: 30,
			min: 0,
			max: 100,
		},
		{
			name: "maxDeactivationsPerRun",
			type: "number",
			required: true,
			defaultValue: 50,
			min: 0,
		},
		{
			name: "lastOfferCount",
			type: "number",
			min: 0,
		},
		{
			name: "lastEtag",
			type: "text",
		},
		{
			name: "lastModified",
			type: "text",
		},
		{
			name: "lastFeedHash",
			type: "text",
		},
		{
			name: "deactivationApproval",
			type: "group",
			fields: [
				{
					name: "runId",
					type: "relationship",
					relationTo: "import-runs",
				},
				{
					name: "approvedBy",
					type: "relationship",
					relationTo: "users",
				},
				{
					name: "approvedAt",
					type: "date",
				},
				{
					name: "expiresAt",
					type: "date",
				},
				{
					name: "consumedAt",
					type: "date",
				},
			],
		},
	],
};
