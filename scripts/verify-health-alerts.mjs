import assert from "node:assert/strict";
import { buildOperationalAlerts } from "../src/core/operations/alerts.ts";
import { planLeadRetentionRun } from "../src/core/leads/index.ts";

const alerts = buildOperationalAlerts({
	feeds: {
		overdueEnabled: 2,
		suspiciousRuns: 1,
		failedRuns: 1,
		staleRunningRuns: 1,
	},
	jobs: {
		autorunEnabled: false,
		staticTaskCount: 4,
		programmaticTaskCount: 2,
	},
	delivery: {
		duePending: 3,
		staleSending: 1,
		abandoned: 1,
	},
	storage: {
		localMediaReady: false,
	},
});

assert.ok(alerts.some((alert) => alert.code === "feeds_suspicious_runs"));
assert.ok(alerts.some((alert) => alert.code === "delivery_stale_sending"));
assert.ok(alerts.some((alert) => alert.code === "storage_media_dir_unavailable"));

const cacheAlerts = buildOperationalAlerts({
	feeds: {
		overdueEnabled: 0,
		suspiciousRuns: 0,
		failedRuns: 0,
		staleRunningRuns: 0,
	},
	jobs: {
		autorunEnabled: true,
		staticTaskCount: 4,
		programmaticTaskCount: 2,
	},
	delivery: {
		duePending: 0,
		staleSending: 0,
		abandoned: 0,
	},
	storage: {
		localMediaReady: true,
	},
	cache: {
		invalidationStaleBeyondSla: true,
	},
});
assert.ok(cacheAlerts.some((alert) => alert.code === "cache_invalidation_failure"));

const serialized = JSON.stringify(alerts).toLowerCase();
for (const forbidden of [
	"token",
	"secret",
	"password",
	"phone",
	"email",
	"payload",
	"database_uri",
	"feedurl",
]) {
	assert.equal(
		serialized.includes(forbidden),
		false,
		`health alerts leaked forbidden diagnostic term: ${forbidden}`,
	);
}

assert.deepEqual(
	buildOperationalAlerts({
		feeds: {
			overdueEnabled: 0,
			suspiciousRuns: 0,
			failedRuns: 0,
			staleRunningRuns: 0,
		},
		jobs: {
			autorunEnabled: true,
			staticTaskCount: 4,
			programmaticTaskCount: 2,
		},
		delivery: {
			duePending: 0,
			staleSending: 0,
			abandoned: 0,
		},
		storage: {
			localMediaReady: true,
		},
	}),
	[],
);

assert.equal(planLeadRetentionRun(null).destructive, false);
assert.equal(planLeadRetentionRun(90).destructive, true);
assert.ok(
	buildOperationalAlerts({
		feeds: {
			overdueEnabled: 0,
			suspiciousRuns: 0,
			failedRuns: 0,
			staleRunningRuns: 0,
		},
		jobs: {
			autorunEnabled: true,
			staticTaskCount: 4,
			programmaticTaskCount: 2,
		},
		delivery: {
			duePending: 0,
			staleSending: 0,
			abandoned: 0,
		},
		storage: {
			localMediaReady: true,
		},
		retention: { leadPolicyConfigured: false },
	}).some((alert) => alert.code === "retention_policy_missing"),
);

const healthyBase = {
	feeds: {
		overdueEnabled: 0,
		suspiciousRuns: 0,
		failedRuns: 0,
		staleRunningRuns: 0,
	},
	jobs: {
		autorunEnabled: true,
		staticTaskCount: 4,
		programmaticTaskCount: 2,
	},
	delivery: {
		duePending: 0,
		staleSending: 0,
		abandoned: 0,
	},
	storage: {
		localMediaReady: true,
	},
};

assert.ok(
	buildOperationalAlerts({
		...healthyBase,
		backup: { dbFailed: true, mediaFailed: true },
	}).some((alert) => alert.code === "backup_db_failure"),
);
assert.ok(
	buildOperationalAlerts({
		...healthyBase,
		backup: { dbFailed: true, mediaFailed: true },
	}).some((alert) => alert.code === "backup_media_failure"),
);

const { evaluateBackupFailures } = await import(
	"../src/core/operations/backup-health.ts"
);
assert.deepEqual(
	evaluateBackupFailures({
		statusKnown: true,
		nowIso: "2026-09-18T12:00:00.000Z",
		db: {
			lastSuccessAt: "2026-09-18T11:00:00.000Z",
			integrityOk: true,
			offsiteCopyPresent: true,
		},
		media: {
			lastSuccessAt: "2026-09-18T11:00:00.000Z",
			integrityOk: true,
			offsiteCopyPresent: true,
		},
	}),
	{ dbBackupFailed: false, mediaBackupFailed: false },
);
assert.equal(
	evaluateBackupFailures({
		statusKnown: true,
		nowIso: "2026-09-18T12:00:00.000Z",
		media: {
			lastSuccessAt: "2026-09-18T11:00:00.000Z",
			integrityOk: false,
			offsiteCopyPresent: true,
		},
	}).mediaBackupFailed,
	true,
);

const { isCacheInvalidationStaleBeyondSla, recordCacheInvalidationOutcome, resetCacheInvalidationSlaState } =
	await import("../src/core/cache/invalidation-sla.ts");
resetCacheInvalidationSlaState();
recordCacheInvalidationOutcome(false, "2026-09-18T11:00:00.000Z");
assert.equal(
	isCacheInvalidationStaleBeyondSla(30, "2026-09-18T11:40:00.000Z"),
	true,
);

const {
	evaluateRuntimeEnv,
	importStaleThresholdMs,
	queuedImportOrphanThresholdMs,
	pendingDeliveryOrphanThresholdMs,
	isAlertChannelIndependent,
} = await import("../src/core/operations/index.ts");

assert.equal(
	evaluateRuntimeEnv({ NEXT_PHASE: "phase-production-build" }, "build").ok,
	true,
);
assert.deepEqual(
	evaluateRuntimeEnv({}, "migrate").missing,
	["DATABASE_URI", "PAYLOAD_SECRET"],
);
assert.ok(
	evaluateRuntimeEnv(
		{ NODE_ENV: "production", AMS_PROFILE: "REALTY_BASE" },
		"runtime",
	).missing.includes("MEDIA_DIR"),
);
assert.equal(importStaleThresholdMs(5 * 60_000), 15 * 60_000);
assert.equal(importStaleThresholdMs(10 * 60_000), 30 * 60_000);
assert.equal(queuedImportOrphanThresholdMs(5), 15 * 60_000);
assert.equal(pendingDeliveryOrphanThresholdMs(15), 30 * 60_000);
assert.equal(
	isAlertChannelIndependent({
		alertWebhookUrl: "https://alerts.example.test/hook",
		leadChannelUrls: ["https://hooks.example.test/leads"],
	}),
	true,
);
assert.equal(
	isAlertChannelIndependent({
		alertWebhookUrl: "https://hooks.example.test/alerts",
		leadChannelUrls: ["https://hooks.example.test/leads"],
	}),
	false,
);

console.log("verify-health-alerts: ok");
