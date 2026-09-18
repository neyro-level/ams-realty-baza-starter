import type { MetadataRoute } from "next";
import {
	getPublicSitemapShard,
	getPublicSitemapShardCount,
} from "@/core/data-access/public";
import { absoluteUrl, staticPublicUrlEntries } from "@/core/seo/site";

export const revalidate = 3600;

function toSitemapEntries(
	entries: readonly {
		path: string;
		lastModified?: string | Date | null;
		changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
		priority?: number;
		indexable: boolean;
	}[],
): MetadataRoute.Sitemap {
	return entries
		.filter((entry) => entry.indexable)
		.map((entry) => ({
			url: absoluteUrl(entry.path),
			lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
			changeFrequency: entry.changeFrequency,
			priority: entry.priority,
		}));
}

export async function generateSitemaps() {
	try {
		const count = await getPublicSitemapShardCount();
		return Array.from({ length: Math.max(1, count) }, (_, id) => ({ id }));
	} catch {
		return [{ id: 0 }];
	}
}

export default async function sitemap(props: {
	id: Promise<string> | string;
}): Promise<MetadataRoute.Sitemap> {
	const rawId = typeof props.id === "string" ? props.id : await props.id;
	const id = Number(rawId);
	if (!Number.isInteger(id) || id < 0) return [];

	try {
		return toSitemapEntries(await getPublicSitemapShard(id));
	} catch {
		if (id !== 0) return [];
		return toSitemapEntries([...staticPublicUrlEntries]);
	}
}

