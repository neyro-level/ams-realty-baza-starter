import "server-only";
import { z } from "zod";

const pathTargetSchema = z.object({
	type: z.literal("path"),
	path: z.string().min(1).max(1024).regex(/^\//),
	routeType: z.enum(["page", "layout"]).optional(),
});

const tagTargetSchema = z.object({
	type: z.literal("tag"),
	tag: z.string().min(1).max(128).regex(/^[a-z0-9:_-]+$/i),
});

export const cacheTargetSchema = z.discriminatedUnion("type", [
	pathTargetSchema,
	tagTargetSchema,
]);

export const cacheInvalidationRequestSchema = z.object({
	targets: z.array(cacheTargetSchema).min(1).max(32),
	reason: z.string().max(200).optional(),
});

export type CacheTarget = z.output<typeof cacheTargetSchema>;
export type CacheInvalidationRequest = z.output<
	typeof cacheInvalidationRequestSchema
>;

export async function invalidateCacheTargets(targets: CacheTarget[]): Promise<void> {
	const { revalidatePath, revalidateTag } = await import("next/cache");

	for (const target of targets) {
		if (target.type === "path") {
			revalidatePath(target.path, target.routeType);
			continue;
		}
		revalidateTag(target.tag, "max");
	}
}
