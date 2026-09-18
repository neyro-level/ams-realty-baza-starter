import type { PayloadRequest, TaskConfig } from "payload";
import {
	claimDueFeedSources,
	claimQueuedImportRun,
	consumeDeactivationApproval,
	finishImportRun,
	touchImportRunHeartbeat,
} from "../../core/data-access/ingest/sql/index.ts";
import { runDeliverLeadTask } from "../../core/leads/deliver-lead.ts";
import { isLiveFuturePayloadJob } from "../../core/leads/job-liveness.ts";
import {
	anonymizeLeadFields,
	planLeadRetentionRun,
} from "../../core/leads/retention.ts";
import { inspectPayloadJob } from "../../core/data-access/system/jobs/index.ts";
import { postBatchedHttpRevalidate } from "../../core/cache/http-revalidate.ts";
import {
	importStaleThresholdMs,
	observedSuccessfulDurationMs,
	pendingDeliveryOrphanThresholdMs,
	queuedImportOrphanThresholdMs,
} from "../../core/operations/recovery-thresholds.ts";
import { dispatchDueFeeds } from "../../core/ingest/dispatch-due-feeds.ts";
import { fetchConditionalFeed } from "../../core/ingest/feed-fetcher.ts";
import { createPayloadFeedIngestRepository } from "../../core/ingest/payload-feed-ingest-repository.ts";
import {
	parseFeedUrlRef,
	parseImageHostEnv,
	runImportFeed,
} from "../../core/ingest/import-feed-runtime.ts";
import { projectConfig } from "../../project/project.config.ts";
import { getRuntimeClock } from "../../core/time/clock.ts";
import { systemQueueJob } from "../../server/system-gateway/jobs.ts";
import { systemOverrideAccess } from "../../server/system-gateway/overrides.ts";
import {
	createSafeFeedOutboundFetch,
	parseOutboundHostList,
} from "../../server/security/safe-outbound-client.ts";
import { parseTestApprovedOrigins } from "../../server/security/test-destinations.ts";
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

function nowDate() {
	return getRuntimeClock().now();
}

function nowIso() {
	return getRuntimeClock().nowIso();
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
			const now = nowDate();
			const result = await dispatchDueFeeds({
				now,
				batchSize: projectConfig.dispatchBatchSize,
				claimDueFeedSources: (input) => claimDueFeedSources(req.payload, input),
				createQueuedImportRun: async ({ feedSourceId, now: queuedAt }) => {
					const created = await req.payload.create({
						collection: "import-runs",
						data: {
							feedSource: Number(feedSourceId),
							status: "queued",
							queuedAt: queuedAt.toISOString(),
							heartbeatAt: queuedAt.toISOString(),
						},
						...systemOverrideAccess("system-job"),
					});
					return { id: String(created.id) };
				},
				enqueueImportFeed: async (input) => {
					const queuedJob = (await queueTask({
						req,
						task: payloadJobTaskSlugs.importFeed,
						queue: payloadJobQueues.imports,
						input,
					})) as { id: number | string };
					return { id: String(queuedJob.id) };
				},
				attachJobId: async ({ importRunId, jobId }) => {
					await req.payload.update({
						collection: "import-runs",
						id: importRunId,
						data: { jobId },
						...systemOverrideAccess("system-job"),
					});
				},
			});

			return {
				output: {
					dispatched: result.dispatched.length > 0,
					count: result.dispatched.length,
					items: result.dispatched,
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
		handler: async ({ req, input }) => {
			const payload = req.payload;
			const testOrigins = parseTestApprovedOrigins(process.env);
			const testHosts = [
				...new Set(testOrigins.map((origin) => new URL(origin).hostname)),
			];
			const result = await runImportFeed(
				{
					now: () => nowDate(),
					claimQueuedImportRun: (claim) => claimQueuedImportRun(payload, claim),
					touchHeartbeat: async (tick) => {
						await touchImportRunHeartbeat(payload, tick);
					},
					loadFeedSource: async (feedSourceId) => {
						const source = await payload.findByID({
							collection: "feed-sources",
							id: feedSourceId,
							depth: 0,
							...systemOverrideAccess("system-job"),
						});
						return {
							id: String(source.id),
							code: source.code,
							enabled: Boolean(source.enabled),
							market: source.market,
							feedUrlRef: source.feedUrlRef,
							lastEtag: source.lastEtag,
							lastModified: source.lastModified,
							lastFeedHash: source.lastFeedHash,
							lastOfferCount: source.lastOfferCount,
							safetyThresholdPercent: source.safetyThresholdPercent,
							maxDeactivationsPerRun: source.maxDeactivationsPerRun,
							deactivationApproval: {
								runId:
									typeof source.deactivationApproval?.runId === "object" &&
									source.deactivationApproval.runId
										? String(source.deactivationApproval.runId.id)
										: source.deactivationApproval?.runId == null
											? undefined
											: String(source.deactivationApproval.runId),
								expiresAt: source.deactivationApproval?.expiresAt,
								consumedAt: source.deactivationApproval?.consumedAt,
							},
						};
					},
					resolveFeedUrl: parseFeedUrlRef,
					fetchFeed: ({ url, etag, lastModified }) =>
						fetchConditionalFeed({
							url,
							etag,
							lastModified,
							outboundFetch: createSafeFeedOutboundFetch({
								allowedHosts: [
									...parseOutboundHostList(runtimeEnv.OUTBOUND_ALLOWED_HOSTS),
									...testHosts,
								],
								approvedHttpHosts: testHosts,
								approvedExactOrigins: testOrigins,
								maxBytes: 64 * 1024 * 1024,
							}),
						}),
					createRepository: (feedSourceId) =>
						createPayloadFeedIngestRepository(payload, feedSourceId),
					finishRun: (finish) => finishImportRun(payload, finish),
					recordSourceContact: async ({ feedSourceId, patch }) => {
						if (Object.keys(patch).length === 0) return;
						await payload.update({
							collection: "feed-sources",
							id: feedSourceId,
							data: patch,
							...systemOverrideAccess("system-job"),
						});
					},
					consumeDeactivationApproval: (input) =>
						consumeDeactivationApproval(payload, input),
					invalidatePublicCache: async (targets) => {
						const result = await postBatchedHttpRevalidate({
							baseUrl: runtimeEnv.INTERNAL_REVALIDATE_BASE_URL,
							secret: runtimeEnv.REVALIDATE_SECRET,
							targets,
							reason: "import-feed",
						});
						return { ok: result.ok };
					},
					allowedImageHosts: parseImageHostEnv(runtimeEnv.EXTERNAL_IMAGE_HOSTS),
				},
				{
					feedSourceId: String(input.feedSourceId),
					importRunId: String(input.importRunId),
				},
			);

			return { output: result };
		},
	},
	{
		slug: payloadJobTaskSlugs.jobsJanitor,
		label: "Jobs janitor",
		schedule: getStaticSchedule(payloadJobTaskSlugs.jobsJanitor),
		handler: async ({ req }) => {
			const recentSuccess = await req.payload.find({
				collection: "import-runs",
				where: { status: { equals: "success" } },
				sort: "-finishedAt",
				limit: 5,
				depth: 0,
				req,
			});
			const importStaleMs = importStaleThresholdMs(
				observedSuccessfulDurationMs(recentSuccess.docs),
			);
			const queuedOrphanMs = queuedImportOrphanThresholdMs(
				projectConfig.dispatcherIntervalMinutes,
			);
			const importStaleBefore = new Date(
				nowDate().getTime() - importStaleMs,
			).toISOString();
			const queuedOrphanBefore = new Date(
				nowDate().getTime() - queuedOrphanMs,
			).toISOString();
			const staleRuns = await req.payload.find({
				collection: "import-runs",
				where: {
					or: [
						{
							and: [
								{ status: { equals: "running" } },
								{ heartbeatAt: { less_than: importStaleBefore } },
							],
						},
						{
							and: [
								{ status: { equals: "queued" } },
								{ queuedAt: { less_than: queuedOrphanBefore } },
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
					...systemOverrideAccess("system-job"),
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
			const decision = planLeadRetentionRun(projectConfig.leadRetentionDays);
			if (!decision.destructive) {
				return {
					output: {
						purgedLeads: 0,
						skipped: decision.reason,
						alert: decision.alert.code,
					},
				};
			}

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
			let deleted = 0;
			let anonymized = 0;

			for (const lead of expiredLeads.docs) {
				if (lead.retentionMode === "delete") {
					await req.payload.delete({
						collection: "leads",
						id: lead.id,
						req,
					});
					deleted += 1;
					continue;
				}

				await req.payload.update({
					collection: "leads",
					id: lead.id,
					data: anonymizeLeadFields(purgedAt),
					req,
				});
				anonymized += 1;
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

			return {
				output: {
					purgedLeads: deleted + anonymized,
					deleted,
					anonymized,
				},
			};
		},
	},
	{
		slug: payloadJobTaskSlugs.catalogLifecycle,
		label: "Catalog lifecycle",
		schedule: getStaticSchedule(payloadJobTaskSlugs.catalogLifecycle),
		handler: async ({ req }) => {
			const retentionDays =
				projectConfig.archiveRetentionDays ?? runtimeEnv.ARCHIVE_RETENTION_DAYS;
			if (!retentionDays) {
				return {
					output: {
						purgedProperties: 0,
						skipped: "missing_policy",
					},
				};
			}
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
				// Purge never writes a homepage redirect; public path becomes 410
				// unless an explicit redirects.from row already exists.
			}

			return { output: { purgedProperties: archivedProperties.docs.length } };
		},
	},
	{
		slug: payloadJobTaskSlugs.recoverLeadDeliveries,
		label: "Recover lead deliveries",
		schedule: getStaticSchedule(payloadJobTaskSlugs.recoverLeadDeliveries),
		handler: async ({ req }) => {
			const staleThreshold = new Date(
				nowDate().getTime() -
					pendingDeliveryOrphanThresholdMs(
						projectConfig.maintenanceIntervalMinutes,
					),
			).toISOString();
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
						jobId: null,
						claimedAt: null,
						heartbeatAt: null,
						lastErrorKind: "retryable",
						lastErrorRedacted:
							"Recovered by recoverLeadDeliveries: stale sending delivery.",
					},
					req,
					...systemOverrideAccess("system-job"),
				});
			}

			const duePending = await req.payload.find({
				collection: "lead-deliveries",
				where: {
					and: [
						{ status: { equals: "pending" } },
						{ nextAttemptAt: { less_than_equal: nowIso() } },
					],
				},
				limit: 20,
				depth: 0,
				req,
			});

			let queuedPending = 0;
			for (const delivery of duePending.docs) {
				if (delivery.jobId) {
					let live = false;
					try {
						const job = await inspectPayloadJob(
							req.payload,
							String(delivery.jobId),
						);
						live = isLiveFuturePayloadJob(
							{
								waitUntil:
									typeof job.waitUntil === "string" ? job.waitUntil : null,
								completedAt:
									typeof job.completedAt === "string" ? job.completedAt : null,
								processing: Boolean(
									(job as { processing?: boolean }).processing,
								),
							},
							nowDate(),
						);
					} catch {
						live = false;
					}
					if (live) {
						continue;
					}
				}

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
					...systemOverrideAccess("system-job"),
				});
				queuedPending += 1;
			}

			return {
				output: {
					recoveredSending: staleSending.docs.length,
					queuedPending,
				},
			};
		},
	},
	{
		slug: payloadJobTaskSlugs.deliverLead,
		label: "Deliver lead",
		inputSchema: [{ name: "leadDeliveryId", type: "text", required: true }],
		retries: 0,
		concurrency: {
			key: ({ input }) => `lead-delivery:${input.leadDeliveryId}`,
			exclusive: true,
			supersedes: false,
		},
		handler: async ({ input, req }) => {
			const result = await runDeliverLeadTask({
				payload: req.payload,
				leadDeliveryId: String(input.leadDeliveryId),
				nowIso: nowIso(),
				env: {
					LEAD_OUTBOUND_HOSTS: runtimeEnv.LEAD_OUTBOUND_HOSTS,
					MAX_API_URL: runtimeEnv.MAX_API_URL,
					MAX_BOT_TOKEN: runtimeEnv.MAX_BOT_TOKEN,
					MAX_CHAT_ID: runtimeEnv.MAX_CHAT_ID,
					CUSTOM_WEBHOOK_URL: runtimeEnv.CUSTOM_WEBHOOK_URL,
					CUSTOM_WEBHOOK_HMAC_SECRET: runtimeEnv.CUSTOM_WEBHOOK_HMAC_SECRET,
				},
			});
			return result;
		},
	},
];
