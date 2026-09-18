/**
 * Public Gateway Local API access. Not anonymous REST.
 * Collection access stays deny for anonymous users.
 */
export function publicGatewayReadAccess() {
	return {
		overrideAccess: true as const,
		context: {
			publicGatewayOperation: "public-read" as const,
		},
	};
}
