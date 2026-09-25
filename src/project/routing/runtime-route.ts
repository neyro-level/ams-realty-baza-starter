import "server-only";

import type {
	DeveloperCardDTO,
	DeveloperDetailsDTO,
	DevelopmentCardDTO,
	DevelopmentDetailsDTO,
	GeoHubDTO,
	ListingPageDTO,
	PropertyDetailsDTO,
} from "@ams/realtbase-contracts";
import { cache } from "react";
import { resolveEntityPageLifecycle } from "@/core/lifecycle/entity-lifecycle";
import {
	createRouteResolver,
	type PageKey,
	type ResolverDataPort,
	type ResolverPageRecord,
	type ResolverResult,
} from "@/core/routing";
import { geoCatalogContractFixtures } from "@/fixture/geo-catalog";
import { fixtureProperties, getFixtureProperty } from "@/fixture/provider";
import { createFixtureResolverDataPort } from "@/fixture/resolver";
import { fixtureDistrictRouteRegistryFor } from "@/fixture/route-registries";
import { findPublicEntityLifecycle } from "@/project/data-access/public/entity-lifecycle";
import {
	countGeoInventory,
	countInventory,
	getDeveloper,
	getDevelopment,
	getDevelopmentRouteFacts,
	getGeoHub,
	getListing,
	getPropertyByPublicUrlId,
	getPropertyRouteFacts,
	listDevelopments,
	listGeoDevelopers,
} from "@/project/data-access/public/geo-catalog";
import { getOptionalPublicGatewayPayload } from "@/project/data-access/public/payload";
import { findPublicRedirectByFromPath } from "@/project/data-access/public/payload-reads";
import { getCachedDistrictRouteRegistry } from "@/project/routing/district-registry";
import { siteConfig } from "@/project/site.config";
import { siteProfile } from "@/project/site-profile";
import { createProjectUrlGrammar } from "@/project/url-grammar";

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

async function resolveFixtureRuntimeRoute(
	pathname: string,
): Promise<RuntimeRouteResolution> {
	const grammar = createProjectUrlGrammar(
		siteProfile,
		fixtureDistrictRouteRegistryFor(siteProfile),
	);
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
			inventory:
				pageKey.kind === "categoryRoot" ||
				pageKey.kind === "categoryGeo" ||
				pageKey.kind === "categoryGeoDistrict" ||
				pageKey.kind === "categoryGeoFacet"
					? geoCatalogContractFixtures.listing.total
					: 1,
			record: {
				lifecycle: "active",
				geo: "geo" in pageKey ? pageKey.geo : siteProfile.primaryGeo,
				market:
					pageKey.kind === "property"
						? "secondary"
						: pageKey.kind === "development"
							? "newbuild"
							: null,
				dataTier: pageKey.kind === "development" ? "B" : null,
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

async function resolveEmptyClientRuntimeRoute(
	pathname: string,
): Promise<RuntimeRouteResolution> {
	const grammar = createProjectUrlGrammar(siteProfile);
	const port = createFixtureResolverDataPort({ grammar, pages: [] });
	return {
		decision: await createRouteResolver({
			profile: siteProfile,
			grammar,
			port,
		}).resolvePath(pathname),
	};
}

function entityType(pageKey: PageKey) {
	if (pageKey.kind === "property") return "property" as const;
	if (pageKey.kind === "development") return "development" as const;
	if (pageKey.kind === "developer") return "developer" as const;
	return null;
}

function lifecycleRecord(
	lifecycle: ReturnType<typeof resolveEntityPageLifecycle>,
	grammar: ReturnType<typeof createProjectUrlGrammar>,
	facts: Pick<ResolverPageRecord, "geo" | "market" | "dataTier"> = {
		geo: null,
		market: null,
		dataTier: null,
	},
	canonicalPageKey?: PageKey,
): ResolverPageRecord | null {
	switch (lifecycle.kind) {
		case "missing":
			return null;
		case "gone":
			return { lifecycle: "purged", canonicalPageKey, ...facts };
		case "redirect":
			return {
				lifecycle: "purged",
				canonicalPageKey,
				...facts,
				replacementPageKey:
					grammar.parseUrl(lifecycle.destination) ?? undefined,
			};
		case "archived":
			return { lifecycle: "archived", canonicalPageKey, ...facts };
		case "active":
			return { lifecycle: "active", canonicalPageKey, ...facts };
	}
}

function listingInput(
	pageKey: Extract<PageKey, { kind: `category${string}` }>,
) {
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
		if (!payload) {
			return (siteConfig.projectKind as "starter-demo" | "client") === "client"
				? resolveEmptyClientRuntimeRoute(pathname)
				: resolveFixtureRuntimeRoute(pathname);
		}

		const grammar = createProjectUrlGrammar(
			siteProfile,
			await getCachedDistrictRouteRegistry(),
		);
		const data = new Map<string, RuntimeRouteData>();
		const inventory = new Map<string, number>();
		const keyOf = (pageKey: PageKey) => grammar.buildUrl(pageKey);

		const port: ResolverDataPort = {
			async findRedirect(path) {
				const redirect = await findPublicRedirectByFromPath(payload, path);
				return redirect?.statusCode === "301"
					? { destinationPath: redirect.to, statusCode: 301 }
					: null;
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
						...(input.facet ? { facet: input.facet } : {}),
					});
				}
				return inventory.get(key) ?? 0;
			},
			async lookupPage(pageKey) {
				const key = keyOf(pageKey);
				if (pageKey.kind === "home" || pageKey.kind === "static") {
					inventory.set(key, 0);
					return {
						lifecycle: "active",
						geo: null,
						market: null,
						dataTier: null,
					};
				}
				if (pageKey.kind === "geoHub") {
					const hub = await getGeoHub(payload, pageKey.geo, grammar);
					if (!hub) return null;
					data.set(key, { kind: "geoHub", value: hub });
					inventory.set(key, await countGeoInventory(payload, pageKey.geo));
					return {
						lifecycle: "active",
						geo: pageKey.geo,
						market: null,
						dataTier: null,
					};
				}
				if (
					pageKey.kind === "categoryRoot" ||
					pageKey.kind === "categoryGeo" ||
					pageKey.kind === "categoryGeoDistrict" ||
					pageKey.kind === "categoryGeoFacet"
				) {
					const listing = await getListing(
						payload,
						listingInput(pageKey),
						grammar,
					);
					if (!listing) return null;
					data.set(key, {
						kind: "listing",
						value: { ...listing, pageKey, href: key },
					});
					inventory.set(key, listing.total);
					return {
						lifecycle: "active",
						geo: listingInput(pageKey).geo,
						market: null,
						dataTier: null,
					};
				}
				if (
					pageKey.kind === "geoDevelopers" ||
					pageKey.kind === "developerRoot"
				) {
					const geo =
						pageKey.kind === "geoDevelopers"
							? pageKey.geo
							: siteProfile.primaryGeo;
					const developers = await listGeoDevelopers(payload, geo);
					data.set(key, { kind: "developers", value: developers });
					inventory.set(key, developers.length);
					return {
						lifecycle: "active",
						geo,
						market: null,
						dataTier: null,
					};
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
					return lifecycleRecord(lifecycle, grammar);
				}

				let routeData: RuntimeRouteData;
				let canonicalPageKey: PageKey;
				let facts: Pick<ResolverPageRecord, "geo" | "market" | "dataTier">;
				if (pageKey.kind === "property") {
					const [property, propertyFacts] = await Promise.all([
						getPropertyByPublicUrlId(payload, pageKey.publicUrlId),
						getPropertyRouteFacts(payload, pageKey.publicUrlId),
					]);
					if (!property || !propertyFacts) return null;
					canonicalPageKey = property.pageKey as PageKey;
					routeData = { kind: "property", value: property };
					facts = { ...propertyFacts, dataTier: null };
				} else if (pageKey.kind === "development") {
					const [development, developmentFacts] = await Promise.all([
						getDevelopment(payload, pageKey.slug),
						getDevelopmentRouteFacts(payload, pageKey.slug),
					]);
					if (!development || !developmentFacts) return null;
					canonicalPageKey = development.pageKey as PageKey;
					routeData = { kind: "development", value: development };
					facts = {
						geo: developmentFacts.geo,
						market: "newbuild",
						dataTier: developmentFacts.dataTier,
					};
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
					facts = { geo: null, market: null, dataTier: null };
				}
				inventory.set(
					key,
					routeData.kind === "developer"
						? routeData.value.developmentsCount
						: 1,
				);
				const record = lifecycleRecord(
					lifecycle,
					grammar,
					facts,
					canonicalPageKey,
				);
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
			...(decision.kind === "page"
				? { data: data.get(decision.canonicalPath) }
				: {}),
		};
	},
);
