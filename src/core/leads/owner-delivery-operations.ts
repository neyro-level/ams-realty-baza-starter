import type { Payload } from "payload";
import { systemOverrideAccess } from "../../server/system-gateway/overrides.ts";
import { appendAttemptLog } from "./delivery-state.ts";

const access = systemOverrideAccess("system-job");

export async function retryLeadDelivery({
	payload,
	deliveryId,
	actorUserId,
	nowIso,
	enqueue,
}: {
	payload: Payload;
	deliveryId: string;
	actorUserId: string;
	nowIso: string;
	enqueue: (leadDeliveryId: string) => Promise<string>;
}): Promise<{ jobId: string }> {
	const delivery = await payload.findByID({
		collection: "lead-deliveries",
		id: deliveryId,
		depth: 0,
		...access,
	});

	if (delivery.status === "sending") {
		throw new Error("Manual retry is not allowed while a delivery is sending.");
	}
	if (delivery.status === "delivered") {
		throw new Error("Manual retry is not allowed for a delivered row.");
	}
	if (delivery.jobId) {
		throw new Error("Manual retry requires no live job identity on the delivery.");
	}

	const attemptLog = appendAttemptLog(
		(delivery.attemptLog as
			| { attemptedAt: string; outcome: "skipped"; redactedNote?: string }[]
			| undefined) ?? [],
		{
			attemptedAt: nowIso,
			outcome: "skipped",
			safeCode: "manual_retry",
			redactedNote: `Manual retry requested by user ${actorUserId}.`,
		},
	);

	await payload.update({
		collection: "lead-deliveries",
		id: deliveryId,
		data: {
			status: "pending",
			nextAttemptAt: nowIso,
			claimedAt: null,
			heartbeatAt: null,
			abandonedReason: null,
			lastErrorKind: null,
			attemptLog,
		},
		...access,
	});

	const jobId = await enqueue(String(delivery.id));
	await payload.update({
		collection: "lead-deliveries",
		id: deliveryId,
		data: { jobId },
		...access,
	});
	return { jobId };
}
