import {
	createUrlGrammar,
	type UrlGrammarInput,
} from "../core/routing/index.ts";
import type { SiteProfile } from "../core/profile/index.ts";
import { projectStaticRoutes } from "./static-routes.ts";

const fixtureDistricts = {
	primorsk: ["severnyy"],
	zarechnyy: ["tsentralnyy"],
} as const;

const fixtureFacets = {
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
			fixtureDistricts[geo as keyof typeof fixtureDistricts] ?? [],
		]),
	) as UrlGrammarInput["districtSlugsByGeo"];
	const facetSlugsByGeoCategory = Object.fromEntries(
		geoSlugs.map((geo) => [
			geo,
			fixtureFacets[geo as keyof typeof fixtureFacets] ?? {},
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
