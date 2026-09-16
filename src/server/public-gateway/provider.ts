import "server-only";

import { resolvePropertyPageLifecycle } from "@/server/seo/property";
import {
	type CatalogQueryInput,
	findPublicCatalogFacets,
	findPublicCatalogProperties,
	findPublicPropertyBySlug,
	findPublicPropertyLifecycleBySlug,
	findPublicSitemapProperties,
} from "./catalog";
import {
	type PublicPropertyDetailsDTO,
	toHomePageDTO,
	toMarketingPageDTO,
	toPropertyDetailsDTO,
	toPropertyFilterDTO,
	toPropertyListDTO,
	toShellDTO,
} from "./dto";
import {
	findPublicPage,
	findPublicPages,
	findPublicSitemapPages,
} from "./pages";
import { getPublicGatewayPayload } from "./payload";

export type PublicPropertyPageState =
	| {
			lifecycle: { kind: "gone"; statusCode: 410; robots: "noindex" };
	  }
	| {
			lifecycle: { kind: "redirect"; statusCode: 308; destination: string };
	  }
	| {
			lifecycle:
				| { kind: "active"; statusCode: 200 }
				| { kind: "archived"; statusCode: 200; robots: "noindex" };
			property: PublicPropertyDetailsDTO;
	  };

export async function getPublicShell() {
	const payload = await getPublicGatewayPayload();
	return toShellDTO(await findPublicPages(payload));
}

export async function getPublicCatalog(
	query: CatalogQueryInput = { limit: 24, page: 1 },
) {
	const payload = await getPublicGatewayPayload();
	const [result, facets] = await Promise.all([
		findPublicCatalogProperties(payload, query),
		findPublicCatalogFacets(payload, query),
	]);

	return {
		list: toPropertyListDTO(result),
		filters: toPropertyFilterDTO(result, facets),
	} as const;
}

export async function getPublicSitemapEntries() {
	const payload = await getPublicGatewayPayload();
	const [pages, properties] = await Promise.all([
		findPublicSitemapPages(payload),
		findPublicSitemapProperties(payload),
	]);

	return [
		...pages.map((page) => ({
			path: page.slug === "home" ? "/" : `/${page.slug}`,
			lastModified: page.updatedAt,
			changeFrequency: "weekly" as const,
			priority: page.slug === "home" ? 1 : 0.6,
			indexable: true,
		})),
		...properties.map((property) => ({
			path: `/obekty/${property.slug}`,
			lastModified: property.updatedAt,
			changeFrequency: "daily" as const,
			priority: 0.8,
			indexable: true,
		})),
	];
}

export async function getPublicHomePage() {
	const payload = await getPublicGatewayPayload();
	const [page, catalog] = await Promise.all([
		findPublicPage(payload, "home"),
		findPublicCatalogProperties(payload, { limit: 1, page: 1 }),
	]);
	const home = toHomePageDTO(page);
	const featured = catalog.items[0];

	return {
		page: {
			...home,
			featuredPropertyId: featured ? String(featured.id) : "",
		},
		featured: featured ? toPropertyListDTO(catalog).items[0] : null,
	} as const;
}

export async function getPublicProperty(
	slug: string,
): Promise<PublicPropertyPageState | null> {
	const payload = await getPublicGatewayPayload();
	const lifecycle = resolvePropertyPageLifecycle(
		await findPublicPropertyLifecycleBySlug(payload, slug),
	);
	switch (lifecycle.kind) {
		case "missing":
			return null;
		case "gone":
			return { lifecycle };
		case "redirect":
			return { lifecycle };
	}

	const property = await findPublicPropertyBySlug(payload, slug);
	if (!property) return null;
	const relatedResult = await findPublicCatalogProperties(payload, {
		limit: 3,
		page: 1,
		category: property.category,
		city: property.locality ?? undefined,
	});
	const related = relatedResult.items
		.filter((item) => item.slug !== property.slug)
		.slice(0, 3);

	return {
		lifecycle,
		property: toPropertyDetailsDTO(property, related),
	} as const;
}

export async function getPublicMarketingPage(slug: string) {
	const payload = await getPublicGatewayPayload();
	const page = await findPublicPage(payload, slug);
	return page ? toMarketingPageDTO(page) : null;
}
