import "server-only";

import type { PageSEOContract } from "@ams/realtbase-contracts";
import type { Payload } from "payload";
import { publicGatewayPolicy } from "./policy";

export type PublicPageRecord = {
	slug: string;
	title: string;
	seo: PageSEOContract;
};

function pageSeo(
	slug: string,
	title: string,
	description?: string | null,
	noindex?: boolean | null,
): PageSEOContract {
	const canonicalPath = slug === "home" ? "/" : `/${slug}`;
	const seoTitle = title.includes("AMS Realty Baza Starter")
		? title
		: `${title} — AMS Realty Baza Starter`;

	return {
		title: seoTitle,
		description: description || "Недвижимость и услуги агентства.",
		canonicalPath,
		indexing: noindex ? "noindex" : "index",
		following: "follow",
	};
}

export async function findPublicPage(payload: Payload, slug: string): Promise<PublicPageRecord | null> {
	const result = await payload.find({
		collection: "pages",
		where: {
			and: [
				{ slug: { equals: slug } },
				{ status: { equals: "published" } },
				{ publishedAt: { exists: true } },
			],
		},
		depth: publicGatewayPolicy.depth,
		limit: 1,
		page: 1,
		select: {
			slug: true,
			title: true,
			seo: {
				title: true,
				description: true,
				noindex: true,
			},
		},
		overrideAccess: publicGatewayPolicy.overrideAccess,
	});

	const page = result.docs[0];
	if (!page) return null;

	return {
		slug: page.slug,
		title: page.title,
		seo: pageSeo(
			page.slug,
			page.seo?.title || page.title,
			page.seo?.description,
			page.seo?.noindex,
		),
	};
}

export async function findPublicPages(payload: Payload): Promise<readonly PublicPageRecord[]> {
	const result = await payload.find({
		collection: "pages",
		where: {
			and: [{ status: { equals: "published" } }, { publishedAt: { exists: true } }],
		},
		depth: publicGatewayPolicy.depth,
		limit: 24,
		page: 1,
		sort: "slug",
		select: {
			slug: true,
			title: true,
			seo: {
				title: true,
				description: true,
				noindex: true,
			},
		},
		overrideAccess: publicGatewayPolicy.overrideAccess,
	});

	return result.docs.map((page) => ({
		slug: page.slug,
		title: page.title,
		seo: pageSeo(
			page.slug,
			page.seo?.title || page.title,
			page.seo?.description,
			page.seo?.noindex,
		),
	}));
}
