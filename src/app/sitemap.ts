import type { MetadataRoute } from "next";
import { getRuntimeDiscoveryShards } from "@/project/seo/discovery-runtime";

export const revalidate = 3600;

export async function generateSitemaps() {
	try {
		const shards = await getRuntimeDiscoveryShards();
		return shards.length ? shards.map((shard) => ({ id: shard.id })) : [{ id: "empty" }];
	} catch {
		return [{ id: "empty" }];
	}
}

export default async function sitemap(props: {
	id: Promise<string> | string;
}): Promise<MetadataRoute.Sitemap> {
	const rawId = typeof props.id === "string" ? props.id : await props.id;
	try {
		const shard = (await getRuntimeDiscoveryShards()).find(
			(candidate) => candidate.id === rawId,
		);
		return (
			shard?.entries.map((entry) => ({
				url: entry.url,
				lastModified: new Date(entry.lastModified),
			})) ?? []
		);
	} catch {
		return [];
	}
}

