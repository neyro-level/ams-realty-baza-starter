import assert from "node:assert/strict";
import { buildOperationalAlerts } from "../src/core/operations/alerts.ts";

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
assert.ok(alerts.some((alert) => alert.component === "storage"));

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

console.log("verify-health-alerts: ok");
