import "server-only";
import {
	postBatchedHttpRevalidate,
	type HttpCacheInvalidationResult,
} from "./http-revalidate.ts";
import type { CacheTarget } from "./revalidation-contract.ts";

export type PublicCacheInvalidationInput = {
	baseUrl?: string;
	secret?: string;
	targets: CacheTarget[];
	reason?: string;
	fetchImpl?: typeof fetch;
};

/** Canonical public-cache invalidation facade. Starter mode is HTTP only. */
export async function invalidatePublicCache(
	input: PublicCacheInvalidationInput,
): Promise<HttpCacheInvalidationResult> {
	return postBatchedHttpRevalidate(input);
}
