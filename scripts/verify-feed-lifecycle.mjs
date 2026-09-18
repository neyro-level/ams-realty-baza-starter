import assert from "node:assert/strict";
import {
	computeTransientRetryAt,
	decideFeedRunCompletion,
	decideStaleRunRecovery,
	isDeactivationApprovalValid,
	buildFeedSourceBaselinePatch,
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

assert.equal(
	decideFeedRunCompletion({
		...baseline,
		runInterrupted: true,
		plannedDeactivations: 20,
	}).canDeactivateMissing,
	false,
);
assert.equal(
	decideFeedRunCompletion({
		...baseline,
		runInterrupted: true,
		plannedDeactivations: 20,
	}).status,
	"interrupted",
);

const approved = decideFeedRunCompletion({
	...baseline,
	plannedDeactivations: 51,
	maxDeactivationsPerRun: 50,
	hasValidDeactivationApproval: true,
});
assert.equal(approved.status, "success");
assert.equal(approved.canDeactivateMissing, true);
assert.equal(approved.reason, "approved_deactivation");

assert.equal(
	isDeactivationApprovalValid({
		importRunId: "7",
		nowIso,
		approval: {
			runId: "8",
			expiresAt: "2026-09-16T16:00:00.000Z",
		},
	}),
	false,
);
assert.equal(
	isDeactivationApprovalValid({
		importRunId: "7",
		nowIso,
		approval: {
			runId: "7",
			expiresAt: "2026-09-16T11:00:00.000Z",
		},
	}),
	false,
);
assert.equal(
	isDeactivationApprovalValid({
		importRunId: "7",
		nowIso,
		approval: {
			runId: "7",
			expiresAt: "2026-09-16T16:00:00.000Z",
			consumedAt: nowIso,
		},
	}),
	false,
);
assert.equal(
	isDeactivationApprovalValid({
		importRunId: "7",
		nowIso,
		approval: {
			runId: "7",
			expiresAt: "2026-09-16T16:00:00.000Z",
		},
	}),
	true,
);

assert.deepEqual(
	buildFeedSourceBaselinePatch({
		status: "unchanged",
		parserCompleted: true,
		criticalStructuralError: false,
		nowIso,
		etag: '"next"',
		feedHash: "hash-next",
		offeredCount: 100,
	}),
	{
		lastSuccessfulRunAt: nowIso,
		lastEtag: '"next"',
	},
);
assert.deepEqual(
	buildFeedSourceBaselinePatch({
		status: "suspicious",
		parserCompleted: true,
		criticalStructuralError: false,
		nowIso,
		etag: '"next"',
		feedHash: "hash-next",
		offeredCount: 60,
	}),
	{},
);
assert.deepEqual(
	buildFeedSourceBaselinePatch({
		status: "success",
		parserCompleted: true,
		criticalStructuralError: false,
		nowIso,
		etag: '"next"',
		lastModified: "Wed, 16 Sep 2026 12:00:00 GMT",
		feedHash: "hash-next",
		offeredCount: 100,
	}),
	{
		lastSuccessfulRunAt: nowIso,
		lastEtag: '"next"',
		lastModified: "Wed, 16 Sep 2026 12:00:00 GMT",
		lastFullRunAt: nowIso,
		lastOfferCount: 100,
		lastFeedHash: "hash-next",
	},
);

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
