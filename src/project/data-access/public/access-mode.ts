import type { Access, PayloadRequest, Where } from "payload";

export const publicGatewayOperation = "public-read" as const;
export const propertyLifecycleOperation = "property-lifecycle-read" as const;

function isOperator(user: unknown): boolean {
	const roles = (user as { roles?: unknown } | null | undefined)?.roles;
	return (
		Array.isArray(roles) &&
		roles.some((role) => role === "owner" || role === "admin")
	);
}

export function isPublicGatewayRead(
	req: Pick<PayloadRequest, "context">,
): boolean {
	return (
		(req.context as { publicGatewayOperation?: string } | undefined)
			?.publicGatewayOperation === publicGatewayOperation
	);
}

function isPropertyLifecycleRead(
	req: Pick<PayloadRequest, "context">,
): boolean {
	return (
		(req.context as { publicGatewayOperation?: string } | undefined)
			?.publicGatewayOperation === propertyLifecycleOperation
	);
}

export function publicGatewayReadAccess() {
	return {
		overrideAccess: false as const,
		user: null,
		context: { publicGatewayOperation },
	};
}

export function propertyLifecycleReadAccess() {
	return {
		overrideAccess: false as const,
		user: null,
		context: { publicGatewayOperation: propertyLifecycleOperation },
	};
}

function roleOrPublicWhere(
	req: PayloadRequest,
	where: Where | true,
): boolean | Where {
	if (isOperator(req.user)) return true;
	return isPublicGatewayRead(req) ? where : false;
}

const propertyLifecycleWhere: Where = {
	and: [
		{ publishedAt: { exists: true } },
		{ status: { in: ["active", "archived"] } },
	],
};

const publicPropertyWhere: Where = {
	and: [
		{ publishedAt: { exists: true } },
		{ contentPurgedAt: { exists: false } },
		{ status: { in: ["active", "archived"] } },
	],
};

export const publicPropertyReadAccess: Access = ({ req }) => {
	if (isOperator(req.user)) return true;
	if (isPropertyLifecycleRead(req)) return propertyLifecycleWhere;
	if (!isPublicGatewayRead(req)) return false;
	return publicPropertyWhere;
};

export const publicPageReadAccess: Access = ({ req }) =>
	roleOrPublicWhere(req, {
		and: [
			{ status: { equals: "published" } },
			{ publishedAt: { exists: true } },
		],
	});

export const publicRedirectReadAccess: Access = ({ req }) =>
	roleOrPublicWhere(req, true);
