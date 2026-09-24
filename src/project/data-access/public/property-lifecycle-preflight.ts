import "server-only";

import {
	resolvePropertyLifecyclePreflight,
	type PropertyLifecyclePreflightDecision,
} from "../../../core/http/property-lifecycle-preflight.ts";
import { findPublicPropertyLifecycleBySlug } from "./catalog.ts";
import { getOptionalPublicGatewayPayload } from "./payload.ts";

export async function lookupCurrentPropertyLifecyclePreflight(
	slug: string,
): Promise<PropertyLifecyclePreflightDecision> {
	const payload = await getOptionalPublicGatewayPayload();
	if (!payload) return { kind: "pass" };
	return resolvePropertyLifecyclePreflight(
		await findPublicPropertyLifecycleBySlug(payload, slug),
	);
}
