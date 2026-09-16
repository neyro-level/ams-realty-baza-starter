import "server-only";
import type { Payload } from "payload";

type SystemOperation =
	| "bootstrap-owner"
	| "controlled-maintenance"
	| "system-job"
	| "migration-helper"
	| "trusted-inspection";

export function systemOverrideAccess(operation: SystemOperation) {
	return {
		overrideAccess: true,
		context: {
			systemGatewayOperation: operation,
		},
	} as const;
}

export async function destroyPayload(payload: Payload): Promise<void> {
	await payload.destroy();
}
