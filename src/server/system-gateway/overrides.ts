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

