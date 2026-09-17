type SystemOperation =
	| "bootstrap-owner"
	| "controlled-maintenance"
	| "system-job"
	| "migration-helper"
	| "trusted-inspection"
	| "payload-jobs-inspect";

export function systemOverrideAccess(operation: SystemOperation) {
	return {
		overrideAccess: true,
		context: {
			systemGatewayOperation: operation,
		},
	} as const;
}

