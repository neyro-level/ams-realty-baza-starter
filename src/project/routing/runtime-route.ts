import "server-only";

import { cache } from "react";
import type {
	DeveloperCardDTO,
	DeveloperDetailsDTO,
	DevelopmentCardDTO,
	DevelopmentDetailsDTO,
	GeoHubDTO,
	ListingPageDTO,
	PropertyDetailsDTO,
} from "@ams/realtbase-contracts";
import {
	createRouteResolver,
	type PageKey,
	type ResolverDataPort,
	type ResolverPageRecord,
	type ResolverResult,
} from "@/core/routing";
import { resolveEntityPageLifecycle } from "@/core/lifecycle/entity-lifecycle";
import { createProjectUrlGrammar } from "@/project/url-grammar";
import { siteProfile } from "@/project/site-profile";
import { getOptionalPublicGatewayPayload } from "@/project/data-access/public/payload";
import {
	countInventory,
	getDeveloper,
	getDevelopment,
	getGeoHub,
	getListing,
	getPropertyByPublicUrlId,
	listDevelopments,
	listGeoDevelopers,
} from "@/project/data-access/public/geo-catalog";
import { findPublicEntityLifecycle } from "@/project/data-access/public/entity-lifecycle";
import { findPublicRedirectByFromPath } from "@/project/data-access/public/payload-reads";
import { createFixtureResolverDataPort } from "@/fixture/resolver";
import { geoCatalogContractFixtures } from "@/fixture/geo-catalog";
import {
	fixtureProperties,
	getFixtureProperty,
} from "@/fixture/provider";

export type RuntimeRouteData =
	| { kind: "geoHub"; value: GeoHubDTO }
	| { kind: "listing"; value: ListingPageDTO }
	| { kind: "developers"; value: readonly DeveloperCardDTO[] }
	| {
			kind: "developer";
			value: DeveloperDetailsDTO;
			developments: readonly DevelopmentCardDTO[];
	  }
	| { kind: "development"; value: DevelopmentDetailsDTO }
	| { kind: "property"; value: PropertyDetailsDTO };

export type RuntimeRouteResolution = {
	decision: ResolverResult;
	data?: RuntimeRouteData;
};

const grammar = createProjectUrlGrammar(siteProfile);

async function resolveFixtureRuntimeRoute(
	pathname: string,
): Promise<RuntimeRouteResolution> {
	const catalogRoot = { kind: "categoryRoot", category: "kvartiry" } as const;
	const geoListing = geoCatalogContractFixtures.listing.pageKey as PageKey;
	const pages: PageKey[] = [
		{ kind: "geoHub", geo: siteProfile.primaryGeo },
		catalogRoot,
		geoListing,
		{ kind: "geoDevelopers", geo: siteProfile.primaryGeo },
		{ kind: "developerRoot" },
		geoCatalogContractFixtures.developer.pageKey as PageKey,
		geoCatalogContractFixtures.development.pageKey as PageKey,
		...fixtureProperties.map((property) => property.pageKey as PageKey),
	];
	const port = createFixtureResolverDataPort({
		grammar,
		pages: pages.map((pageKey) => ({
			pageKey,
			inventory: 100,
			record: {
				lifecycle: "active",
				...(pageKey.kind === "property"
					? { market: "secondary" as const }
					: {}),
			},
		})),
	});
	const decision = await createRouteResolver({
		profile: siteProfile,
		grammar,
		port,
	}).resolvePath(pathname);
	if (decision.kind !== "page") return { decision };
	const pageKey = decision.pageKey;
	let data: RuntimeRouteData | undefined;
	if (pageKey.kind === "geoHub") {
		data = { kind: "geoHub", value: geoCatalogContractFixtures.geoHub };
	} else if (
		pageKey.kind === "categoryRoot" ||
		pageKey.kind === "categoryGeo"
	) {
		data = {
			kind: "listing",
			value: {
				...geoCatalogContractFixtures.listing,
				pageKey,
				href: decision.canonicalPath,
				canonical: decision.canonicalPath,
				seo: {
					...geoCatalogContractFixtures.listing.seo,
					canonicalPath: decision.canonicalPath,
				},
			},
		};
	} else if (
		pageKey.kind === "developerRoot" ||
		pageKey.kind === "geoDevelopers"
	) {
		data = {
			kind: "developers",
			value: [geoCatalogContractFixtures.developer],
		};
	} else if (pageKey.kind === "developer") {
		data = {
			kind: "developer",
			value: geoCatalogContractFixtures.developer,
			developments: [geoCatalogContractFixtures.development],
		};
	} else if (pageKey.kind === "development") {
		data = {
			kind: "development",
			value: geoCatalogContractFixtures.development,
		};
	} else if (pageKey.kind === "property") {
		const property = fixtureProperties.find(
			(candidate) => candidate.publicUrlId === pageKey.publicUrlId,
		);
		const details = property ? await getFixtureProperty(property.slug) : null;
		if (details) data = { kind: "property", value: details };
	}
	return { decision, ...(data ? { data } : {}) };
}

function entityType(pageKey: PageKey) {
	if (pageKey.kind === "property") return "property" as const;
	if (pageKey.kind === "development") return "development" as const;
	if (pageKey.kind === "developer") return "developer" as const;
	return null;
}

function lifecycleRecord(
	lifecycle: ReturnType<typeof resolveEntityPageLifecycle>,
	canonicalPageKey?: PageKey,
): ResolverPageRecord | null {
	switch (lifecycle.kind) {
		case "missing":
			return null;
		case "gone":
			return { lifecycle: "purged", canonicalPageKey };
		case "redirect":
			return {
				lifecycle: "purged",
				canonicalPageKey,
				replacementPageKey: grammar.parseUrl(lifecycle.destination) ?? undefined,
			};
		case "archived":
			return { lifecycle: "archived", canonicalPageKey };
		case "active":
			return { lifecycle: "active", canonicalPageKey };
	}
}

function listingInput(pageKey: Extract<PageKey, { kind: `category${string}` }>) {
	return {
		geo: "geo" in pageKey ? pageKey.geo : siteProfile.primaryGeo,
		surface: pageKey.category,
		...(pageKey.kind === "categoryGeoDistrict"
			? { district: pageKey.district }
			: {}),
		...(pageKey.kind === "categoryGeoFacet" ? { facet: pageKey.facet } : {}),
	};
}

export const resolveRuntimeRoute = cache(
	async (pathname: string): Promise<RuntimeRouteResolution> => {
		const payload = await getOptionalPublicGatewayPayload();
		if (!payload) return resolveFixtureRuntimeRoute(pathname);

		const data = new Map<string, RuntimeRouteData>();
		const inventory = new Map<string, number>();
		const keyOf = (pageKey: PageKey) => grammar.buildUrl(pageKey);

		const port: ResolverDataPort = {
			async findRedirect(path) {
				const redirect = await findPublicRedirectByFromPath(payload, path);
				return redirect ? { destinationPath: redirect.to } : null;
			},
			async countInventory(pageKey) {
				const key = keyOf(pageKey);
				const known = inventory.get(key);
				if (known !== undefined) return known;
				if (
					pageKey.kind === "categoryRoot" ||
					pageKey.kind === "categoryGeo" ||
					pageKey.kind === "categoryGeoDistrict" ||
					pageKey.kind === "categoryGeoFacet"
				) {
					const input = listingInput(pageKey);
					return countInventory(payload, {
						geo: input.geo,
						surface: input.surface,
						...(input.district ? { district: input.district } : {}),
					});
				}
				return 100;
			},
			async lookupPage(pageKey) {
				const key = keyOf(pageKey);
				if (pageKey.kind === "home" || pageKey.kind === "static") {
					return { lifecycle: "active" };
				}
				if (pageKey.kind === "geoHub") {
					const hub = await getGeoHub(payload, pageKey.geo);
					if (!hub) return null;
					data.set(key, { kind: "geoHub", value: hub });
					return { lifecycle: "active", geo: pageKey.geo };
				}
				if (
					pageKey.kind === "categoryRoot" ||
					pageKey.kind === "categoryGeo" ||
					pageKey.kind === "categoryGeoDistrict" ||
					pageKey.kind === "categoryGeoFacet"
				) {
					const listing = await getListing(payload, listingInput(pageKey));
					if (!listing) return null;
					data.set(key, { kind: "listing", value: { ...listing, pageKey, href: key } });
					inventory.set(key, listing.total);
					return { lifecycle: "active", geo: listingInput(pageKey).geo };
				}
				if (pageKey.kind === "geoDevelopers" || pageKey.kind === "developerRoot") {
					const geo = pageKey.kind === "geoDevelopers" ? pageKey.geo : siteProfile.primaryGeo;
					const developers = await listGeoDevelopers(payload, geo);
					data.set(key, { kind: "developers", value: developers });
					inventory.set(key, developers.length);
					return { lifecycle: "active", geo };
				}

				const type = entityType(pageKey);
				if (!type) return null;
				const requestedCanonicalPath = grammar.buildUrl(pageKey);
				const lifecycle = resolveEntityPageLifecycle(
					await findPublicEntityLifecycle({
						payload,
						entityType: type,
						...(pageKey.kind === "property"
							? { publicUrlId: pageKey.publicUrlId }
							: { slug: pageKey.slug }),
						canonicalPath: requestedCanonicalPath,
					}),
				);
				if (lifecycle.kind === "missing") return null;
				if (lifecycle.kind === "gone" || lifecycle.kind === "redirect") {
					return lifecycleRecord(lifecycle);
				}

				let routeData: RuntimeRouteData;
				let canonicalPageKey: PageKey;
				if (pageKey.kind === "property") {
					const property = await getPropertyByPublicUrlId(payload, pageKey.publicUrlId);
					if (!property) return null;
					canonicalPageKey = property.pageKey as PageKey;
					routeData = { kind: "property", value: property };
				} else if (pageKey.kind === "development") {
					const development = await getDevelopment(payload, pageKey.slug);
					if (!development) return null;
					canonicalPageKey = development.pageKey as PageKey;
					routeData = { kind: "development", value: development };
				} else {
					const developer = await getDeveloper(payload, pageKey.slug);
					if (!developer) return null;
					canonicalPageKey = developer.pageKey as PageKey;
					routeData = {
						kind: "developer",
						value: developer,
						developments: await listDevelopments(payload, {
							geo: siteProfile.primaryGeo,
							limit: 48,
						}),
					};
				}
				const record = lifecycleRecord(lifecycle, canonicalPageKey);
				if (record) data.set(key, routeData);
				return record;
			},
		};

		const decision = await createRouteResolver({
			profile: siteProfile,
			grammar,
			port,
		}).resolvePath(pathname);
		return {
			decision,
			...(decision.kind === "page" ? { data: data.get(decision.canonicalPath) } : {}),
		};
	},
);
