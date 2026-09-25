import {
	catalogSurfaceSlugs,
	defineSiteProfile,
	isConfiguredRouteAvailable,
	type SitePreset,
	type SiteProfile,
} from "../core/profile/index.ts";
import { projectSiteProfileConfig } from "./site-profile.config.ts";
import type { ProjectSiteProfileConfig } from "./site-profile.config.types.ts";

const defaultFilterKeys: ProjectSiteProfileConfig["filterKeys"] = {
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

function defaultSeoFacets(
	geos: ProjectSiteProfileConfig["geos"],
): ProjectSiteProfileConfig["seoFacets"] {
	return {
		...(geos.primorsk
			? {
					dvukhkomnatnye: {
						geo: "primorsk",
						category: "kvartiry" as const,
						filter: { key: "rooms", value: [2] },
					},
				}
			: {}),
		...(geos.zarechnyy
			? {
					odnokomnatnye: {
						geo: "zarechnyy",
						category: "kvartiry" as const,
						filter: { key: "rooms", value: [1] },
					},
				}
			: {}),
	};
}

const defaultStaticRoutes: ProjectSiteProfileConfig["staticRoutes"] = [
	{ path: "/", changeFrequency: "daily", priority: 1, indexable: true },
	{
		path: "/nedvizhimost",
		changeFrequency: "daily",
		priority: 0.9,
		indexable: false,
	},
	{
		path: "/uslugi",
		changeFrequency: "weekly",
		priority: 0.7,
		indexable: true,
	},
	{
		path: "/o-kompanii",
		changeFrequency: "monthly",
		priority: 0.6,
		indexable: true,
	},
	{
		path: "/ipoteka",
		changeFrequency: "weekly",
		priority: 0.7,
		indexable: true,
	},
	{
		path: "/prodat",
		changeFrequency: "weekly",
		priority: 0.7,
		indexable: true,
	},
	{ path: "/sdat", changeFrequency: "weekly", priority: 0.7, indexable: true },
	{
		path: "/kontakty",
		changeFrequency: "monthly",
		priority: 0.6,
		indexable: true,
	},
	{
		path: "/politika-konfidencialnosti",
		changeFrequency: "yearly",
		priority: 0.2,
		indexable: false,
	},
	{
		path: "/soglasie-na-obrabotku-personalnyh-dannyh",
		changeFrequency: "yearly",
		priority: 0.2,
		indexable: false,
	},
];

const defaultModules: ProjectSiteProfileConfig["modules"] = {
	novostroyki: { state: "prepared", reservedRoots: ["komplex"] },
	journal: { state: "disabled", reservedRoots: ["journal"] },
	agents: { state: "disabled", reservedRoots: ["sotrudniki"] },
};

function surfaceStatuses(
	preset: SitePreset,
): ProjectSiteProfileConfig["categoryStatus"] {
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
	) as ProjectSiteProfileConfig["categoryStatus"];
}

function inactiveSurfaceStatuses(): ProjectSiteProfileConfig["categoryStatus"] {
	return Object.fromEntries(
		catalogSurfaceSlugs.map((surface) => [surface, "PREPARED_OFF"]),
	) as ProjectSiteProfileConfig["categoryStatus"];
}

export function createPresetSiteProfileConfig(input: {
	preset: SitePreset;
	geoMode: ProjectSiteProfileConfig["geoMode"];
	primaryGeo: string;
	geos: ProjectSiteProfileConfig["geos"];
}): ProjectSiteProfileConfig {
	const categoryStatus = surfaceStatuses(input.preset);
	const marketCapability = {
		newbuild: input.preset === "SECONDARY_FIRST" ? "PREPARED_OFF" : "ACTIVE",
		secondary: input.preset === "NEWBUILD_FIRST" ? "NOINDEX_AUTO" : "ACTIVE",
	} as const;
	const inactiveMarkets = {
		newbuild: "PREPARED_OFF",
		secondary: "PREPARED_OFF",
	} as const;
	const geoCategoryStatus = Object.fromEntries(
		Object.entries(input.geos).map(([geo, definition]) => [
			geo,
			isConfiguredRouteAvailable({ status: definition.hubStatus, inventory: 1 })
				? { ...categoryStatus }
				: inactiveSurfaceStatuses(),
		]),
	) as ProjectSiteProfileConfig["geoCategoryStatus"];
	const marketStatus = Object.fromEntries(
		Object.entries(input.geos).map(([geo, definition]) => [
			geo,
			isConfiguredRouteAvailable({ status: definition.hubStatus, inventory: 1 })
				? { ...marketCapability }
				: { ...inactiveMarkets },
		]),
	) as ProjectSiteProfileConfig["marketStatus"];
	const developersByGeo = Object.fromEntries(
		Object.entries(input.geos).map(([geo, definition]) => [
			geo,
			!isConfiguredRouteAvailable({
				status: definition.hubStatus,
				inventory: 1,
			})
				? "PREPARED_OFF"
				: input.preset === "SECONDARY_FIRST"
					? "NOINDEX_AUTO"
					: "ACTIVE",
		]),
	) as ProjectSiteProfileConfig["developersSurface"]["byGeo"];

	return {
		preset: input.preset,
		geoMode: input.geoMode,
		primaryGeo: input.primaryGeo,
		geos: input.geos,
		categoryStatus,
		marketCapability,
		geoCategoryStatus,
		marketStatus,
		developersSurface: {
			root: input.preset === "SECONDARY_FIRST" ? "NOINDEX_AUTO" : "ACTIVE",
			byGeo: developersByGeo,
		},
		filterKeys: defaultFilterKeys,
		seoFacets: defaultSeoFacets(input.geos),
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
		staticRoutes: defaultStaticRoutes,
		modules: defaultModules,
		entityPrefixes: {
			residentialComplex: "zhk-",
			cottageVillage: "kp-",
		},
	};
}

export function createProjectSiteProfile(
	input: ProjectSiteProfileConfig,
): SiteProfile {
	return defineSiteProfile(input);
}

function createFixtureProfile(input: {
	preset: SitePreset;
	geoMode: ProjectSiteProfileConfig["geoMode"];
}): SiteProfile {
	const geos: ProjectSiteProfileConfig["geos"] = {
		primorsk: { published: true, hubStatus: "ACTIVE" },
		...(input.geoMode === "MULTI_GEO"
			? {
					zarechnyy: {
						published: true,
						hubStatus: "NOINDEX_AUTO" as const,
						agglomerationOf: "primorsk",
					},
				}
			: {}),
	};
	return createProjectSiteProfile(
		createPresetSiteProfileConfig({
			preset: input.preset,
			geoMode: input.geoMode,
			primaryGeo: "primorsk",
			geos,
		}),
	);
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
	singleGeoThreeCities: createProjectSiteProfile(
		createPresetSiteProfileConfig({
			preset: "MIXED",
			geoMode: "SINGLE_GEO",
			primaryGeo: "primorsk",
			geos: {
				primorsk: { published: true, hubStatus: "ACTIVE" },
				zarechnyy: {
					published: true,
					hubStatus: "PREPARED_OFF",
					agglomerationOf: "primorsk",
				},
				beregovoy: { published: false, hubStatus: "PREPARED_OFF" },
			},
		}),
	),
} as const;

export const siteProfile = createProjectSiteProfile(projectSiteProfileConfig);
