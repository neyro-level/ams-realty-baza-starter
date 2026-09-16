import type { CollectionConfig } from "payload";
import { adminsAndOwners, ownersOnly } from "../access/roles.ts";

export const ImportRuns: CollectionConfig = {
	slug: "import-runs",
	admin: {
		group: "Operations",
		useAsTitle: "id",
		defaultColumns: [
			"feedSource",
			"status",
			"queuedAt",
			"heartbeatAt",
			"warningCount",
			"errorCount",
		],
		description:
			"Owner operations: import history, suspicious/interrupted status, heartbeat, safe counters and redacted diagnostics.",
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
			required: true,
			index: true,
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "queued",
			index: true,
			options: [
				{ label: "Queued", value: "queued" },
				{ label: "Running", value: "running" },
				{ label: "Success", value: "success" },
				{ label: "Unchanged", value: "unchanged" },
				{ label: "Suspicious", value: "suspicious" },
				{ label: "Interrupted", value: "interrupted" },
				{ label: "Failed", value: "failed" },
			],
		},
		{
			name: "queuedAt",
			type: "date",
			required: true,
			index: true,
		},
		{
			name: "startedAt",
			type: "date",
		},
		{
			name: "finishedAt",
			type: "date",
		},
		{
			name: "heartbeatAt",
			type: "date",
			index: true,
		},
		{
			name: "jobId",
			type: "text",
		},
		{
			name: "offeredCount",
			type: "number",
			min: 0,
		},
		{
			name: "createdCount",
			type: "number",
			min: 0,
		},
		{
			name: "updatedCount",
			type: "number",
			min: 0,
		},
		{
			name: "archivedCount",
			type: "number",
			min: 0,
		},
		{
			name: "skippedCount",
			type: "number",
			min: 0,
		},
		{
			name: "warningCount",
			type: "number",
			min: 0,
		},
		{
			name: "errorCount",
			type: "number",
			min: 0,
		},
		{
			name: "feedHash",
			type: "text",
		},
		{
			name: "lastErrorRedacted",
			type: "textarea",
			admin: {
				description:
					"Redacted operational diagnostic only. Do not store feed payload, raw response, PII, credentials or tokens.",
			},
		},
	],
};
