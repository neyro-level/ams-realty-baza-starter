export type LeadDeliveryStatus =
	| "pending"
	| "sending"
	| "delivered"
	| "failed"
	| "abandoned";
export type LeadDeliveryErrorKind = "retryable" | "permanent";
export type LeadDeliveryAttemptOutcome =
	| "delivered"
	| "retryable"
	| "permanent"
	| "skipped";

export type LeadDeliveryStateRecord = {
	id: string;
	lead: string;
	channelId: string;
	status: LeadDeliveryStatus;
	attempts: number;
	nextAttemptAt?: string;
	jobId?: string;
	claimedAt?: string;
	heartbeatAt?: string;
	deliveredAt?: string;
	lastErrorKind?: LeadDeliveryErrorKind;
	lastErrorRedacted?: string;
	abandonedReason?: "exhausted" | "permanent" | "manual";
	attemptLog?: LeadDeliveryAttemptLog[];
};

export type LeadDeliveryAttemptLog = {
	attemptedAt: string;
	safeCode?: string;
	outcome: LeadDeliveryAttemptOutcome;
	redactedNote?: string;
};

export type LeadDeliveryResult =
	| { kind: "delivered"; safeCode?: string; redactedNote?: string }
	| {
			kind: "retryable";
			safeCode: string;
			redactedNote: string;
			backoffMs?: number;
	  }
	| {
			kind: "unknown";
			safeCode: string;
			redactedNote: string;
			backoffMs?: number;
	  }
	| { kind: "permanent"; safeCode: string; redactedNote: string }
	| { kind: "missing_adapter"; channelId: string };

export const leadDeliveryRetryLadderMinutes = [0, 1, 5, 15, 60, 240] as const;
export const leadDeliveryMaxAttempts = leadDeliveryRetryLadderMinutes.length;
const unknownRetryBackoffMs = 60 * 60 * 1000;
const staleSendingThresholdMs = 15 * 60 * 1000;
const maxAttemptLogEntries = 20;

export function claimLeadDeliveryForSending(
	delivery: LeadDeliveryStateRecord,
	nowIso: string,
): LeadDeliveryStateRecord | undefined {
	if (delivery.status !== "pending") {
		return undefined;
	}
	if (
		delivery.nextAttemptAt &&
		new Date(delivery.nextAttemptAt) > new Date(nowIso)
	) {
		return undefined;
	}

	return {
		...delivery,
		status: "sending",
		attempts: delivery.attempts + 1,
		claimedAt: nowIso,
		heartbeatAt: nowIso,
	};
}

export function completeLeadDeliveryAttempt({
	delivery,
	result,
	nowIso,
}: {
	delivery: LeadDeliveryStateRecord;
	result: LeadDeliveryResult;
	nowIso: string;
}): LeadDeliveryStateRecord {
	if (result.kind === "delivered") {
		return {
			...clearActiveClaim(delivery),
			status: "delivered",
			deliveredAt: nowIso,
			lastErrorKind: undefined,
			lastErrorRedacted: undefined,
			attemptLog: appendAttemptLog(delivery.attemptLog, {
				attemptedAt: nowIso,
				safeCode: result.safeCode,
				outcome: "delivered",
				redactedNote: result.redactedNote,
			}),
		};
	}

	if (result.kind === "retryable" || result.kind === "unknown") {
		if (delivery.attempts >= leadDeliveryMaxAttempts) {
			return {
				...clearActiveClaim(delivery),
				status: "abandoned",
				abandonedReason: "exhausted",
				lastErrorKind: "retryable",
				lastErrorRedacted: result.redactedNote,
				attemptLog: appendAttemptLog(delivery.attemptLog, {
					attemptedAt: nowIso,
					safeCode: result.safeCode,
					outcome: "retryable",
					redactedNote: result.redactedNote,
				}),
			};
		}

		const backoffMs =
			result.backoffMs ??
			(result.kind === "unknown"
				? unknownRetryBackoffMs
				: retryBackoffMs(delivery.attempts));
		return {
			...clearActiveClaim(delivery),
			status: "pending",
			nextAttemptAt: new Date(
				new Date(nowIso).getTime() + backoffMs,
			).toISOString(),
			lastErrorKind: "retryable",
			lastErrorRedacted: result.redactedNote,
			attemptLog: appendAttemptLog(delivery.attemptLog, {
				attemptedAt: nowIso,
				safeCode: result.safeCode,
				outcome: "retryable",
				redactedNote: result.redactedNote,
			}),
		};
	}

	const safeCode =
		result.kind === "missing_adapter" ? "missing_adapter" : result.safeCode;
	const redactedNote =
		result.kind === "missing_adapter"
			? "Delivery adapter is not configured for this channel."
			: result.redactedNote;

	return {
		...clearActiveClaim(delivery),
		status: "failed",
		lastErrorKind: "permanent",
		lastErrorRedacted: redactedNote,
		attemptLog: appendAttemptLog(delivery.attemptLog, {
			attemptedAt: nowIso,
			safeCode,
			outcome: "permanent",
			redactedNote,
		}),
	};
}

export function retryBackoffMs(attempts: number): number {
	const index = Math.min(
		Math.max(attempts, 1),
		leadDeliveryRetryLadderMinutes.length - 1,
	);
	return leadDeliveryRetryLadderMinutes[index] * 60_000;
}

export function recoverStaleSendingDelivery(
	delivery: LeadDeliveryStateRecord,
	nowIso: string,
): LeadDeliveryStateRecord | undefined {
	if (delivery.status !== "sending" || !delivery.heartbeatAt) {
		return undefined;
	}

	const staleFor =
		new Date(nowIso).getTime() - new Date(delivery.heartbeatAt).getTime();
	if (staleFor <= staleSendingThresholdMs) {
		return undefined;
	}

	return {
		...clearActiveClaim(delivery),
		status: "pending",
		nextAttemptAt: nowIso,
		lastErrorKind: "retryable",
		lastErrorRedacted: "Recovered stale sending delivery.",
		attemptLog: appendAttemptLog(delivery.attemptLog, {
			attemptedAt: nowIso,
			safeCode: "stale_sending_recovered",
			outcome: "retryable",
			redactedNote: "Recovered stale sending delivery.",
		}),
	};
}

export function appendAttemptLog(
	current: LeadDeliveryAttemptLog[] | undefined,
	entry: LeadDeliveryAttemptLog,
): LeadDeliveryAttemptLog[] {
	return [...(current ?? []), entry].slice(-maxAttemptLogEntries);
}

function clearActiveClaim(
	delivery: LeadDeliveryStateRecord,
): LeadDeliveryStateRecord {
	return {
		...delivery,
		jobId: undefined,
		claimedAt: undefined,
		heartbeatAt: undefined,
	};
}
