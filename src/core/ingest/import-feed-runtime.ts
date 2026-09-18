import type { FeedIngestRepository, FeedIngestResult } from "./feed-ingest.ts";
import { ingestNormalizedFeed } from "./feed-ingest.ts";
import type { FetchFeedResult } from "./feed-fetcher.ts";
import {
	buildFeedSourceBaselinePatch,
	decideFeedRunCompletion,
	isDeactivationApprovalValid,
	type DeactivationApprovalSnapshot,
	type FeedSourceBaselinePatch,
} from "./feed-lifecycle.ts";
import { parseAllowedImageHosts } from "./image-hosts.ts";
import type { NormalizedFeedOffer } from "./feed-normalization.ts";
import { parseYrlFeed } from "./yrl-parser.ts";
import { startImportHeartbeat } from "./dispatch-due-feeds.ts";
import { projectConfig } from "../../project/project.config.ts";

export type ImportFeedSourceSnapshot = {
	id: string;
	code: string;
	enabled: boolean;
	market: "secondary" | "newbuild";
	feedUrlRef: string;
	lastEtag?: string | null;
	lastModified?: string | null;
	lastFeedHash?: string | null;
	lastOfferCount?: number | null;
	safetyThresholdPercent: number;
	maxDeactivationsPerRun: number;
	deactivationApproval?: DeactivationApprovalSnapshot;
};

export type ImportFeedRuntimeDeps = {
	now: () => Date;
	heartbeatIntervalMs?: number;
	claimQueuedImportRun: (input: {
		importRunId: string;
		now: Date;
	}) => Promise<string | undefined>;
	touchHeartbeat: (input: { importRunId: string; now: Date }) => Promise<void>;
	loadFeedSource: (feedSourceId: string) => Promise<ImportFeedSourceSnapshot>;
	resolveFeedUrl: (feedUrlRef: string) => string;
	fetchFeed: (input: {
		url: string;
		etag?: string | null;
		lastModified?: string | null;
	}) => Promise<FetchFeedResult>;
	parseFeed?: typeof parseYrlFeed;
	createRepository: (feedSourceId: string) => FeedIngestRepository;
	ingest?: typeof ingestNormalizedFeed;
	finishRun: (input: {
		importRunId: string;
		now: Date;
		status: "success" | "unchanged" | "suspicious" | "interrupted" | "failed";
		offeredCount?: number;
		createdCount?: number;
		updatedCount?: number;
		skippedCount?: number;
		warningCount?: number;
		errorCount?: number;
		feedHash?: string;
		lastErrorRedacted?: string;
	}) => Promise<void>;
	recordSourceContact: (input: {
		feedSourceId: string;
		patch: FeedSourceBaselinePatch;
	}) => Promise<void>;
	consumeDeactivationApproval?: (input: {
		feedSourceId: string;
		importRunId: string;
		now: Date;
	}) => Promise<boolean>;
	invalidatePublicCache?: (
		targets: FeedIngestResult["invalidatedTargets"],
	) => Promise<{ ok: boolean }>;
	allowedImageHosts: ReadonlySet<string>;
};

export type ImportFeedRuntimeResult =
	| { claimed: false }
	| {
			claimed: true;
			status: "success" | "unchanged" | "suspicious" | "interrupted" | "failed";
			ingest?: FeedIngestResult;
			cacheInvalidated?: boolean;
	  };

export async function runImportFeed(
	deps: ImportFeedRuntimeDeps,
	input: { feedSourceId: string; importRunId: string },
): Promise<ImportFeedRuntimeResult> {
	const now = deps.now();
	const claimedId = await deps.claimQueuedImportRun({
		importRunId: input.importRunId,
		now,
	});
	if (!claimedId) {
		return { claimed: false };
	}

	const heartbeat = startImportHeartbeat({
		intervalMs: deps.heartbeatIntervalMs ?? projectConfig.importHeartbeatIntervalMs,
		tick: () => deps.touchHeartbeat({ importRunId: input.importRunId, now: deps.now() }),
	});

	try {
		const source = await deps.loadFeedSource(input.feedSourceId);
		const url = deps.resolveFeedUrl(source.feedUrlRef);
		const fetched = await deps.fetchFeed({
			url,
			etag: source.lastEtag,
			lastModified: source.lastModified,
		});

		if (fetched.status === "unchanged") {
			await deps.finishRun({
				importRunId: input.importRunId,
				now: deps.now(),
				status: "unchanged",
			});
			await deps.recordSourceContact({
				feedSourceId: source.id,
				patch: buildFeedSourceBaselinePatch({
					status: "unchanged",
					parserCompleted: true,
					criticalStructuralError: false,
					nowIso: deps.now().toISOString(),
					etag: fetched.etag,
					lastModified: fetched.lastModified,
				}),
			});
			return { claimed: true, status: "unchanged" };
		}

		const offers: NormalizedFeedOffer[] = [];
		const parse = deps.parseFeed ?? parseYrlFeed;
		const parsed = await parse({
			stream: fetched.body,
			allowedImageHosts: deps.allowedImageHosts,
			onOffer: (offer) => {
				offers.push(offer);
			},
		});
		const bodyHash = (await fetched.sha256) ?? undefined;
		const ingest = deps.ingest ?? ingestNormalizedFeed;
		const repository = deps.createRepository(source.id);
		const ingestResult = await ingest({
			context: {
				feedSourceId: source.id,
				feedSourceCode: source.code,
				importRunId: input.importRunId,
				market: source.market,
				nowIso: deps.now().toISOString(),
			},
			offers,
			issues: parsed.issues,
			repository,
		});

		const seenBefore = deps.now();
		const plannedDeactivations = await repository.countMissingActive({
			feedSourceId: source.id,
			seenBeforeIso: seenBefore.toISOString(),
		});
		const hasValidDeactivationApproval = isDeactivationApprovalValid({
			importRunId: input.importRunId,
			nowIso: seenBefore.toISOString(),
			approval: source.deactivationApproval,
		});
		const decision = decideFeedRunCompletion({
			nowIso: seenBefore.toISOString(),
			sourceEnabled: source.enabled,
			parserCompleted: parsed.stats.parserCompleted,
			criticalStructuralError: parsed.stats.criticalStructuralAnomaly,
			identityValid: true,
			runInterrupted: false,
			isFirstFullRun: source.lastOfferCount == null,
			offeredCount: ingestResult.offeredCount,
			previousOfferCount: source.lastOfferCount ?? undefined,
			safetyThresholdPercent: source.safetyThresholdPercent,
			plannedDeactivations,
			maxDeactivationsPerRun: source.maxDeactivationsPerRun,
			hasValidDeactivationApproval,
			fetchStatus: "fetched",
			feedHash: bodyHash,
			lastFeedHash: source.lastFeedHash ?? undefined,
		});

		if (decision.canDeactivateMissing && plannedDeactivations > 0) {
			await repository.deactivateMissing({
				feedSourceId: source.id,
				importRunId: input.importRunId,
				seenBeforeIso: seenBefore.toISOString(),
				nowIso: deps.now().toISOString(),
			});
			if (hasValidDeactivationApproval) {
				await deps.consumeDeactivationApproval?.({
					feedSourceId: source.id,
					importRunId: input.importRunId,
					now: deps.now(),
				});
			}
			if (ingestResult.invalidatedTargets.length === 0) {
				ingestResult.invalidatedTargets = [
					{ type: "tag", tag: "properties" },
					{ type: "path", path: "/nedvizhimost", routeType: "page" },
				];
			}
		}

		let cacheOk = true;
		if (ingestResult.invalidatedTargets.length > 0 && deps.invalidatePublicCache) {
			const cacheResult = await deps.invalidatePublicCache(ingestResult.invalidatedTargets);
			cacheOk = cacheResult.ok;
			if (!cacheOk) {
				ingestResult.warningCount += 1;
			}
		}

		await deps.finishRun({
			importRunId: input.importRunId,
			now: deps.now(),
			status: decision.status,
			offeredCount: ingestResult.offeredCount,
			createdCount: ingestResult.createdCount,
			updatedCount: ingestResult.updatedCount,
			skippedCount: ingestResult.skippedCount,
			warningCount: ingestResult.warningCount,
			errorCount: ingestResult.errorCount,
			feedHash: bodyHash,
		});
		await deps.recordSourceContact({
			feedSourceId: source.id,
			patch: buildFeedSourceBaselinePatch({
				status: decision.status,
				parserCompleted: parsed.stats.parserCompleted,
				criticalStructuralError: parsed.stats.criticalStructuralAnomaly,
				nowIso: deps.now().toISOString(),
				etag: fetched.etag,
				lastModified: fetched.lastModified,
				feedHash: bodyHash,
				offeredCount: ingestResult.offeredCount,
			}),
		});
		return {
			claimed: true,
			status: decision.status,
			ingest: ingestResult,
			cacheInvalidated: cacheOk,
		};
	} catch {
		await deps.finishRun({
			importRunId: input.importRunId,
			now: deps.now(),
			status: "failed",
			lastErrorRedacted: "Import feed failed without exposing destination details.",
		});
		return { claimed: true, status: "failed" };
	} finally {
		heartbeat.stop();
	}
}

export function parseFeedUrlRef(feedUrlRef: string, env: NodeJS.ProcessEnv = process.env): string {
	const value = env[feedUrlRef];
	if (!value || (!value.startsWith("https://") && !value.startsWith("http://"))) {
		throw new Error("Feed URL reference is not configured.");
	}
	return value;
}

export function parseImageHostEnv(value?: string): ReadonlySet<string> {
	return parseAllowedImageHosts(value ?? "");
}
