import assert from "node:assert/strict";
import {
	appendAttemptLog,
	claimLeadDeliveryForSending,
	completeLeadDeliveryAttempt,
	recoverStaleSendingDelivery,
} from "../src/core/leads/index.ts";

const pending = {
	id: "delivery-1",
	lead: "lead-1",
	channelId: "max",
	status: "pending",
	attempts: 0,
	nextAttemptAt: "2026-09-16T12:00:00.000Z",
	jobId: "job-1",
};

const claimed = claimLeadDeliveryForSending(
	pending,
	"2026-09-16T12:00:00.000Z",
);
assert.equal(claimed.status, "sending");
assert.equal(claimed.attempts, 1);
assert.equal(claimed.heartbeatAt, "2026-09-16T12:00:00.000Z");

const retryable = completeLeadDeliveryAttempt({
	delivery: claimed,
	nowIso: "2026-09-16T12:01:00.000Z",
	result: {
		kind: "retryable",
		safeCode: "provider_timeout",
		redactedNote: "Provider timeout.",
	},
});
assert.equal(retryable.status, "pending");
assert.equal(retryable.lastErrorKind, "retryable");
assert.equal(retryable.nextAttemptAt, "2026-09-16T12:02:00.000Z");
assert.equal(retryable.jobId, undefined);

const permanent = completeLeadDeliveryAttempt({
	delivery: { ...claimed, id: "delivery-2" },
	nowIso: "2026-09-16T12:02:00.000Z",
	result: {
		kind: "permanent",
		safeCode: "invalid_destination",
		redactedNote: "Destination config is invalid.",
	},
});
assert.equal(permanent.status, "failed");
assert.equal(permanent.lastErrorKind, "permanent");
assert.equal(permanent.abandonedReason, undefined);

const missingAdapter = completeLeadDeliveryAttempt({
	delivery: { ...claimed, id: "delivery-3", channelId: "unknown" },
	nowIso: "2026-09-16T12:03:00.000Z",
	result: { kind: "missing_adapter", channelId: "unknown" },
});
assert.equal(missingAdapter.status, "failed");
assert.equal(missingAdapter.lastErrorKind, "permanent");

const delivered = completeLeadDeliveryAttempt({
	delivery: claimed,
	nowIso: "2026-09-16T12:04:00.000Z",
	result: { kind: "delivered", safeCode: "ok" },
});
assert.equal(delivered.status, "delivered");
assert.equal(delivered.deliveredAt, "2026-09-16T12:04:00.000Z");

const staleRecovered = recoverStaleSendingDelivery(
	{
		...claimed,
		heartbeatAt: "2026-09-16T11:40:00.000Z",
	},
	"2026-09-16T12:00:00.000Z",
);
assert.equal(staleRecovered.status, "pending");
assert.equal(staleRecovered.nextAttemptAt, "2026-09-16T12:00:00.000Z");

const boundedLog = appendAttemptLog(
	Array.from({ length: 25 }, (_item, index) => ({
		attemptedAt: `2026-09-16T12:${String(index).padStart(2, "0")}:00.000Z`,
		outcome: "retryable",
		safeCode: `code-${index}`,
	})),
	{
		attemptedAt: "2026-09-16T13:00:00.000Z",
		outcome: "delivered",
		safeCode: "ok",
	},
);
assert.equal(boundedLog.length, 20);
assert.equal(boundedLog[19].safeCode, "ok");

const exhausted = completeLeadDeliveryAttempt({
	delivery: { ...claimed, attempts: 6 },
	nowIso: "2026-09-16T12:05:00.000Z",
	result: {
		kind: "retryable",
		safeCode: "provider_timeout",
		redactedNote: "Provider timeout.",
	},
});
assert.equal(exhausted.status, "abandoned");
assert.equal(exhausted.abandonedReason, "exhausted");

const unknown = completeLeadDeliveryAttempt({
	delivery: claimed,
	nowIso: "2026-09-16T12:06:00.000Z",
	result: {
		kind: "unknown",
		safeCode: "timeout_after_send",
		redactedNote: "Provider timed out after the request was sent.",
	},
});
assert.equal(unknown.status, "pending");
assert.equal(unknown.nextAttemptAt, "2026-09-16T13:06:00.000Z");

console.log("verify-lead-delivery-state: ok");
