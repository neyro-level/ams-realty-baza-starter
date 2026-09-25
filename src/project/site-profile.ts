import {
	catalogSurfaceSlugs,
	defineSiteProfile,
	type SitePreset,
	type SiteProfile,
	type SiteProfileInput,
} from "../core/profile/index.ts";
import { projectSiteProfileConfig } from "./site-profile.config.ts";
import type { ProjectSiteProfileConfig } from "./site-profile.config.types.ts";

const defaultFacets: SiteProfileInput["facetWhitelist"] = {
	kvartiry: ["rooms", "district", "price", "area"],
	doma: ["district", "price", "area"],
	uchastki: ["district", "price", "area"],
	"kommercheskaya-nedvizhimost": ["district", "price", "area"],
	komnaty: ["rooms", "district", "price"],
	garazhi: ["district", "price"],
	arenda: ["rooms", "district", "price"],
	novostroyki: ["district", "developer", "completionYear"],
	"kottedzhnye-poselki": ["district", "developer"],
};

function surfaceStatuses(
	preset: SitePreset,
): SiteProfileInput["categoryStatus"] {
	return Object.fromEntries(
		catalogSurfaceSlugs.map((surface) => {
			if (preset === "NEWBUILD_FIRST") {
				return [
					surface,
					surface === "novostroyki" || surface === "kottedzhnye-poselki"
						? "ACTIVE"
						: "NOINDEX_AUTO",
				];
			}
			if (preset === "SECONDARY_FIRST") {
				return [
					surface,
					surface === "novostroyki" || surface === "kottedzhnye-poselki"
						? "PREPARED_OFF"
						: "ACTIVE",
				];
			}
			return [surface, "ACTIVE"];
		}),
	) as SiteProfileInput["categoryStatus"];
}

function createFixtureProfile(input: {
	preset: SitePreset;
	geoMode: "SINGLE_GEO" | "MULTI_GEO";
}): SiteProfile {
	const geos = {
		primorsk: { published: true, status: "ACTIVE" },
		...(input.geoMode === "MULTI_GEO"
			? {
					zarechnyy: {
						published: true,
						status: "NOINDEX_AUTO" as const,
						agglomerationOf: "primorsk",
					},
				}
			: {}),
	} as SiteProfileInput["geos"];
	return createProjectSiteProfile({
		preset: input.preset,
		geoMode: input.geoMode,
		primaryGeo: "primorsk",
		geos,
	});
}

export function createProjectSiteProfile(
	input: ProjectSiteProfileConfig,
): SiteProfile {
	const geos = input.geos as SiteProfileInput["geos"];
	const categoryStatus = surfaceStatuses(input.preset);
	const marketCapability = {
		newbuild: input.preset === "SECONDARY_FIRST" ? "PREPARED_OFF" : "ACTIVE",
		secondary: input.preset === "NEWBUILD_FIRST" ? "NOINDEX_AUTO" : "ACTIVE",
	} as const;
	const geoCategoryStatus = Object.fromEntries(
		Object.keys(geos).map((geo) => [geo, { ...categoryStatus }]),
	) as SiteProfileInput["geoCategoryStatus"];
	const marketStatus = Object.fromEntries(
		Object.keys(geos).map((geo) => [geo, { ...marketCapability }]),
	) as SiteProfileInput["marketStatus"];
	const developersByGeo = Object.fromEntries(
		Object.keys(geos).map((geo) => [
			geo,
			input.preset === "SECONDARY_FIRST" ? "NOINDEX_AUTO" : "ACTIVE",
		]),
	) as SiteProfileInput["developersSurface"]["byGeo"];

	return defineSiteProfile({
		preset: input.preset,
		geoMode: input.geoMode,
		primaryGeo: input.primaryGeo,
		geos,
		categoryStatus,
		marketCapability,
		geoCategoryStatus,
		marketStatus,
		defaultNearbyGeoStatus: "NOINDEX_AUTO",
		developersSurface: {
			root: input.preset === "SECONDARY_FIRST" ? "NOINDEX_AUTO" : "ACTIVE",
			byGeo: developersByGeo,
		},
		facetWhitelist: defaultFacets,
		seoTiers: {
			metric: "searchDemand",
			snapshotDate: "2026-09-24",
			bands: { P1: 100, P2: 50, TEST: 0 },
			minInventory: { P1: 5, P2: 5, TEST: 10 },
			unmeasuredPolicy: "TEST",
		},
		gate: {
			listingIntroMinChars: 600,
			propertyPhotosMin: 3,
			developmentA: {
				priceRowsMin: 2,
				mediaMin: 8,
				layoutsMin: 1,
				descriptionMinChars: 1500,
				progressRequired: true,
			},
			developmentB: {
				priceRowsMin: 1,
				mediaMin: 3,
				layoutsMin: 0,
				descriptionMinChars: 600,
				progressRequired: false,
			},
			priceStaleDays: 45,
			priceFailDays: 120,
			developerGeoMin: 5,
			developerDescMinChars: 600,
		},
		entityPrefixes: {
			residentialComplex: "zhk-",
			cottageVillage: "kp-",
		},
	});
}

export const siteProfileFixtures = {
	singleGeo: createFixtureProfile({ preset: "MIXED", geoMode: "SINGLE_GEO" }),
	multiGeo: createFixtureProfile({ preset: "MIXED", geoMode: "MULTI_GEO" }),
	newbuildFirst: createFixtureProfile({
		preset: "NEWBUILD_FIRST",
		geoMode: "MULTI_GEO",
	}),
	secondaryFirst: createFixtureProfile({
		preset: "SECONDARY_FIRST",
		geoMode: "MULTI_GEO",
	}),
} as const;

export const siteProfile = createProjectSiteProfile(projectSiteProfileConfig);
