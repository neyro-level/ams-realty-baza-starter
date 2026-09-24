import { z } from "zod";

export const profileStatuses = [
	"ACTIVE",
	"NOINDEX_AUTO",
	"PREPARED_OFF",
	"OUT",
] as const;
export const geoModes = ["SINGLE_GEO", "MULTI_GEO"] as const;
export const sitePresets = [
	"MIXED",
	"NEWBUILD_FIRST",
	"SECONDARY_FIRST",
] as const;
export const catalogSurfaceSlugs = [
	"kvartiry",
	"doma",
	"uchastki",
	"kommercheskaya-nedvizhimost",
	"komnaty",
	"garazhi",
	"arenda",
	"novostroyki",
	"kottedzhnye-poselki",
] as const;
export const markets = ["newbuild", "secondary"] as const;

export type ProfileStatus = (typeof profileStatuses)[number];
export type GeoMode = (typeof geoModes)[number];
export type SitePreset = (typeof sitePresets)[number];
export type CatalogSurfaceSlug = (typeof catalogSurfaceSlugs)[number];
export type Market = (typeof markets)[number];

export const catalogSurfaceMarketMatrix = {
	kvartiry: ["secondary", "newbuild"],
	doma: ["secondary"],
	uchastki: ["secondary"],
	"kommercheskaya-nedvizhimost": ["secondary"],
	komnaty: ["secondary"],
	garazhi: ["secondary"],
	arenda: ["secondary"],
	novostroyki: ["newbuild"],
	"kottedzhnye-poselki": ["newbuild"],
} as const satisfies Record<CatalogSurfaceSlug, readonly Market[]>;

const statusSchema = z.enum(profileStatuses);
const geoSlugSchema = z
	.string()
	.min(1)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Geo slug must be lowercase ASCII.");
const facetSchema = z
	.string()
	.min(1)
	.regex(/^[a-z][a-zA-Z0-9]*$/, "Facet key must be a stable identifier.");
const isoDateSchema = z.iso.date();

const surfaceStatusSchema = z.strictObject(
	Object.fromEntries(
		catalogSurfaceSlugs.map((surface) => [surface, statusSchema]),
	) as Record<CatalogSurfaceSlug, typeof statusSchema>,
);
const marketStatusSchema = z.strictObject({
	newbuild: statusSchema,
	secondary: statusSchema,
});
const facetWhitelistSchema = z.strictObject(
	Object.fromEntries(
		catalogSurfaceSlugs.map((surface) => [
			surface,
			z.array(facetSchema).max(20),
		]),
	) as Record<CatalogSurfaceSlug, z.ZodArray<typeof facetSchema>>,
);

const developmentGateSchema = z.strictObject({
	priceRowsMin: z.int().nonnegative(),
	mediaMin: z.int().nonnegative(),
	layoutsMin: z.int().nonnegative(),
	descriptionMinChars: z.int().nonnegative(),
	progressRequired: z.boolean(),
});

const siteProfileInputSchema = z.strictObject({
	preset: z.enum(sitePresets),
	geoMode: z.enum(geoModes),
	primaryGeo: geoSlugSchema,
	geos: z.record(
		geoSlugSchema,
		z.strictObject({
			published: z.boolean(),
			status: statusSchema,
			agglomerationOf: geoSlugSchema.optional(),
		}),
	),
	categoryStatus: surfaceStatusSchema,
	marketCapability: marketStatusSchema,
	geoCategoryStatus: z.record(geoSlugSchema, surfaceStatusSchema),
	marketStatus: z.record(geoSlugSchema, marketStatusSchema),
	defaultNearbyGeoStatus: statusSchema,
	developersSurface: z.strictObject({
		root: statusSchema,
		byGeo: z.record(geoSlugSchema, statusSchema),
	}),
	facetWhitelist: facetWhitelistSchema,
	seoTiers: z.strictObject({
		metric: z.literal("searchDemand"),
		snapshotDate: isoDateSchema,
		bands: z.strictObject({
			P1: z.number().nonnegative(),
			P2: z.number().nonnegative(),
			TEST: z.number().nonnegative(),
		}),
		minInventory: z.strictObject({
			P1: z.int().nonnegative(),
			P2: z.int().nonnegative(),
			TEST: z.int().nonnegative(),
		}),
		unmeasuredPolicy: z.enum(["NONE", "TEST"]),
	}),
	gate: z.strictObject({
		listingIntroMinChars: z.int().nonnegative(),
		propertyPhotosMin: z.int().nonnegative(),
		developmentA: developmentGateSchema,
		developmentB: developmentGateSchema,
		priceStaleDays: z.int().positive(),
		priceFailDays: z.int().positive(),
		developerGeoMin: z.int().nonnegative(),
		developerDescMinChars: z.int().nonnegative(),
	}),
	entityPrefixes: z.strictObject({
		residentialComplex: z.literal("zhk-"),
		cottageVillage: z.literal("kp-"),
	}),
});

function routeCanExist(status: ProfileStatus): boolean {
	return status === "ACTIVE" || status === "NOINDEX_AUTO";
}

export const siteProfileSchema = siteProfileInputSchema.superRefine(
	(profile, context) => {
		const geoSlugs = Object.keys(profile.geos);
		if (!profile.geos[profile.primaryGeo]) {
			context.addIssue({
				code: "custom",
				path: ["primaryGeo"],
				message: "primaryGeo must exist in geos.",
			});
		} else if (!profile.geos[profile.primaryGeo].published) {
			context.addIssue({
				code: "custom",
				path: ["primaryGeo"],
				message: "primaryGeo must be published.",
			});
		}
		if (profile.geoMode === "SINGLE_GEO" && geoSlugs.length !== 1) {
			context.addIssue({
				code: "custom",
				path: ["geos"],
				message: "SINGLE_GEO requires exactly one configured geo.",
			});
		}
		if (profile.geoMode === "MULTI_GEO" && geoSlugs.length < 2) {
			context.addIssue({
				code: "custom",
				path: ["geos"],
				message: "MULTI_GEO requires at least two configured geos.",
			});
		}

		for (const geo of geoSlugs) {
			const geoDefinition = profile.geos[geo];
			if (geoDefinition.agglomerationOf === geo) {
				context.addIssue({
					code: "custom",
					path: ["geos", geo, "agglomerationOf"],
					message: "A geo cannot aggregate into itself.",
				});
			} else if (
				geoDefinition.agglomerationOf &&
				!profile.geos[geoDefinition.agglomerationOf]
			) {
				context.addIssue({
					code: "custom",
					path: ["geos", geo, "agglomerationOf"],
					message: "agglomerationOf must reference a configured geo.",
				});
			}
			const geoCategories = profile.geoCategoryStatus[geo];
			const geoMarkets = profile.marketStatus[geo];
			const geoDevelopers = profile.developersSurface.byGeo[geo];
			if (!geoCategories || !geoMarkets || !geoDevelopers) {
				context.addIssue({
					code: "custom",
					path: ["geos", geo],
					message: "Every geo needs category, market and developer statuses.",
				});
				continue;
			}
			for (const surface of catalogSurfaceSlugs) {
				if (
					routeCanExist(geoCategories[surface]) &&
					!routeCanExist(profile.categoryStatus[surface])
				) {
					context.addIssue({
						code: "custom",
						path: ["geoCategoryStatus", geo, surface],
						message:
							"A geo surface cannot be enabled when its platform surface is disabled.",
					});
				}
			}
			for (const market of markets) {
				if (
					routeCanExist(geoMarkets[market]) &&
					!routeCanExist(profile.marketCapability[market])
				) {
					context.addIssue({
						code: "custom",
						path: ["marketStatus", geo, market],
						message:
							"A geo market cannot be enabled when its platform market is disabled.",
					});
				}
			}
			if (
				routeCanExist(geoDevelopers) &&
				!routeCanExist(profile.developersSurface.root)
			) {
				context.addIssue({
					code: "custom",
					path: ["developersSurface", "byGeo", geo],
					message:
						"A geo developer surface cannot be enabled when its root is disabled.",
				});
			}
		}

		for (const matrixName of ["geoCategoryStatus", "marketStatus"] as const) {
			for (const geo of Object.keys(profile[matrixName])) {
				if (!profile.geos[geo]) {
					context.addIssue({
						code: "custom",
						path: [matrixName, geo],
						message: "Status matrices cannot contain an unknown geo.",
					});
				}
			}
		}
		for (const geo of Object.keys(profile.developersSurface.byGeo)) {
			if (!profile.geos[geo]) {
				context.addIssue({
					code: "custom",
					path: ["developersSurface", "byGeo", geo],
					message: "Developer statuses cannot contain an unknown geo.",
				});
			}
		}

		if (!(profile.seoTiers.bands.P1 > profile.seoTiers.bands.P2)) {
			context.addIssue({
				code: "custom",
				path: ["seoTiers", "bands"],
				message: "SEO tier bands must descend from P1 to P2.",
			});
		}
		if (profile.seoTiers.bands.TEST !== 0) {
			context.addIssue({
				code: "custom",
				path: ["seoTiers", "bands", "TEST"],
				message: "TEST tier baseline must be zero.",
			});
		}
		if (profile.gate.priceFailDays <= profile.gate.priceStaleDays) {
			context.addIssue({
				code: "custom",
				path: ["gate", "priceFailDays"],
				message: "priceFailDays must be greater than priceStaleDays.",
			});
		}
	},
);

export type SiteProfileInput = z.input<typeof siteProfileInputSchema>;
export type SiteProfile = z.output<typeof siteProfileSchema>;

export function defineSiteProfile(input: SiteProfileInput): SiteProfile {
	return siteProfileSchema.parse(input);
}

export function isConfiguredRouteAvailable(input: {
	status: ProfileStatus;
	inventory: number;
	minimumInventory: number;
}): boolean {
	if (input.status === "ACTIVE") return true;
	if (input.status === "NOINDEX_AUTO") {
		return input.inventory >= input.minimumInventory;
	}
	return false;
}

export function isGeoHubAvailable(input: {
	published: boolean;
	status: ProfileStatus;
	inventory: number;
	minimumInventory: number;
}): boolean {
	return (
		input.published &&
		isConfiguredRouteAvailable({
			status: input.status,
			inventory: input.inventory,
			minimumInventory: input.minimumInventory,
		})
	);
}
