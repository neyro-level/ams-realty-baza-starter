import assert from "node:assert/strict";
import {
	computeTransientRetryAt,
	decideFeedRunCompletion,
	decideStaleRunRecovery,
} from "../src/core/ingest/index.ts";

const nowIso = "2026-09-16T12:00:00.000Z";
const baseline = {
	nowIso,
	sourceEnabled: true,
	parserCompleted: true,
	criticalStructuralError: false,
	identityValid: true,
	runInterrupted: false,
	isFirstFullRun: false,
	offeredCount: 100,
	previousOfferCount: 100,
	safetyThresholdPercent: 30,
	plannedDeactivations: 5,
	maxDeactivationsPerRun: 50,
	fetchStatus: "fetched",
	feedHash: "hash-next",
	lastFeedHash: "hash-prev",
};

assert.deepEqual(
	decideFeedRunCompletion({ ...baseline, fetchStatus: "unchanged" }),
	{
		status: "unchanged",
		canDeactivateMissing: false,
		createBaseline: false,
		reason: "not_modified",
	},
);

assert.deepEqual(
	decideFeedRunCompletion({
		...baseline,
		feedHash: "same",
		lastFeedHash: "same",
	}),
	{
		status: "unchanged",
		canDeactivateMissing: false,
		createBaseline: false,
		reason: "same_hash",
	},
);

assert.equal(
	decideFeedRunCompletion({
		...baseline,
		parserCompleted: false,
		offeredCount: 0,
	}).canDeactivateMissing,
	false,
);
assert.equal(
	decideFeedRunCompletion({
		...baseline,
		parserCompleted: false,
		offeredCount: 0,
	}).retryAt,
	"2026-09-16T12:15:00.000Z",
);

const suspiciousByCount = decideFeedRunCompletion({
	...baseline,
	offeredCount: 60,
	previousOfferCount: 100,
	safetyThresholdPercent: 30,
});
assert.equal(suspiciousByCount.status, "suspicious");
assert.equal(suspiciousByCount.canDeactivateMissing, false);

const suspiciousByDeactivations = decideFeedRunCompletion({
	...baseline,
	plannedDeactivations: 51,
	maxDeactivationsPerRun: 50,
});
assert.equal(suspiciousByDeactivations.status, "suspicious");
assert.equal(suspiciousByDeactivations.canDeactivateMissing, false);

const firstFullRun = decideFeedRunCompletion({
	...baseline,
	isFirstFullRun: true,
});
assert.equal(firstFullRun.status, "success");
assert.equal(firstFullRun.createBaseline, true);
assert.equal(firstFullRun.canDeactivateMissing, false);

const safeRun = decideFeedRunCompletion(baseline);
assert.equal(safeRun.status, "success");
assert.equal(safeRun.canDeactivateMissing, true);

assert.deepEqual(
	decideStaleRunRecovery({
		status: "running",
		heartbeatAt: "2026-09-16T11:40:00.000Z",
		nowIso,
	}),
	{ stale: true, nextStatus: "interrupted", reason: "heartbeat_stale" },
);
assert.deepEqual(
	decideStaleRunRecovery({
		status: "queued",
		queuedAt: "2026-09-16T11:40:00.000Z",
		nowIso,
	}),
	{ stale: true, nextStatus: "interrupted", reason: "queued_without_job" },
);
assert.equal(computeTransientRetryAt(nowIso), "2026-09-16T12:15:00.000Z");

console.log("verify-feed-lifecycle: ok");
