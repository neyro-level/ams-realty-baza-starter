import type { PayloadRequest } from "payload";
import { systemOverrideAccess } from "./overrides.ts";

export async function systemQueueJob({
	req,
	task,
	queue,
	input,
}: {
	req: PayloadRequest;
	task: never;
	queue: string;
	input: never;
}) {
	return req.payload.jobs.queue({
		task,
		queue,
		input,
		req,
		...systemOverrideAccess("system-job"),
	});
}
