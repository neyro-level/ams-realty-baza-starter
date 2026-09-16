import type { CollectionConfig } from "payload";
import { adminsAndOwners, ownersOnly } from "../access/roles.ts";

export const LeadDeliveries: CollectionConfig = {
	slug: "lead-deliveries",
	versions: false,
	admin: {
		useAsTitle: "idempotencyKey",
		defaultColumns: ["lead", "channelId", "status", "attempts", "nextAttemptAt"],
	},
	access: {
		create: adminsAndOwners,
		read: adminsAndOwners,
		update: adminsAndOwners,
		delete: ownersOnly,
	},
	fields: [
		{
			name: "lead",
			type: "relationship",
			relationTo: "leads",
			required: true,
			index: true,
		},
		{
			name: "channelId",
			type: "text",
			required: true,
			index: true,
			admin: {
				description: "Immutable logical channel ID. Never reuse for another destination.",
			},
		},
		{
			name: "channelKind",
			type: "select",
			required: true,
			index: true,
			options: [
				{ label: "Messenger", value: "messenger" },
				{ label: "CRM", value: "crm" },
			],
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "pending",
			index: true,
			admin: {
				description:
					"Delivery state only. Agency workflow status is stored on the lead record.",
			},
			options: [
				{ label: "Pending", value: "pending" },
				{ label: "Sending", value: "sending" },
				{ label: "Delivered", value: "delivered" },
				{ label: "Failed", value: "failed" },
				{ label: "Abandoned", value: "abandoned" },
			],
		},
		{
			name: "attempts",
			type: "number",
			required: true,
			defaultValue: 0,
			min: 0,
		},
		{
			name: "nextAttemptAt",
			type: "date",
			index: true,
		},
		{
			name: "jobId",
			type: "text",
			index: true,
		},
		{
			name: "claimedAt",
			type: "date",
			index: true,
		},
		{
			name: "heartbeatAt",
			type: "date",
			index: true,
		},
		{
			name: "deliveredAt",
			type: "date",
			index: true,
		},
		{
			name: "idempotencyKey",
			type: "text",
			required: true,
			unique: true,
			index: true,
		},
		{
			name: "externalRef",
			type: "text",
		},
		{
			name: "lastErrorKind",
			type: "select",
			options: [
				{ label: "Retryable", value: "retryable" },
				{ label: "Permanent", value: "permanent" },
			],
		},
		{
			name: "lastErrorRedacted",
			type: "textarea",
			admin: {
				description: "Redacted diagnostic only. No raw payload, PII, response body, token, or secret.",
			},
		},
		{
			name: "abandonedReason",
			type: "select",
			options: [
				{ label: "Exhausted", value: "exhausted" },
				{ label: "Permanent", value: "permanent" },
				{ label: "Manual", value: "manual" },
			],
		},
		{
			name: "attemptLog",
			type: "array",
			admin: {
				description: "Compact safe diagnostics only; raw payload/response, PII and secrets are forbidden.",
			},
			fields: [
				{
					name: "attemptedAt",
					type: "date",
					required: true,
				},
				{
					name: "safeCode",
					type: "text",
				},
				{
					name: "outcome",
					type: "select",
					required: true,
					options: [
						{ label: "Delivered", value: "delivered" },
						{ label: "Retryable", value: "retryable" },
						{ label: "Permanent", value: "permanent" },
						{ label: "Skipped", value: "skipped" },
					],
				},
				{
					name: "redactedNote",
					type: "textarea",
				},
			],
		},
		{
			name: "diagnosticsPurgedAt",
			type: "date",
			index: true,
			admin: {
				description:
					"Set when leadRetentionCleanup purges/anonymizes linked delivery diagnostics with the lead.",
			},
		},
	],
};
