import type { PayloadRequest, TaskConfig } from "payload";
import { systemQueueJob } from "../../server/system-gateway/jobs.ts";
import { runtimeEnv } from "../env.ts";
import {
	payloadJobQueues,
	payloadJobRegistry,
	payloadJobTaskSlugs,
	type PayloadJobTaskSlug,
} from "./registry.ts";

type GenericPayloadJobTask = TaskConfig<{
	input: Record<string, unknown>;
	output: Record<string, unknown>;
}>;

const minuteInMs = 60_000;
const staleJobThresholdMs = 15 * minuteInMs;
const defaultArchiveRetentionDays = 30;

function nowIso() {
	return new Date().toISOString();
}

function addMinutes(date: Date, minutes: number) {
	return new Date(date.getTime() + minutes * minuteInMs);
}

export function computeNextDueAt({
	now,
	previousNextDueAt,
	refreshIntervalMinutes,
}: {
	now: Date;
	previousNextDueAt?: null | string;
	refreshIntervalMinutes: number;
}) {
	const nextFromNow = addMinutes(now, refreshIntervalMinutes);
	const previous = previousNextDueAt ? new Date(previousNextDueAt) : undefined;
	const nextFromPrevious = previous ? addMinutes(previous, refreshIntervalMinutes) : undefined;

	if (nextFromPrevious && nextFromPrevious > nextFromNow) {
		return nextFromPrevious.toISOString();
	}

	return nextFromNow.toISOString();
}

function getStaticSchedule(slug: PayloadJobTaskSlug) {
	const task = payloadJobRegistry.find((entry) => entry.slug === slug);

	if (task?.trigger !== "static" || !task.cron) {
		throw new Error(`Task "${slug}" is not a static scheduled task.`);
	}

	return [{ cron: task.cron, queue: task.queue }];
}

async function queueTask({
	req,
	task,
	queue,
	input,
}: {
	req: PayloadRequest;
	task: PayloadJobTaskSlug;
	queue: string;
	input: Record<string, unknown>;
}) {
	return systemQueueJob({
		req,
		task: task as never,
		queue,
		input: input as never,
	});
}

export const payloadJobTasks: GenericPayloadJobTask[] = [
	{
		slug: payloadJobTaskSlugs.dispatchDueFeeds,
		label: "Dispatch due feeds",
		schedule: getStaticSchedule(payloadJobTaskSlugs.dispatchDueFeeds),
		handler: async ({ req }) => {
			const now = new Date();
			const nowValue = now.toISOString();
			const dueFeeds = await req.payload.find({
				collection: "feed-sources",
				where: {
					and: [
						{ enabled: { equals: true } },
						{ nextDueAt: { less_than_equal: nowValue } },
					],
				},
				sort: "nextDueAt",
				limit: 1,
				depth: 0,
				req,
			});
			const feed = dueFeeds.docs[0];

			if (!feed) {
				return { output: { dispatched: false } };
			}

			const nextDueAt = computeNextDueAt({
				now,
				previousNextDueAt: feed.nextDueAt,
				refreshIntervalMinutes: feed.refreshIntervalMinutes,
			});

			await req.payload.update({
				collection: "feed-sources",
				id: feed.id,
				data: {
					lastAttemptAt: nowValue,
					nextDueAt,
				},
				req,
			});

			const importRun = await req.payload.create({
				collection: "import-runs",
				data: {
					feedSource: feed.id,
					status: "queued",
					queuedAt: nowValue,
					heartbeatAt: nowValue,
				},
				req,
			});

			const queuedJob = (await queueTask({
				req,
				task: payloadJobTaskSlugs.importFeed,
				queue: payloadJobQueues.imports,
				input: {
					feedSourceId: String(feed.id),
					importRunId: String(importRun.id),
				},
			})) as { id: number | string };

			await req.payload.update({
				collection: "import-runs",
				id: importRun.id,
				data: {
					jobId: String(queuedJob.id),
				},
				req,
			});

			return {
				output: {
					dispatched: true,
					feedSourceId: String(feed.id),
					importRunId: String(importRun.id),
					nextDueAt,
				},
			};
		},
	},
	{
		slug: payloadJobTaskSlugs.importFeed,
		label: "Import feed",
		retries: 0,
		inputSchema: [
			{ name: "feedSourceId", type: "text", required: true },
			{ name: "importRunId", type: "text", required: true },
		],
		concurrency: {
			key: ({ input }) => `import:feed:${input.feedSourceId}`,
			exclusive: true,
			supersedes: false,
		},
		handler: async () => ({
			output: { registered: true, implementedBy: "feed-import-engine" },
		}),
	},
	{
		slug: payloadJobTaskSlugs.jobsJanitor,
		label: "Jobs janitor",
		schedule: getStaticSchedule(payloadJobTaskSlugs.jobsJanitor),
		handler: async ({ req }) => {
			const threshold = new Date(Date.now() - staleJobThresholdMs).toISOString();
			const staleRuns = await req.payload.find({
				collection: "import-runs",
				where: {
					or: [
						{
							and: [
								{ status: { equals: "running" } },
								{ heartbeatAt: { less_than: threshold } },
							],
						},
						{
							and: [
								{ status: { equals: "queued" } },
								{ queuedAt: { less_than: threshold } },
								{ jobId: { exists: false } },
							],
						},
					],
				},
				limit: 20,
				depth: 0,
				req,
			});

			for (const run of staleRuns.docs) {
				await req.payload.update({
					collection: "import-runs",
					id: run.id,
					data: {
						status: "interrupted",
						finishedAt: nowIso(),
						lastErrorRedacted: "Recovered by jobsJanitor: stale or orphan import run.",
					},
					req,
				});
			}

			return { output: { interruptedRuns: staleRuns.docs.length } };
		},
	},
	{
		slug: payloadJobTaskSlugs.leadRetentionCleanup,
		label: "Lead retention cleanup",
		schedule: getStaticSchedule(payloadJobTaskSlugs.leadRetentionCleanup),
		handler: async ({ req }) => {
			const expiredLeads = await req.payload.find({
				collection: "leads",
				where: {
					and: [
						{ retentionUntil: { less_than_equal: nowIso() } },
						{ piiPurgedAt: { exists: false } },
					],
				},
				limit: 20,
				depth: 0,
				req,
			});
			const purgedAt = nowIso();

			for (const lead of expiredLeads.docs) {
				await req.payload.update({
					collection: "leads",
					id: lead.id,
					data: {
						name: "Anonymized lead",
						phoneRaw: null,
						phoneE164: "+00000000000",
						email: null,
						message: null,
						fraudFingerprint: null,
						piiPurgedAt: purgedAt,
					},
					req,
				});
				const deliveries = await req.payload.find({
					collection: "lead-deliveries",
					where: { lead: { equals: lead.id } },
					limit: 50,
					depth: 0,
					req,
				});

				for (const delivery of deliveries.docs) {
					await req.payload.update({
						collection: "lead-deliveries",
						id: delivery.id,
						data: {
							attemptLog: [],
							lastErrorRedacted: null,
							diagnosticsPurgedAt: purgedAt,
						},
						req,
					});
				}
			}

			return { output: { purgedLeads: expiredLeads.docs.length } };
		},
	},
	{
		slug: payloadJobTaskSlugs.catalogLifecycle,
		label: "Catalog lifecycle",
		schedule: getStaticSchedule(payloadJobTaskSlugs.catalogLifecycle),
		handler: async ({ req }) => {
			const retentionDays =
				runtimeEnv.ARCHIVE_RETENTION_DAYS ?? defaultArchiveRetentionDays;
			const threshold = new Date(
				Date.now() - retentionDays * 24 * 60 * minuteInMs,
			).toISOString();
			const archivedProperties = await req.payload.find({
				collection: "properties",
				where: {
					and: [
						{ status: { equals: "archived" } },
						{ contentPurgedAt: { exists: false } },
						{ deactivatedAt: { less_than_equal: threshold } },
					],
				},
				limit: 20,
				depth: 0,
				req,
			});
			const purgedAt = nowIso();

			for (const property of archivedProperties.docs) {
				await req.payload.update({
					collection: "properties",
					id: property.id,
					data: {
						description: null,
						images: [],
						contentPurgedAt: purgedAt,
					},
					req,
				});
			}

			return { output: { purgedProperties: archivedProperties.docs.length } };
		},
	},
	{
		slug: payloadJobTaskSlugs.recoverLeadDeliveries,
		label: "Recover lead deliveries",
		schedule: getStaticSchedule(payloadJobTaskSlugs.recoverLeadDeliveries),
		handler: async ({ req }) => {
			const staleThreshold = new Date(Date.now() - staleJobThresholdMs).toISOString();
			const staleSending = await req.payload.find({
				collection: "lead-deliveries",
				where: {
					and: [
						{ status: { equals: "sending" } },
						{ heartbeatAt: { less_than: staleThreshold } },
					],
				},
				limit: 20,
				depth: 0,
				req,
			});

			for (const delivery of staleSending.docs) {
				await req.payload.update({
					collection: "lead-deliveries",
					id: delivery.id,
					data: {
						status: "pending",
						nextAttemptAt: nowIso(),
						heartbeatAt: null,
						lastErrorKind: "retryable",
						lastErrorRedacted:
							"Recovered by recoverLeadDeliveries: stale sending delivery.",
					},
					req,
				});
			}

			const duePending = await req.payload.find({
				collection: "lead-deliveries",
				where: {
					and: [
						{ status: { equals: "pending" } },
						{ nextAttemptAt: { less_than_equal: nowIso() } },
						{ jobId: { exists: false } },
					],
				},
				limit: 20,
				depth: 0,
				req,
			});

			for (const delivery of duePending.docs) {
				const queuedJob = (await queueTask({
					req,
					task: payloadJobTaskSlugs.deliverLead,
					queue: payloadJobQueues.leadDeliveries,
					input: { leadDeliveryId: String(delivery.id) },
				})) as { id: number | string };

				await req.payload.update({
					collection: "lead-deliveries",
					id: delivery.id,
					data: {
						jobId: String(queuedJob.id),
					},
					req,
				});
			}

			return {
				output: {
					recoveredSending: staleSending.docs.length,
					queuedPending: duePending.docs.length,
				},
			};
		},
	},
	{
		slug: payloadJobTaskSlugs.deliverLead,
		label: "Deliver lead",
		inputSchema: [{ name: "leadDeliveryId", type: "text", required: true }],
		concurrency: {
			key: ({ input }) => `lead-delivery:${input.leadDeliveryId}`,
			exclusive: true,
			supersedes: false,
		},
		handler: async () => ({
			output: { registered: true, implementedBy: "lead-delivery-adapter" },
		}),
	},
];
