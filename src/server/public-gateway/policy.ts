import "server-only";

export const publicGatewayPolicy = {
	overrideAccess: false,
	depth: 0,
	maxLimit: 48,
	output: "dto",
} as const;
