import {
	createUrlGrammar,
	type UrlGrammarInput,
} from "../core/routing/index.ts";
import type { SiteProfile } from "../core/profile/index.ts";
import { projectStaticRoutes } from "./static-routes.ts";

export const projectDistrictSlugFixtures = {
	primorsk: ["severnyy"],
	zarechnyy: ["tsentralnyy"],
} as const;

export const projectFacetSlugFixtures = {
	primorsk: {
		kvartiry: ["dvukhkomnatnye"],
		doma: ["s-gazom"],
	},
	zarechnyy: {
		kvartiry: ["odnokomnatnye"],
	},
} as const;

export function createProjectUrlGrammar(profile: SiteProfile) {
	const geoSlugs = Object.keys(profile.geos);
	const districtSlugsByGeo = Object.fromEntries(
		geoSlugs.map((geo) => [
			geo,
			projectDistrictSlugFixtures[
				geo as keyof typeof projectDistrictSlugFixtures
			] ?? [],
		]),
	) as UrlGrammarInput["districtSlugsByGeo"];
	const facetSlugsByGeoCategory = Object.fromEntries(
		geoSlugs.map((geo) => [
			geo,
			projectFacetSlugFixtures[geo as keyof typeof projectFacetSlugFixtures] ??
				{},
		]),
	) as UrlGrammarInput["facetSlugsByGeoCategory"];

	return createUrlGrammar({
		geoSlugs,
		staticPaths: projectStaticRoutes
			.map((route) => route.path)
			.filter((path) => path !== "/"),
		districtSlugsByGeo,
		facetSlugsByGeoCategory,
	});
}
