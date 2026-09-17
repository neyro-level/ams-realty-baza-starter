import { getPayload } from "payload";
import configPromise from "../../../../../payload.config.ts";
import { buildOperationalAlerts } from "../../../../core/operations/alerts.ts";
import { isLocalMediaReady } from "../../../../core/storage/local-fs.ts";
import { runtimeEnv } from "../../../../payload/env.ts";
import {
	programmaticPayloadJobTasks,
	staticPayloadJobTasks,
} from "../../../../payload/jobs/registry.ts";
import { redactRecord } from "../../../../server/security/redaction.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const minuteInMs = 60_000;
const staleThresholdMs = 15 * minuteInMs;

function nowIso() {
	return new Date().toISOString();
}

function hasValidSecret(request: Request): boolean {
	const expected =
		process.env.INTERNAL_HEALTH_SECRET ?? process.env.REVALIDATE_SECRET;
	const actual = request.headers.get("x-ams-health-secret");
	return Boolean(expected && actual && actual === expected);
}

function json(body: unknown, init?: ResponseInit) {
	return Response.json(body, {
		...init,
		headers: {
			"cache-control": "no-store",
			...(init?.headers ?? {}),
		},
	});
}

export async function GET(request: Request) {
	if (!hasValidSecret(request)) {
		return json({ error: "not_found" }, { status: 404 });
	}

	const checkedAt = nowIso();
	const components = {
		app: { status: "ok" as const },
		database: { status: "unknown" as "ok" | "down" | "unknown" },
		storage: {
			status: isLocalMediaReady() ? ("ok" as const) : ("down" as const),
		},
		jobs: {
			status: "ok" as const,
			autorunEnabled: runtimeEnv.JOBS_AUTORUN,
			staticTaskCount: staticPayloadJobTasks.length,
			programmaticTaskCount: programmaticPayloadJobTasks.length,
		},
	};

	try {
		const payload = await getPayload({ config: configPromise });
		const staleThreshold = new Date(
			Date.now() - staleThresholdMs,
		).toISOString();
		const [
			overdueFeeds,
			suspiciousRuns,
			failedRuns,
			staleRunningRuns,
			duePendingDeliveries,
			staleSendingDeliveries,
			abandonedDeliveries,
		] = await Promise.all([
			payload.count({
				collection: "feed-sources",
				where: {
					and: [
						{ enabled: { equals: true } },
						{ nextDueAt: { less_than_equal: checkedAt } },
					],
				},
			}),
			payload.count({
				collection: "import-runs",
				where: { status: { equals: "suspicious" } },
			}),
			payload.count({
				collection: "import-runs",
				where: { status: { equals: "failed" } },
			}),
			payload.count({
				collection: "import-runs",
				where: {
					and: [
						{ status: { equals: "running" } },
						{ heartbeatAt: { less_than: staleThreshold } },
					],
				},
			}),
			payload.count({
				collection: "lead-deliveries",
				where: {
					and: [
						{ status: { equals: "pending" } },
						{ nextAttemptAt: { less_than_equal: checkedAt } },
						{ jobId: { exists: false } },
					],
				},
			}),
			payload.count({
				collection: "lead-deliveries",
				where: {
					and: [
						{ status: { equals: "sending" } },
						{ heartbeatAt: { less_than: staleThreshold } },
					],
				},
			}),
			payload.count({
				collection: "lead-deliveries",
				where: { status: { equals: "abandoned" } },
			}),
		]);

		components.database.status = "ok";
		const alerts = buildOperationalAlerts({
			feeds: {
				overdueEnabled: overdueFeeds.totalDocs,
				suspiciousRuns: suspiciousRuns.totalDocs,
				failedRuns: failedRuns.totalDocs,
				staleRunningRuns: staleRunningRuns.totalDocs,
			},
			jobs: {
				autorunEnabled: runtimeEnv.JOBS_AUTORUN,
				staticTaskCount: staticPayloadJobTasks.length,
				programmaticTaskCount: programmaticPayloadJobTasks.length,
			},
			delivery: {
				duePending: duePendingDeliveries.totalDocs,
				staleSending: staleSendingDeliveries.totalDocs,
				abandoned: abandonedDeliveries.totalDocs,
			},
			storage: {
				localMediaReady: isLocalMediaReady(),
			},
		});
		const status = alerts.some((alert) => alert.severity === "critical")
			? "degraded"
			: "ok";

		return json({ status, checkedAt, components, alerts });
	} catch (error) {
		components.database.status = "down";
		console.warn(
			"healthz dependency failure",
			redactRecord({
				component: "database",
				error: error instanceof Error ? error.message : "unknown",
			}),
		);
		return json(
			{
				status: "down",
				checkedAt,
				components,
				alerts: [
					{
						code: "database_unavailable",
						severity: "critical",
						component: "database",
						message: "Payload database dependency is unavailable.",
					},
				],
			},
			{ status: 503 },
		);
	}
}
