import {
	createUrlGrammar,
	type UrlGrammarInput,
} from "../core/routing/index.ts";
import type { SiteProfile } from "../core/profile/index.ts";
import { projectStaticRoutes } from "./static-routes.ts";

export type ProjectDistrictRouteRegistry = NonNullable<
	UrlGrammarInput["districtSlugsByGeoCategory"]
>;

export function createProjectUrlGrammar(
	profile: SiteProfile,
	districtSlugsByGeoCategory: ProjectDistrictRouteRegistry = {},
) {
	const geoSlugs = Object.keys(profile.geos);
	const facetSlugsByGeoCategory: Record<string, Record<string, string[]>> = {};
	for (const [slug, facet] of Object.entries(profile.seoFacets)) {
		if (!facetSlugsByGeoCategory[facet.geo]) {
			facetSlugsByGeoCategory[facet.geo] = {};
		}
		const byCategory = facetSlugsByGeoCategory[facet.geo];
		if (!byCategory[facet.category]) byCategory[facet.category] = [];
		byCategory[facet.category].push(slug);
	}

	return createUrlGrammar({
		geoSlugs,
		staticPaths: projectStaticRoutes
			.map((route) => route.path)
			.filter((path) => path !== "/"),
		moduleRootSlugs: Object.values(profile.modules).flatMap(
			(module) => module.reservedRoots,
		),
		districtSlugsByGeoCategory,
		facetSlugsByGeoCategory,
	});
}
