import "server-only";

import {
	findPublicCatalogFacets,
	findPublicCatalogProperties,
	findPublicPropertyBySlug,
} from "./catalog";
import {
	toHomePageDTO,
	toMarketingPageDTO,
	toPropertyDetailsDTO,
	toPropertyFilterDTO,
	toPropertyListDTO,
	toShellDTO,
} from "./dto";
import { findPublicPage, findPublicPages } from "./pages";
import { getPublicGatewayPayload } from "./payload";

export async function getPublicShell() {
	const payload = await getPublicGatewayPayload();
	return toShellDTO(await findPublicPages(payload));
}

export async function getPublicCatalog() {
	const payload = await getPublicGatewayPayload();
	const query = { limit: 24, page: 1 } as const;
	const [result, facets] = await Promise.all([
		findPublicCatalogProperties(payload, query),
		findPublicCatalogFacets(payload, query),
	]);

	return {
		list: toPropertyListDTO(result),
		filters: toPropertyFilterDTO(result, facets),
	} as const;
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

export async function getPublicProperty(slug: string) {
	const payload = await getPublicGatewayPayload();
	const property = await findPublicPropertyBySlug(payload, slug);
	if (!property) return null;
	const relatedResult = await findPublicCatalogProperties(payload, {
		limit: 3,
		page: 1,
		category: property.category,
		city: property.locality ?? undefined,
	});
	const related = relatedResult.items.filter((item) => item.slug !== property.slug).slice(0, 3);

	return toPropertyDetailsDTO(property, related);
}

export async function getPublicMarketingPage(slug: string) {
	const payload = await getPublicGatewayPayload();
	const page = await findPublicPage(payload, slug);
	return page ? toMarketingPageDTO(page) : null;
}
