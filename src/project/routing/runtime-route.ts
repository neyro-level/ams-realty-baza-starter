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
	type PageDecision,
	type ResolverDataPort,
	type ResolverPageRecord,
	type ResolverResult,
} from "@/core/routing";
import { geoCatalogContractFixtures } from "@/fixture/geo-catalog";
import { fixtureProperties, getFixtureProperty } from "@/fixture/provider";
import { createFixtureResolverDataPort } from "@/fixture/resolver";
import { fixtureDistrictRouteRegistryFor } from "@/fixture/route-registries";
import { findPublicEntityLifecycle } from "@/project/data-access/public/entity-lifecycle";
import { findPublicBrandName } from "@/project/data-access/public/nap";
import {
	countGeoInventory,
	countInventory,
	getDeveloper,
	getDeveloperRouteFacts,
	getDevelopment,
	getDevelopmentRouteFacts,
	getGeoHub,
	getListing,
	getPropertyByPublicUrlId,
	getPropertyRouteFacts,
	listAllDevelopments,
	listDeveloperDevelopments,
	listGeoDevelopers,
} from "@/project/data-access/public/geo-catalog";
import { getOptionalPublicGatewayPayload } from "@/project/data-access/public/payload";
import { findPublicRedirectByFromPath } from "@/project/data-access/public/payload-reads";
import { getCachedDistrictRouteRegistry } from "@/project/routing/district-registry";
import {
	catalogCanonicalPath,
	parseCatalogSearchParams,
	parsePageSearchParams,
	type CatalogSearchParams,
} from "@/project/routing/catalog-search-params";
import { siteConfig } from "@/project/site.config";
import { siteProfile } from "@/project/site-profile";
import { createProjectUrlGrammar } from "@/project/url-grammar";
import { decidePage } from "@/project/routing/content-gate";
import {
	projectSeoCategoryLabel,
	projectSeoMeta,
	renderProjectSeoTemplate,
} from "@/project/seo/templates";

export type RuntimeRouteData =
	| { kind: "geoHub"; value: GeoHubDTO }
	| {
			kind: "listing";
			value: ListingPageDTO;
			query?: CatalogSearchParams;
	  }
	| {
			kind: "developers";
			value: readonly DeveloperCardDTO[];
			developersWithPassingDevelopment: number;
	  }
	| {
			kind: "developer";
			value: DeveloperDetailsDTO;
			developments: readonly DevelopmentCardDTO[];
			pagination: { page: number; total: number; totalPages: number };
			hasPassingDevelopment: boolean;
			descriptionSource: string | null;
			descriptionCheckedAt: string | null;
	  }
	| {
			kind: "development";
			value: DevelopmentDetailsDTO;
			layoutCount: number;
			progressPresent: boolean;
	  }
	| { kind: "property"; value: PropertyDetailsDTO };

type RuntimeRouteDecision =
	| Exclude<ResolverResult, { kind: "page" }>
	| PageDecision;

export type RuntimeRouteResolution = {
	decision: RuntimeRouteDecision;
	data?: RuntimeRouteData;
	brandName?: string;
};

async function resolveFixtureRuntimeRoute(
	pathname: string,
	queryString: string,
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
	const catalogQuery =
		pageKey.kind === "categoryRoot" ||
		pageKey.kind === "categoryGeo" ||
		pageKey.kind === "categoryGeoDistrict" ||
		pageKey.kind === "categoryGeoFacet"
			? parseCatalogSearchParams(queryString)
			: null;
	const developerQuery =
		pageKey.kind === "developer" ? parsePageSearchParams(queryString) : null;
	if (queryString && !catalogQuery && !developerQuery) {
		return { decision: { kind: "notFound", statusCode: 404 } };
	}
	const city = geoCatalogContractFixtures.geoHub.city;
	const cityMorphology = {
		approved: true,
		nominative: city.name,
		genitive: city.nameGenitive ?? city.name,
		prepositional: city.nameLocative ?? city.name,
		preposition: city.preposition ?? ("в" as const),
	};
	let data: RuntimeRouteData | undefined;
	if (pageKey.kind === "geoHub") {
		const context = { brand: siteConfig.brandName, city: cityMorphology };
		data = {
			kind: "geoHub",
			value: {
				...geoCatalogContractFixtures.geoHub,
				title: renderProjectSeoTemplate("geoHub", context).h1,
				seo: projectSeoMeta("geoHub", context, decision.canonicalPath),
			},
		};
	} else if (
		pageKey.kind === "categoryRoot" ||
		pageKey.kind === "categoryGeo"
	) {
		const context = {
			brand: siteConfig.brandName,
			category: projectSeoCategoryLabel(pageKey.category),
			city: cityMorphology,
			inventory: geoCatalogContractFixtures.listing.total,
		};
		const templateKey =
			pageKey.kind === "categoryRoot" ? "categoryRoot" : "categoryGeo";
		data = {
			kind: "listing",
			...(catalogQuery ? { query: catalogQuery } : {}),
			value: {
				...geoCatalogContractFixtures.listing,
				pageKey,
				href: decision.canonicalPath,
				canonical: decision.canonicalPath,
				h1: renderProjectSeoTemplate(templateKey, context).h1,
				seo: projectSeoMeta(templateKey, context, decision.canonicalPath),
			},
		};
	} else if (
		pageKey.kind === "developerRoot" ||
		pageKey.kind === "geoDevelopers"
	) {
		data = {
			kind: "developers",
			value: [geoCatalogContractFixtures.developer],
			developersWithPassingDevelopment: 1,
		};
	} else if (pageKey.kind === "developer") {
		if (developerQuery && developerQuery.page > 1) {
			return { decision: { kind: "notFound", statusCode: 404 } };
		}
		data = {
			kind: "developer",
			value: geoCatalogContractFixtures.developer,
			developments: [geoCatalogContractFixtures.development],
			pagination: { page: 1, total: 1, totalPages: 1 },
			hasPassingDevelopment: true,
			descriptionSource: "fixture-owner-specification",
			descriptionCheckedAt: "2026-09-24T12:00:00.000Z",
		};
	} else if (pageKey.kind === "development") {
		data = {
			kind: "development",
			value: geoCatalogContractFixtures.development,
			layoutCount: 1,
			progressPresent: true,
		};
	} else if (pageKey.kind === "property") {
		const property = fixtureProperties.find(
			(candidate) => candidate.publicUrlId === pageKey.publicUrlId,
		);
		const details = property ? await getFixtureProperty(property.slug) : null;
		if (details) data = { kind: "property", value: details };
	}
	if (!data) return { decision: { kind: "notFound", statusCode: 404 } };
	const resolution: RuntimeRouteResolution = {
		decision: decidePage(decision, data),
		data,
		brandName: siteConfig.brandName,
	};
	if (data.kind === "listing" && catalogQuery?.queryString) {
		const canonicalPath = catalogCanonicalPath(
			decision.canonicalPath,
			catalogQuery,
		);
		return {
			...resolution,
			data: queryListingData(data, canonicalPath),
			decision: queryPageDecision(
				resolution.decision as PageDecision,
				canonicalPath,
			),
		};
	}
	return resolution;
}

async function resolveEmptyClientRuntimeRoute(
	pathname: string,
	queryString: string,
): Promise<RuntimeRouteResolution> {
	if (queryString) return { decision: { kind: "notFound", statusCode: 404 } };
	const grammar = createProjectUrlGrammar(siteProfile);
	const port = createFixtureResolverDataPort({ grammar, pages: [] });
	const decision = await createRouteResolver({
		profile: siteProfile,
		grammar,
		port,
	}).resolvePath(pathname);
	return {
		decision:
			decision.kind === "page"
				? { kind: "notFound", statusCode: 404 }
				: decision,
	};
}

function queryPageDecision(
	decision: PageDecision,
	canonicalPath: string,
): PageDecision {
	return {
		...decision,
		canonicalPath,
		robots: { indexing: "noindex", following: "follow" },
		inSitemap: false,
		indexNowEligible: false,
		visibleInMenu: false,
		visibleInInterlinks: false,
		gate: {
			...decision.gate,
			canonical: canonicalPath,
			indexing: "noindex",
			following: "follow",
			includeInSitemap: false,
			reasons: [...decision.gate.reasons, "query_variant_noindex"],
		},
	};
}

function queryListingData(
	data: Extract<RuntimeRouteData, { kind: "listing" }>,
	canonicalPath: string,
): Extract<RuntimeRouteData, { kind: "listing" }> {
	return {
		...data,
		value: {
			...data.value,
			canonical: canonicalPath,
			robots: { indexing: "noindex", following: "follow" },
			seo: {
				...data.value.seo,
				canonicalPath,
				indexing: "noindex",
				following: "follow",
			},
		},
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
	async (
		pathname: string,
		queryString = "",
	): Promise<RuntimeRouteResolution> => {
		const payload = await getOptionalPublicGatewayPayload();
		if (!payload) {
			return (siteConfig.projectKind as "starter-demo" | "client") === "client"
				? resolveEmptyClientRuntimeRoute(pathname, queryString)
				: resolveFixtureRuntimeRoute(pathname, queryString);
		}
		const publicPayload = payload;
		const brandName = await findPublicBrandName(publicPayload);

		const grammar = createProjectUrlGrammar(
			siteProfile,
			await getCachedDistrictRouteRegistry(),
		);
		const data = new Map<string, RuntimeRouteData>();
		const inventory = new Map<string, number>();
		const keyOf = (pageKey: PageKey) => grammar.buildUrl(pageKey);
		async function passingDevelopmentDeveloperIds(
			developments: readonly DevelopmentCardDTO[],
		): Promise<Set<string>> {
			const decisions = await Promise.all(
				developments.map(async (card) => {
					const [details, facts] = await Promise.all([
						getDevelopment(publicPayload, card.slug, brandName),
						getDevelopmentRouteFacts(publicPayload, card.slug),
					]);
					if (!details || !facts || !card.developer) return null;
					const pageKey = details.pageKey as PageKey;
					const resolved = await createRouteResolver({
						profile: siteProfile,
						grammar,
						port: createFixtureResolverDataPort({
							grammar,
							pages: [
								{
									pageKey,
									inventory: 1,
									record: {
										lifecycle: "active",
										geo: facts.geo,
										market: "newbuild",
										dataTier: facts.dataTier,
									},
								},
							],
						}),
					}).resolvePath(details.href);
					if (resolved.kind !== "page") return null;
					const decision = decidePage(resolved, {
						kind: "development",
						value: details,
						layoutCount: facts.layoutCount,
						progressPresent: facts.progressPresent,
					});
					return decision.robots.indexing === "index"
						? card.developer.id
						: null;
				}),
			);
			return new Set(decisions.filter((id): id is string => id !== null));
		}

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
					if (queryString) return null;
					inventory.set(key, 0);
					return {
						lifecycle: "active",
						geo: null,
						market: null,
						dataTier: null,
					};
				}
				if (pageKey.kind === "geoHub") {
					if (queryString) return null;
					const hub = await getGeoHub(payload, pageKey.geo, grammar, brandName);
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
					const catalogQuery = parseCatalogSearchParams(queryString);
					if (!catalogQuery) return null;
					const enabledFilters = siteProfile.filterKeys[pageKey.category];
					if (
						(catalogQuery.rooms && !enabledFilters.includes("rooms")) ||
						((catalogQuery.priceFromMinor || catalogQuery.priceToMinor) &&
							!enabledFilters.includes("price")) ||
						(catalogQuery.district && !enabledFilters.includes("district"))
					)
						return null;
					const listing = await getListing(
						payload,
						{
							...listingInput(pageKey),
							page: catalogQuery.page,
							query: {
								sort: catalogQuery.sort,
								...(catalogQuery.priceFromMinor
									? { priceFromMinor: catalogQuery.priceFromMinor }
									: {}),
								...(catalogQuery.priceToMinor
									? { priceToMinor: catalogQuery.priceToMinor }
									: {}),
								...(catalogQuery.rooms
									? { rooms: [...catalogQuery.rooms] }
									: {}),
								...(catalogQuery.district
									? { district: catalogQuery.district }
									: {}),
							},
						},
						grammar,
						siteProfile,
						brandName,
					);
					if (!listing) return null;
					data.set(key, {
						kind: "listing",
						value: { ...listing, pageKey, href: key },
						query: catalogQuery,
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
					if (queryString) return null;
					const [developers, developments] = await Promise.all([
						listGeoDevelopers(payload, geo),
						listAllDevelopments(payload, { geo }),
					]);
					const passingDeveloperIds =
						await passingDevelopmentDeveloperIds(developments);
					data.set(key, {
						kind: "developers",
						value: developers,
						developersWithPassingDevelopment: passingDeveloperIds.size,
					});
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
					if (queryString) return null;
					const [property, propertyFacts] = await Promise.all([
						getPropertyByPublicUrlId(payload, pageKey.publicUrlId),
						getPropertyRouteFacts(payload, pageKey.publicUrlId),
					]);
					if (!property || !propertyFacts) return null;
					canonicalPageKey = property.pageKey as PageKey;
					routeData = { kind: "property", value: property };
					facts = { ...propertyFacts, dataTier: null };
				} else if (pageKey.kind === "development") {
					if (queryString) return null;
					const [development, developmentFacts] = await Promise.all([
						getDevelopment(payload, pageKey.slug, brandName),
						getDevelopmentRouteFacts(payload, pageKey.slug),
					]);
					if (!development || !developmentFacts) return null;
					canonicalPageKey = development.pageKey as PageKey;
					routeData = {
						kind: "development",
						value: development,
						layoutCount: developmentFacts.layoutCount,
						progressPresent: developmentFacts.progressPresent,
					};
					facts = {
						geo: developmentFacts.geo,
						market: "newbuild",
						dataTier: developmentFacts.dataTier,
					};
				} else {
					const developerQuery = parsePageSearchParams(queryString);
					if (!developerQuery) return null;
					const [developer, developerFacts] = await Promise.all([
						getDeveloper(payload, pageKey.slug, brandName),
						getDeveloperRouteFacts(payload, pageKey.slug),
					]);
					if (!developer || !developerFacts) return null;
					const [developmentPage, ownDevelopments] = await Promise.all([
						listDeveloperDevelopments(payload, {
							developerId: Number(developer.id),
							page: developerQuery.page,
							limit: 24,
						}),
						listAllDevelopments(payload, {
							geo: siteProfile.primaryGeo,
							developerId: Number(developer.id),
						}),
					]);
					if (developerQuery.page > Math.max(1, developmentPage.totalPages))
						return null;
					const passingDeveloperIds =
						await passingDevelopmentDeveloperIds(ownDevelopments);
					canonicalPageKey = developer.pageKey as PageKey;
					routeData = {
						kind: "developer",
						value: developer,
						developments: developmentPage.items,
						pagination: {
							page: developmentPage.page,
							total: developmentPage.total,
							totalPages: developmentPage.totalPages,
						},
						hasPassingDevelopment: passingDeveloperIds.has(developer.id),
						descriptionSource: developerFacts.descriptionSource,
						descriptionCheckedAt: developerFacts.descriptionCheckedAt,
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
		if (decision.kind !== "page") return { decision };
		const routeData = data.get(decision.canonicalPath);
		if (!routeData) {
			return { decision: { kind: "notFound", statusCode: 404 } };
		}
		const resolution: RuntimeRouteResolution = {
			decision: decidePage(decision, routeData),
			data: routeData,
			brandName,
		};
		const queryVariant =
			routeData.kind === "listing"
				? routeData.query
				: routeData.kind === "developer"
					? parsePageSearchParams(queryString)
					: null;
		const canonicalPath = queryVariant?.queryString
			? routeData.kind === "listing" && routeData.query
				? catalogCanonicalPath(decision.canonicalPath, routeData.query)
				: `${decision.canonicalPath}?${queryVariant.queryString}`
			: null;
		return canonicalPath
			? {
					...resolution,
					...(routeData.kind === "listing"
						? { data: queryListingData(routeData, canonicalPath) }
						: {}),
					decision: queryPageDecision(
						resolution.decision as PageDecision,
						canonicalPath,
					),
				}
			: resolution;
	},
);
