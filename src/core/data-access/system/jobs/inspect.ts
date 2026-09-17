import "server-only";
import type { Payload } from "payload";
import { systemOverrideAccess } from "../../../server/system-gateway/overrides.ts";

export async function inspectPayloadJob(payload: Payload, id: string) {
	return payload.findByID({
		collection: "payload-jobs",
		id,
		depth: 0,
		...systemOverrideAccess("payload-jobs-inspect"),
	});
}
