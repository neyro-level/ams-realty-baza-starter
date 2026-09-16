import type { CollectionConfig, FieldAccess } from "payload";
import { adminsAndOwners, hasRole, ownersOnly } from "../access/roles.ts";

const piiFieldAccess: {
	read: FieldAccess;
	create: FieldAccess;
	update: FieldAccess;
} = {
	read: ({ req }) => hasRole(req.user, ["owner", "admin"]),
	create: ({ req }) => hasRole(req.user, ["owner", "admin"]),
	update: ({ req }) => hasRole(req.user, ["owner", "admin"]),
};

export const Leads: CollectionConfig = {
	slug: "leads",
	versions: false,
	admin: {
		group: "Operations",
		useAsTitle: "name",
		defaultColumns: ["name", "phoneE164", "status", "formKind", "createdAt"],
		description:
			"Owner operations: agency workflow status and PII retention. External delivery state lives in Lead Deliveries.",
	},
	access: {
		create: adminsAndOwners,
		read: adminsAndOwners,
		update: adminsAndOwners,
		delete: ownersOnly,
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
			access: piiFieldAccess,
		},
		{
			name: "phoneRaw",
			type: "text",
			access: piiFieldAccess,
			admin: {
				description:
					"Optional operator/audit value. Canonical integration and dedup identity is phoneE164.",
			},
		},
		{
			name: "phoneE164",
			type: "text",
			required: true,
			index: true,
			access: piiFieldAccess,
			admin: {
				description:
					"Strictly normalized E.164 phone. Invalid phone must not create a lead.",
			},
		},
		{
			name: "email",
			type: "email",
			access: piiFieldAccess,
		},
		{
			name: "message",
			type: "textarea",
			access: piiFieldAccess,
		},
		{
			name: "formKind",
			type: "select",
			required: true,
			index: true,
			options: [
				{ label: "Property request", value: "property_request" },
				{ label: "Callback", value: "callback" },
				{ label: "Consultation", value: "consultation" },
				{ label: "Generic", value: "generic" },
			],
		},
		{
			name: "sourcePage",
			type: "text",
			required: true,
			index: true,
		},
		{
			name: "referrer",
			type: "text",
		},
		{
			name: "property",
			type: "relationship",
			relationTo: "properties",
			index: true,
		},
		{
			name: "utm",
			type: "group",
			fields: [
				{ name: "source", type: "text" },
				{ name: "medium", type: "text" },
				{ name: "campaign", type: "text" },
				{ name: "content", type: "text" },
				{ name: "term", type: "text" },
			],
		},
		{
			name: "consent",
			type: "group",
			admin: {
				description:
					"Immutable intake evidence for personal data processing consent.",
			},
			fields: [
				{
					name: "accepted",
					type: "checkbox",
					required: true,
					defaultValue: false,
				},
				{
					name: "version",
					type: "text",
					required: true,
					index: true,
				},
				{
					name: "consentedAt",
					type: "date",
					required: true,
				},
			],
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "new",
			index: true,
			admin: {
				description:
					"Agency workflow status only. External delivery state lives in lead-deliveries.",
			},
			options: [
				{ label: "New", value: "new" },
				{ label: "In progress", value: "in_progress" },
				{ label: "Processed", value: "processed" },
				{ label: "Rejected", value: "rejected" },
			],
		},
		{
			name: "idempotencyKey",
			type: "text",
			required: true,
			unique: true,
			index: true,
		},
		{
			name: "retentionMode",
			type: "select",
			required: true,
			defaultValue: "delete",
			options: [
				{ label: "Delete", value: "delete" },
				{ label: "Anonymize", value: "anonymize" },
			],
		},
		{
			name: "retentionUntil",
			type: "date",
			index: true,
			admin: {
				description:
					"Optional per-row retention boundary. Project default leadRetentionDays remains canonical unless set.",
			},
		},
		{
			name: "piiPurgedAt",
			type: "date",
			index: true,
			admin: {
				description:
					"Set when leadRetentionCleanup deleted/anonymized PII for this lead.",
			},
		},
		{
			name: "fraudFingerprint",
			type: "text",
			access: piiFieldAccess,
			admin: {
				description:
					"Optional irreversible keyed/HMAC marker. Raw IP/User-Agent are intentionally not stored.",
			},
		},
	],
};
