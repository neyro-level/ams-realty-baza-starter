import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const clonePresets = ["MIXED", "NEWBUILD_FIRST", "SECONDARY_FIRST"];

export const catalogSurfaces = [
	"kvartiry",
	"doma",
	"uchastki",
	"kommercheskaya-nedvizhimost",
	"komnaty",
	"garazhi",
	"arenda",
	"novostroyki",
	"kottedzhnye-poselki",
];

const requiredNap = ["phone", "email", "address", "workingHours"];
const requiredMorphology = ["nominative", "genitive", "prepositional"];

function requiredString(value, label) {
	if (typeof value !== "string" || !value.trim()) {
		throw new Error(`Clone preset requires ${label}.`);
	}
	return value.trim();
}

function assertSlug(value, label) {
	const slug = requiredString(value, label);
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new Error(`${label} must be a lowercase URL slug.`);
	}
	return slug;
}

export function activeSurfacesForPreset(preset) {
	if (preset === "NEWBUILD_FIRST") {
		return ["novostroyki", "kottedzhnye-poselki"];
	}
	if (preset === "SECONDARY_FIRST") {
		return catalogSurfaces.filter(
			(surface) => !["novostroyki", "kottedzhnye-poselki"].includes(surface),
		);
	}
	return [...catalogSurfaces];
}

const platformReservedRoots = [
	"_next",
	"admin",
	"api",
	"journal",
	"legal",
	"media",
	"poisk",
	"sotrudniki",
	"komplex",
	"robots.txt",
	"sitemap.xml",
	"sitemap",
	"search",
];

const staticRoutes = [
	{ path: "/", changeFrequency: "daily", priority: 1, indexable: true },
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

const modules = {
	novostroyki: { state: "prepared", reservedRoots: ["komplex"] },
	journal: { state: "disabled", reservedRoots: ["journal"] },
	agents: { state: "disabled", reservedRoots: ["sotrudniki"] },
};

const filterKeys = {
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

function seoFacetsForPreset(preset) {
	return {
		dvukhkomnatnye: {
			geo: preset.primaryGeo,
			category: "kvartiry",
			filter: { key: "rooms", value: [2] },
		},
	};
}

function surfaceStatusesForPreset(preset) {
	return Object.fromEntries(
		catalogSurfaces.map((surface) => {
			if (preset === "NEWBUILD_FIRST") {
				return [
					surface,
					["novostroyki", "kottedzhnye-poselki"].includes(surface)
						? "ACTIVE"
						: "NOINDEX_AUTO",
				];
			}
			if (preset === "SECONDARY_FIRST") {
				return [
					surface,
					["novostroyki", "kottedzhnye-poselki"].includes(surface)
						? "PREPARED_OFF"
						: "ACTIVE",
				];
			}
			return [surface, "ACTIVE"];
		}),
	);
}

export function siteProfileConfigForPreset(preset) {
	const categoryStatus = surfaceStatusesForPreset(preset.preset);
	const marketCapability = {
		newbuild: preset.preset === "SECONDARY_FIRST" ? "PREPARED_OFF" : "ACTIVE",
		secondary: preset.preset === "NEWBUILD_FIRST" ? "NOINDEX_AUTO" : "ACTIVE",
	};
	const geos = Object.fromEntries(
		preset.geos.map((geo) => [
			geo.slug,
			{
				published: true,
				hubStatus: geo.slug === preset.primaryGeo ? "ACTIVE" : "NOINDEX_AUTO",
				...(geo.agglomerationOf
					? { agglomerationOf: geo.agglomerationOf }
					: {}),
			},
		]),
	);
	const geoCategoryStatus = Object.fromEntries(
		preset.geos.map((geo) => [geo.slug, { ...categoryStatus }]),
	);
	const marketStatus = Object.fromEntries(
		preset.geos.map((geo) => [geo.slug, { ...marketCapability }]),
	);
	const developerStatus =
		preset.preset === "SECONDARY_FIRST" ? "NOINDEX_AUTO" : "ACTIVE";

	return {
		preset: preset.preset,
		geoMode: preset.geoMode,
		primaryGeo: preset.primaryGeo,
		geos,
		categoryStatus,
		marketCapability,
		geoCategoryStatus,
		marketStatus,
		developersSurface: {
			root: developerStatus,
			byGeo: Object.fromEntries(
				preset.geos.map((geo) => [geo.slug, developerStatus]),
			),
		},
		filterKeys,
		seoFacets: seoFacetsForPreset(preset),
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
		staticRoutes,
		modules,
		entityPrefixes: { residentialComplex: "zhk-", cottageVillage: "kp-" },
	};
}

export function reservedRootsForSiteProfile(config) {
	return [
		...new Set([
			...platformReservedRoots,
			...catalogSurfaces,
			"zastroyshchiki",
			...config.staticRoutes
				.map((route) => route.path.split("/").filter(Boolean)[0])
				.filter(Boolean),
			...Object.values(config.modules).flatMap(
				(module) => module.reservedRoots,
			),
		]),
	].sort();
}

export function readClonePreset(file) {
	const path = resolve(file);
	if (!existsSync(path))
		throw new Error(`Clone preset does not exist: ${path}`);
	const preset = JSON.parse(readFileSync(path, "utf8"));
	if (preset.schemaVersion !== 1)
		throw new Error("Clone preset schemaVersion must be 1.");
	if (!clonePresets.includes(preset.preset))
		throw new Error("Unsupported clone preset.");
	if (!["SINGLE_GEO", "MULTI_GEO"].includes(preset.geoMode)) {
		throw new Error("geoMode must be SINGLE_GEO or MULTI_GEO.");
	}
	preset.projectId = requiredString(preset.projectId, "projectId");
	preset.packageName = requiredString(preset.packageName, "packageName");
	if (!/^[a-z0-9][a-z0-9._-]*$/.test(preset.packageName)) {
		throw new Error("packageName must be a lowercase npm package name.");
	}
	preset.brandName = requiredString(preset.brandName, "brandName");
	preset.defaultDescription = requiredString(
		preset.defaultDescription,
		"defaultDescription",
	);
	preset.domain = requiredString(preset.domain, "domain").toLowerCase();
	if (!/^[a-z0-9.-]+$/.test(preset.domain))
		throw new Error("domain is invalid.");
	if (!["public", "noindex"].includes(preset.productionIndexing)) {
		throw new Error("productionIndexing must be public or noindex.");
	}
	preset.primaryGeo = assertSlug(preset.primaryGeo, "primaryGeo");
	if (!Array.isArray(preset.geos) || preset.geos.length === 0) {
		throw new Error("Clone preset requires at least one geo.");
	}
	if (preset.geoMode === "SINGLE_GEO" && preset.geos.length !== 1) {
		throw new Error("SINGLE_GEO preset must contain exactly one geo.");
	}
	const slugs = new Set();
	for (const geo of preset.geos) {
		geo.slug = assertSlug(geo.slug, "geo.slug");
		if (slugs.has(geo.slug)) throw new Error(`Duplicate geo slug: ${geo.slug}`);
		slugs.add(geo.slug);
		requiredString(geo.title, `geo ${geo.slug} title`);
		if (geo.morphologyApproved !== true) {
			throw new Error(
				`Geo ${geo.slug} morphology must be explicitly approved.`,
			);
		}
		for (const key of requiredMorphology) {
			requiredString(
				geo.morphology?.[key],
				`geo ${geo.slug} morphology.${key}`,
			);
		}
		if (
			geo.agglomerationOf &&
			!preset.geos.some((item) => item.slug === geo.agglomerationOf)
		) {
			throw new Error(`Geo ${geo.slug} has unknown agglomerationOf.`);
		}
	}
	if (!slugs.has(preset.primaryGeo))
		throw new Error("primaryGeo is absent from geos.");
	for (const key of requiredNap)
		requiredString(preset.nap?.[key], `nap.${key}`);
	if (preset.brandAssets?.status !== "ready") {
		throw new Error("brandAssets.status must be ready.");
	}
	requiredString(preset.brandAssets.logoPath, "brandAssets.logoPath");
	requiredString(preset.brandAssets.tokenSource, "brandAssets.tokenSource");
	if (preset.feed?.status !== "ready")
		throw new Error("feed.status must be ready.");
	if (preset.developmentExcel?.status !== "ready") {
		throw new Error("developmentExcel.status must be ready.");
	}
	return preset;
}

export function clonePresetHash(preset) {
	return createHash("sha256").update(JSON.stringify(preset)).digest("hex");
}

export function renderSiteProfileConfig(preset) {
	return `import type { ProjectSiteProfileConfig } from "./site-profile.config.types.ts";\n\nexport const projectSiteProfileConfig = ${JSON.stringify(
		siteProfileConfigForPreset(preset),
		null,
		"\t",
	)} as const satisfies ProjectSiteProfileConfig;\n`;
}

export function buildCloneBootstrap(preset, reservedRoots, presetSha) {
	const activeSurfaces = activeSurfacesForPreset(preset.preset);
	return {
		schemaVersion: 1,
		presetSha,
		projectId: preset.projectId,
		packageName: preset.packageName,
		domain: preset.domain,
		preset: preset.preset,
		geoMode: preset.geoMode,
		primaryGeo: preset.primaryGeo,
		geos: preset.geos,
		nap: { brandName: preset.brandName, ...preset.nap },
		seoRegistry: {
			activeSurfaces,
			rows: activeSurfaces.flatMap((surface) =>
				preset.geos.map((geo) => ({
					surface,
					geo: geo.slug,
					morphologyApproved: geo.morphologyApproved,
					status: "draft",
				})),
			),
		},
		brandAssets: preset.brandAssets,
		feed: preset.feed,
		developmentExcel: preset.developmentExcel,
		reservedRoots,
		catalogSurfaces,
		productionIndexing: preset.productionIndexing,
		fixtureData: "cleared",
	};
}

export function validateCloneBootstrap(root) {
	const bootstrapPath = resolve(root, "docs", "CLIENT_BOOTSTRAP.json");
	if (!existsSync(bootstrapPath))
		throw new Error("docs/CLIENT_BOOTSTRAP.json is missing.");
	const value = JSON.parse(readFileSync(bootstrapPath, "utf8"));
	if (value.schemaVersion !== 1 || value.fixtureData !== "cleared") {
		throw new Error("Client fixture data is not explicitly cleared.");
	}
	if (!clonePresets.includes(value.preset))
		throw new Error("Bootstrap preset is invalid.");
	requiredString(value.packageName, "bootstrap packageName");
	requiredString(value.domain, "bootstrap domain");
	if (!["public", "noindex"].includes(value.productionIndexing)) {
		throw new Error("Bootstrap indexing decision is missing.");
	}
	for (const geo of value.geos ?? []) {
		if (geo.morphologyApproved !== true)
			throw new Error(`Geo ${geo.slug} morphology is not approved.`);
		for (const key of requiredMorphology)
			requiredString(
				geo.morphology?.[key],
				`geo ${geo.slug} morphology.${key}`,
			);
	}
	for (const key of ["brandName", ...requiredNap])
		requiredString(value.nap?.[key], `nap.${key}`);
	const expectedSurfaces = activeSurfacesForPreset(value.preset);
	if (
		JSON.stringify(value.seoRegistry?.activeSurfaces) !==
		JSON.stringify(expectedSurfaces)
	) {
		throw new Error("SEO registry active surfaces do not match the preset.");
	}
	for (const surface of expectedSurfaces) {
		for (const geo of value.geos) {
			if (
				!value.seoRegistry.rows.some(
					(row) =>
						row.surface === surface &&
						row.geo === geo.slug &&
						row.morphologyApproved === true,
				)
			) {
				throw new Error(`SEO registry row missing for ${surface}/${geo.slug}.`);
			}
		}
	}
	if (
		value.brandAssets?.status !== "ready" ||
		value.feed?.status !== "ready" ||
		value.developmentExcel?.status !== "ready"
	) {
		throw new Error(
			"Brand, feed and development Excel onboarding must be ready.",
		);
	}
	const reserved = reservedRootsForSiteProfile(
		siteProfileConfigForPreset(value),
	);
	if (JSON.stringify(value.reservedRoots) !== JSON.stringify(reserved)) {
		throw new Error("Reserved-root agreement drifted from SiteProfile.");
	}
	return value;
}
