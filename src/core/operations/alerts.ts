export type OperationalAlertSeverity = "info" | "warning" | "critical";
export type OperationalAlertComponent =
	| "feeds"
	| "jobs"
	| "delivery"
	| "storage"
	| "database";

export type OperationalAlert = {
	code: string;
	severity: OperationalAlertSeverity;
	component: OperationalAlertComponent;
	message: string;
	count?: number;
};

export type OperationalHealthSnapshot = {
	feeds: {
		overdueEnabled: number;
		suspiciousRuns: number;
		failedRuns: number;
		staleRunningRuns: number;
	};
	jobs: {
		autorunEnabled: boolean;
		staticTaskCount: number;
		programmaticTaskCount: number;
	};
	delivery: {
		duePending: number;
		staleSending: number;
		abandoned: number;
	};
	storage: {
		s3Configured: boolean;
	};
};

export function buildOperationalAlerts(
	snapshot: OperationalHealthSnapshot,
): OperationalAlert[] {
	const alerts: OperationalAlert[] = [];

	if (snapshot.feeds.overdueEnabled > 0) {
		alerts.push({
			code: "feeds_overdue",
			severity: "warning",
			component: "feeds",
			message: "Enabled feeds are overdue for dispatch.",
			count: snapshot.feeds.overdueEnabled,
		});
	}

	if (snapshot.feeds.suspiciousRuns > 0) {
		alerts.push({
			code: "feeds_suspicious_runs",
			severity: "critical",
			component: "feeds",
			message:
				"Suspicious import runs require owner approval before deactivation.",
			count: snapshot.feeds.suspiciousRuns,
		});
	}

	if (snapshot.feeds.failedRuns > 0 || snapshot.feeds.staleRunningRuns > 0) {
		alerts.push({
			code: "feeds_import_failures",
			severity: "warning",
			component: "feeds",
			message:
				"Import failures or stale running imports require operator review.",
			count: snapshot.feeds.failedRuns + snapshot.feeds.staleRunningRuns,
		});
	}

	if (!snapshot.jobs.autorunEnabled) {
		alerts.push({
			code: "jobs_autorun_disabled",
			severity: "warning",
			component: "jobs",
			message: "Jobs autorun is disabled on this runtime.",
		});
	}

	if (snapshot.delivery.duePending > 0) {
		alerts.push({
			code: "delivery_due_pending",
			severity: "warning",
			component: "delivery",
			message: "Lead deliveries are due and waiting for queue dispatch.",
			count: snapshot.delivery.duePending,
		});
	}

	if (snapshot.delivery.staleSending > 0) {
		alerts.push({
			code: "delivery_stale_sending",
			severity: "critical",
			component: "delivery",
			message: "Lead deliveries are stuck in sending state.",
			count: snapshot.delivery.staleSending,
		});
	}

	if (snapshot.delivery.abandoned > 0) {
		alerts.push({
			code: "delivery_abandoned",
			severity: "warning",
			component: "delivery",
			message: "Lead deliveries have been abandoned and need operator review.",
			count: snapshot.delivery.abandoned,
		});
	}

	if (!snapshot.storage.s3Configured) {
		alerts.push({
			code: "storage_s3_not_configured",
			severity: "info",
			component: "storage",
			message: "S3 storage is not configured for this runtime.",
		});
	}

	return alerts;
}
