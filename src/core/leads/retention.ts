export type LeadRetentionDecision =
	| {
			destructive: false;
			reason: "missing_policy";
			alert: {
				code: "retention_policy_missing";
				severity: "warning";
				component: "retention";
				message: "Lead retention days are unset; destructive cleanup is skipped.";
			};
	  }
	| {
			destructive: true;
			leadRetentionDays: number;
	  };

export function planLeadRetentionRun(leadRetentionDays: number | null): LeadRetentionDecision {
	if (leadRetentionDays === null || !Number.isInteger(leadRetentionDays) || leadRetentionDays < 1) {
		return {
			destructive: false,
			reason: "missing_policy",
			alert: {
				code: "retention_policy_missing",
				severity: "warning",
				component: "retention",
				message: "Lead retention days are unset; destructive cleanup is skipped.",
			},
		};
	}

	return { destructive: true, leadRetentionDays };
}

export function anonymizeLeadFields(purgedAt: string) {
	return {
		name: "Anonymized lead",
		phoneRaw: null,
		phoneE164: "+00000000000",
		email: null,
		message: null,
		fraudFingerprint: null,
		piiPurgedAt: purgedAt,
	};
}
