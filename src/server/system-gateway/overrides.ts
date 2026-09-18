type SystemOperation =
	| "bootstrap-owner"
	| "controlled-maintenance"
	| "system-job"
	| "migration-helper"
	| "trusted-inspection"
	| "payload-jobs-inspect"
	| "payload-jobs-unstuck";

export function systemOverrideAccess(operation: SystemOperation) {
	return {
		overrideAccess: true,
		context: {
			systemGatewayOperation: operation,
		},
	} as const;
}

