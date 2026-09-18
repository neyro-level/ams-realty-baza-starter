import type { Payload } from "payload";
import { projectConfig } from "../../project/project.config.ts";
import { systemOverrideAccess } from "../../server/system-gateway/overrides.ts";

export async function queueManualFeedImport(
	payload: Payload,
	input: { feedSourceId: string; now?: Date },
): Promise<{ importRunId: string; jobId: string }> {
	const now = input.now ?? new Date();
	const source = await payload.findByID({
		collection: "feed-sources",
		id: input.feedSourceId,
		depth: 0,
		...systemOverrideAccess("system-job"),
	});
	if (!source.enabled) {
		throw new Error("Manual import requires an enabled feed source.");
	}

	const created = await payload.create({
		collection: "import-runs",
		data: {
			feedSource: Number(source.id),
			status: "queued",
			queuedAt: now.toISOString(),
			heartbeatAt: now.toISOString(),
		},
		...systemOverrideAccess("system-job"),
	});
	const importRunId = String(created.id);
	const queued = (await payload.jobs.queue({
		task: "importFeed",
		queue: "imports",
		input: {
			feedSourceId: String(source.id),
			importRunId,
		},
		...systemOverrideAccess("system-job"),
	})) as { id: number | string };

	await payload.update({
		collection: "import-runs",
		id: importRunId,
		data: { jobId: String(queued.id) },
		...systemOverrideAccess("system-job"),
	});

	return { importRunId, jobId: String(queued.id) };
}

export async function approveSuspiciousDeactivation(
	payload: Payload,
	input: {
		feedSourceId: string;
		importRunId: string;
		approvedByUserId: string;
		now?: Date;
	},
): Promise<{ expiresAt: string }> {
	const now = input.now ?? new Date();
	const run = await payload.findByID({
		collection: "import-runs",
		id: input.importRunId,
		depth: 0,
		...systemOverrideAccess("system-job"),
	});
	if (run.status !== "suspicious") {
		throw new Error("Deactivation approval is only valid for a suspicious import run.");
	}
	const runSourceId =
		typeof run.feedSource === "object" && run.feedSource
			? String(run.feedSource.id)
			: String(run.feedSource);
	if (runSourceId !== input.feedSourceId) {
		throw new Error("Deactivation approval must belong to the same feed source.");
	}

	const expiresAt = new Date(
		now.getTime() + projectConfig.approvalTtlMinutes * 60_000,
	).toISOString();

	await payload.update({
		collection: "feed-sources",
		id: input.feedSourceId,
		data: {
			deactivationApproval: {
				runId: Number(input.importRunId),
				approvedBy: Number(input.approvedByUserId),
				approvedAt: now.toISOString(),
				expiresAt,
				consumedAt: null,
			},
		},
		...systemOverrideAccess("system-job"),
	});

	return { expiresAt };
}
