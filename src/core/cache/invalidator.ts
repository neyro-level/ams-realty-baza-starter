import "server-only";
import { invalidateInProcessCacheTargets } from "./in-process.ts";
import type { CacheTarget } from "./revalidation-contract.ts";

export async function invalidateCacheTargets(
	targets: CacheTarget[],
): Promise<void> {
	await invalidateInProcessCacheTargets(targets);
}
