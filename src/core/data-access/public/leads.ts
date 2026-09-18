import "server-only";

import type { Payload, PayloadRequest } from "payload";
import { createPayloadLeadOutboxRepository } from "../leads/payload-outbox-repository.ts";
import { resolveEnabledLeadChannels } from "../../leads/channels.ts";
import { hitInProcessLeadRateLimit } from "../../leads/in-process-rate-limit.ts";
import {
	accelerateLeadDeliveryJobs,
	commitLeadOutbox,
	prepareLeadIntake,
	type LeadIntakeRejected,
} from "../../leads/index.ts";
import { runtimeEnv } from "../../../payload/env.ts";
import { systemOverrideAccess } from "../system/overrides.ts";
import { getPublicGatewayPayload } from "./payload.ts";

export type PublicLeadSubmitResult =
	| { accepted: true; reused: boolean }
	| LeadIntakeRejected
	| { accepted: false; status: 503; code: "lead.unavailable" };

function rateLimitPerMinute(): number {
	const value = Number(process.env.LEAD_RATE_LIMIT_PER_MINUTE ?? 30);
	return Number.isInteger(value) && value > 0 ? value : 30;
}

async function enqueueLeadDelivery(
	payload: Payload,
	leadDeliveryId: string,
): Promise<string | undefined> {
	const queued = (await payload.jobs.queue({
		task: "deliverLead" as never,
		queue: "lead-deliveries",
		input: { leadDeliveryId } as never,
		req: {
			payload,
			user: null,
			context: systemOverrideAccess("system-job").context,
		} as unknown as PayloadRequest,
		...systemOverrideAccess("system-job"),
	})) as { id?: number | string };

	return queued.id === undefined ? undefined : String(queued.id);
}

export async function submitPublicLead({
	body,
	rateLimitKey,
}: {
	body: unknown;
	rateLimitKey: string;
}): Promise<PublicLeadSubmitResult> {
	const limited = hitInProcessLeadRateLimit({
		key: rateLimitKey,
		limit: rateLimitPerMinute(),
	});
	if (limited) {
		return limited;
	}

	const intake = prepareLeadIntake(body, {
		fraudHmacKey: runtimeEnv.PAYLOAD_SECRET,
	});
	if (!intake.accepted) {
		return intake;
	}

	if (!runtimeEnv.DATABASE_URI || !runtimeEnv.PAYLOAD_SECRET) {
		return {
			accepted: false,
			status: 503,
			code: "lead.unavailable",
		};
	}

	const payload = await getPublicGatewayPayload();
	const repository = createPayloadLeadOutboxRepository(payload);
	const nowIso = new Date().toISOString();
	const committed = await commitLeadOutbox({
		intake,
		channels: resolveEnabledLeadChannels({
			LEAD_CHANNELS: runtimeEnv.LEAD_CHANNELS,
			LEAD_OUTBOUND_HOSTS: runtimeEnv.LEAD_OUTBOUND_HOSTS,
			MAX_BOT_TOKEN: runtimeEnv.MAX_BOT_TOKEN,
			MAX_CHAT_ID: runtimeEnv.MAX_CHAT_ID,
			CUSTOM_WEBHOOK_URL: runtimeEnv.CUSTOM_WEBHOOK_URL,
			CUSTOM_WEBHOOK_HMAC_SECRET: runtimeEnv.CUSTOM_WEBHOOK_HMAC_SECRET,
		}),
		repository,
		nowIso,
	});

	if (!committed.reusedExistingLead) {
		await accelerateLeadDeliveryJobs({
			repository,
			nowIso,
			enqueue: (leadDeliveryId) => enqueueLeadDelivery(payload, leadDeliveryId),
		});
	}

	return {
		accepted: true,
		reused: committed.reusedExistingLead,
	};
}
