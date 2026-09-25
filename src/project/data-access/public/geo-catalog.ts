import "server-only";

import type {
	CatalogSurfaceSlug,
	CityDTO,
	DeveloperCardDTO,
	DeveloperDetailsDTO,
	DevelopmentCardDTO,
	DevelopmentDetailsDTO,
	GeoHubDTO,
	ListingPageDTO,
	PageKeyDTO,
	PageLinkDTO,
	PropertyCardDTO,
	PropertyDetailsDTO,
	SeoMetaDTO,
} from "@ams/realtbase-contracts";
import type { Payload, Where } from "payload";
import { z } from "zod";
import {
	catalogSurfaceMarketMatrix,
	type Market,
	type SiteProfile,
} from "@/core/profile";
import type { UrlGrammar } from "@/core/routing";
import type {
	City,
	Developer,
	Development,
	District,
	Media,
	Property,
	Region,
} from "@/project/payload-types";
import { siteProfile } from "@/project/site-profile";
import { createProjectUrlGrammar } from "@/project/url-grammar";
import {
	type CatalogQueryInput,
	findPublicCatalogPropertiesByGeo,
	findPublicPropertyByPublicUrlId,
} from "./catalog";
import { toPropertyCardDTO, toPropertyDetailsDTO } from "./dto";
import { publicGatewayPolicy } from "./policy";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const pageSchema = z.number().int().min(1).max(10_000).default(1);
const pageSizeSchema = z.number().int().min(1).max(48).default(24);
const urlGrammar = createProjectUrlGrammar(siteProfile);
const gatewayAccess = {
	overrideAccess: publicGatewayPolicy.overrideAccess,
	context: publicGatewayPolicy.context,
} as const;

const geoSelect = {
	slug: true,
	title: true,
	morphology: true,
	preposition: true,
	cityType: true,
	region: true,
	agglomerationOf: true,
	coordinates: true,
	status: true,
	publishedAt: true,
} as const;

const districtSelect = {
	slug: true,
	title: true,
	morphology: true,
	districtType: true,
	city: true,
	parent: true,
	preposition: true,
	status: true,
	publishedAt: true,
	categories: true,
} as const;

const developmentSelect = {
	name: true,
	slug: true,
	kind: true,
	city: true,
	district: true,
	developer: true,
	address: true,
	coordinates: true,
	completion: true,
	salesStatus: true,
	availability: true,
	prices: true,
	mediaItems: true,
	layouts: true,
	progress: true,
	descriptions: true,
	status: true,
	publishedAt: true,
	contentPurgedAt: true,
} as const;

const developerSelect = {
	name: true,
	slug: true,
	legalName: true,
	logo: true,
	siteUrl: true,
	description: true,
	source: true,
	checkedAt: true,
	status: true,
	publishedAt: true,
	contentPurgedAt: true,
} as const;

export type PublicListingInput = {
	geo: string;
	surface: CatalogSurfaceSlug;
	district?: string;
	facet?: string;
	query?: CatalogQueryInput;
	page?: number;
};

export async function getGeoBySlug(
	payload: Payload,
	slug: string,
): Promise<CityDTO | null> {
	const city = await findGeoRecord(payload, slugSchema.parse(slug));
	return city ? toCityDTO(city) : null;
}

export async function getGeoHub(
	payload: Payload,
	slug: string,
	grammar: UrlGrammar = urlGrammar,
): Promise<GeoHubDTO | null> {
	const geo = slugSchema.parse(slug);
	if (!isRoutableGeo(geo)) return null;
	const city = await findGeoRecord(payload, geo);
	if (!city) return null;
	const [districts, nearby] = await Promise.all([
		findPublishedDistricts(payload, Number(city.id)),
		findNearbyCities(payload, city),
	]);
	const pageKey = { kind: "geoHub", geo } as const;
	const href = safeBuildUrl(pageKey, grammar);
	return {
		city: toCityDTO(city),
		title: `Недвижимость ${city.preposition === "na" ? "на" : "в"} ${city.morphology.prepositional}`,
		intro: `Каталог объектов и проектов: ${city.title}.`,
		breadcrumbs: {
			items: [
				{ label: "Главная", pageKey: { kind: "home" }, href: "/" },
				{ label: city.title },
			],
		},
		seo: safeSeo(
			`Недвижимость — ${city.title}`,
			`Каталог недвижимости: ${city.title}.`,
			href,
		),
		categoryLinks: activeSurfaces(siteProfile).map((surface) =>
			pageLink(
				{ kind: "categoryGeo", geo, category: surface },
				surfaceLabel(surface),
			),
		),
		districtLinks: districts
			.filter((district) => district.categories?.includes("kvartiry"))
			.map((district) =>
				pageLink(
					{
						kind: "categoryGeoDistrict",
						geo,
						category: "kvartiry",
						district: district.slug,
					},
					district.title,
					grammar,
				),
			),
		developerLink: pageLink({ kind: "geoDevelopers", geo }, "Застройщики"),
		nearby: nearby.map((item) =>
			pageLink({ kind: "geoHub", geo: item.slug }, item.title),
		),
	};
}

export async function getListing(
	payload: Payload,
	input: PublicListingInput,
	grammar: UrlGrammar = urlGrammar,
	profile: SiteProfile = siteProfile,
): Promise<ListingPageDTO | null> {
	const parsed = z
		.object({
			geo: slugSchema,
			surface: z.enum([
				"kvartiry",
				"doma",
				"uchastki",
				"kommercheskaya-nedvizhimost",
				"komnaty",
				"garazhi",
				"arenda",
				"novostroyki",
				"kottedzhnye-poselki",
			]),
			district: slugSchema.optional(),
			facet: slugSchema.optional(),
			query: z.unknown().optional(),
			page: pageSchema.optional(),
		})
		.strict()
		.parse(input);
	if (!Object.hasOwn(profile.geos, parsed.geo)) return null;
	const city = await findGeoRecord(payload, parsed.geo);
	if (!city) return null;
	const district = parsed.district
		? await findDistrict(
				payload,
				Number(city.id),
				parsed.district,
				parsed.surface,
			)
		: null;
	if (parsed.district && !district) return null;
	const markets = availableMarketsForSurface(
		profile,
		parsed.geo,
		parsed.surface,
	);
	if (markets.length === 0) return null;
	const facetQuery = parsed.facet
		? catalogQueryForSeoFacet(profile, parsed.geo, parsed.surface, parsed.facet)
		: {};
	if (parsed.facet && !facetQuery) return null;

	const pageKey: PageKeyDTO = parsed.district
		? {
				kind: "categoryGeoDistrict",
				geo: parsed.geo,
				category: parsed.surface,
				district: parsed.district,
			}
		: parsed.facet
			? {
					kind: "categoryGeoFacet",
					geo: parsed.geo,
					category: parsed.surface,
					facet: parsed.facet,
				}
			: { kind: "categoryGeo", geo: parsed.geo, category: parsed.surface };
	const href = safeBuildUrl(pageKey, grammar);
	const page = parsed.page ?? 1;
	const pageSize = pageSizeSchema.parse(
		(parsed.query as { limit?: number } | undefined)?.limit ?? 24,
	);

	if (
		parsed.surface === "novostroyki" ||
		parsed.surface === "kottedzhnye-poselki"
	) {
		const result = await findDevelopments(payload, {
			cityId: Number(city.id),
			districtId: district ? Number(district.id) : undefined,
			kind:
				parsed.surface === "novostroyki"
					? "residential_complex"
					: "cottage_village",
			page,
			limit: pageSize,
		});
		return listingDTO(
			pageKey,
			href,
			city.title,
			parsed.surface,
			(result.docs as Development[]).map(toDevelopmentCardDTO),
			result.totalDocs,
			page,
			pageSize,
		);
	}

	const propertyFilter = surfacePropertyFilter(parsed.surface);
	const result = await findPublicCatalogPropertiesByGeo(
		payload,
		{
			...((parsed.query as CatalogQueryInput | undefined) ?? {}),
			...facetQuery,
			page,
			limit: pageSize,
			...propertyFilter,
		},
		{
			cityId: Number(city.id),
			districtId: district ? Number(district.id) : undefined,
			markets,
		},
	);
	return listingDTO(
		pageKey,
		href,
		city.title,
		parsed.surface,
		result.items.map(toPropertyCardDTO),
		result.total,
		result.page,
		result.pageSize,
	);
}

export async function getPropertyByPublicUrlId(
	payload: Payload,
	publicUrlId: number,
): Promise<PropertyDetailsDTO | null> {
	const property = await findPublicPropertyByPublicUrlId(payload, publicUrlId);
	return property ? toPropertyDetailsDTO(property, []) : null;
}

export async function getPropertyRouteFacts(
	payload: Payload,
	publicUrlId: number,
): Promise<{ market: Market; geo: string | null } | null> {
	const result = await payload.find({
		collection: "properties",
		where: { publicUrlId: { equals: publicUrlId } },
		depth: 1,
		limit: 1,
		page: 1,
		select: { market: true, cityRef: true },
		...gatewayAccess,
	});
	const property = result.docs[0] as
		| Pick<Property, "market" | "cityRef">
		| undefined;
	if (!property) return null;
	return {
		market: property.market,
		geo: isObjectRelation<City>(property.cityRef)
			? property.cityRef.slug
			: null,
	};
}

export async function getDevelopment(
	payload: Payload,
	slug: string,
): Promise<DevelopmentDetailsDTO | null> {
	const result = await payload.find({
		collection: "developments",
		where: { slug: { equals: slugSchema.parse(slug) } },
		depth: 1,
		limit: 1,
		page: 1,
		select: developmentSelect,
		...gatewayAccess,
	});
	const development = result.docs[0] as Development | undefined;
	return development ? toDevelopmentDetailsDTO(development) : null;
}

export async function getDevelopmentRouteFacts(
	payload: Payload,
	slug: string,
): Promise<{
	geo: string;
	dataTier: Development["dataTier"];
	layoutCount: number;
	progressPresent: boolean;
} | null> {
	const result = await payload.find({
		collection: "developments",
		where: { slug: { equals: slugSchema.parse(slug) } },
		depth: 1,
		limit: 1,
		page: 1,
		select: { city: true, dataTier: true, layouts: true, progress: true },
		...gatewayAccess,
	});
	const development = result.docs[0] as
		| Pick<Development, "city" | "dataTier" | "layouts" | "progress">
		| undefined;
	if (!development) return null;
	const city = isObjectRelation<City>(development.city)
		? development.city
		: null;
	return city
		? {
				geo: city.slug,
				dataTier: development.dataTier,
				layoutCount: development.layouts?.length ?? 0,
				progressPresent: (development.progress?.length ?? 0) > 0,
			}
		: null;
}

export async function getDeveloperRouteFacts(
	payload: Payload,
	slug: string,
): Promise<{
	descriptionSource: string | null;
	descriptionCheckedAt: string | null;
} | null> {
	const developerResult = await payload.find({
		collection: "developers",
		where: { slug: { equals: slugSchema.parse(slug) } },
		depth: 0,
		limit: 1,
		page: 1,
		select: { source: true, checkedAt: true },
		...gatewayAccess,
	});
	const developer = developerResult.docs[0] as
		| Pick<Developer, "id" | "source" | "checkedAt">
		| undefined;
	if (!developer) return null;
	return {
		descriptionSource: developer.source || null,
		descriptionCheckedAt: developer.checkedAt || null,
	};
}

export async function listDevelopments(
	payload: Payload,
	input: {
		geo: string;
		kind?: Development["kind"];
		page?: number;
		limit?: number;
	},
): Promise<readonly DevelopmentCardDTO[]> {
	const geo = slugSchema.parse(input.geo);
	const city = await findGeoRecord(payload, geo);
	if (!city) return [];
	const result = await findDevelopments(payload, {
		cityId: Number(city.id),
		kind: input.kind,
		page: pageSchema.parse(input.page ?? 1),
		limit: pageSizeSchema.parse(input.limit ?? 24),
	});
	return (result.docs as Development[]).map(toDevelopmentCardDTO);
}

export async function getDeveloper(
	payload: Payload,
	slug: string,
): Promise<DeveloperDetailsDTO | null> {
	const result = await payload.find({
		collection: "developers",
		where: { slug: { equals: slugSchema.parse(slug) } },
		depth: 1,
		limit: 1,
		page: 1,
		select: developerSelect,
		...gatewayAccess,
	});
	const developer = result.docs[0] as Developer | undefined;
	if (!developer) return null;
	const [developments, developmentCount] = await Promise.all([
		payload.find({
			collection: "developments",
			where: { developer: { equals: Number(developer.id) } },
			depth: 1,
			limit: 48,
			page: 1,
			select: { city: true },
			...gatewayAccess,
		}),
		payload.count({
			collection: "developments",
			where: { developer: { equals: Number(developer.id) } },
			...gatewayAccess,
		}),
	]);
	return toDeveloperDetailsDTO(
		developer,
		developments.docs as Development[],
		developmentCount.totalDocs,
	);
}

export async function listGeoDevelopers(
	payload: Payload,
	geo: string,
): Promise<readonly DeveloperCardDTO[]> {
	const parsedGeo = slugSchema.parse(geo);
	const city = await findGeoRecord(payload, parsedGeo);
	if (!city) return [];
	const developments = await payload.find({
		collection: "developments",
		where: { city: { equals: Number(city.id) } },
		depth: 1,
		limit: 48,
		page: 1,
		select: { developer: true, city: true },
		...gatewayAccess,
	});
	const groups = new Map<
		number,
		{ developer: Developer; developments: Development[] }
	>();
	for (const development of developments.docs as Development[]) {
		if (!isObjectRelation<Developer>(development.developer)) continue;
		const id = Number(development.developer.id);
		const group = groups.get(id) ?? {
			developer: development.developer,
			developments: [],
		};
		group.developments.push(development);
		groups.set(id, group);
	}
	return [...groups.values()].map(({ developer, developments: rows }) =>
		toDeveloperCardDTO(developer, rows),
	);
}

export async function getNearby(
	payload: Payload,
	geo: string,
): Promise<readonly PageLinkDTO[]> {
	const parsedGeo = slugSchema.parse(geo);
	if (!isRoutableGeo(parsedGeo)) return [];
	const city = await findGeoRecord(payload, parsedGeo);
	if (!city) return [];
	const nearby = await findNearbyCities(payload, city);
	return nearby.map((item) =>
		pageLink({ kind: "geoHub", geo: item.slug }, item.title),
	);
}

export async function countInventory(
	payload: Payload,
	input: {
		geo: string;
		surface: CatalogSurfaceSlug;
		district?: string;
		facet?: string;
	},
	profile: SiteProfile = siteProfile,
): Promise<number> {
	const geo = slugSchema.parse(input.geo);
	const city = await findGeoRecord(payload, geo);
	if (!city) return 0;
	const district = input.district
		? await findDistrict(
				payload,
				Number(city.id),
				slugSchema.parse(input.district),
				input.surface,
			)
		: null;
	if (input.district && !district) return 0;
	const markets = availableMarketsForSurface(profile, geo, input.surface);
	if (markets.length === 0) return 0;
	const facetQuery = input.facet
		? catalogQueryForSeoFacet(profile, geo, input.surface, input.facet)
		: {};
	if (input.facet && !facetQuery) return 0;
	if (
		input.surface === "novostroyki" ||
		input.surface === "kottedzhnye-poselki"
	) {
		if (!markets.includes("newbuild") || input.facet) return 0;
		const and: Where[] = [
			{ city: { equals: Number(city.id) } },
			{
				kind: {
					equals:
						input.surface === "novostroyki"
							? "residential_complex"
							: "cottage_village",
				},
			},
		];
		if (district) and.push({ district: { equals: Number(district.id) } });
		const result = await payload.count({
			collection: "developments",
			where: { and },
			...gatewayAccess,
		});
		return result.totalDocs;
	}
	const filter = surfacePropertyFilter(input.surface);
	const result = await findPublicCatalogPropertiesByGeo(
		payload,
		{ ...filter, ...facetQuery, page: 1, limit: 1 },
		{
			cityId: Number(city.id),
			districtId: district ? Number(district.id) : undefined,
			markets,
		},
	);
	return result.total;
}

export async function countGeoInventory(
	payload: Payload,
	geo: string,
	profile: SiteProfile = siteProfile,
): Promise<number> {
	const city = await findGeoRecord(payload, slugSchema.parse(geo));
	if (!city) return 0;
	const activeSurfacesForGeo = activeSurfaces(profile).filter((surface) => {
		const status = profile.geoCategoryStatus[geo]?.[surface];
		return status === "ACTIVE" || status === "NOINDEX_AUTO";
	});
	const markets = [
		...new Set(
			activeSurfacesForGeo.flatMap((surface) =>
				availableMarketsForSurface(profile, geo, surface),
			),
		),
	];
	const propertyCount = markets.length
		? await payload.count({
				collection: "properties",
				where: {
					and: [
						{ cityRef: { equals: Number(city.id) } },
						{ market: { in: markets } },
					],
				},
				...gatewayAccess,
			})
		: { totalDocs: 0 };
	const developmentCount = markets.includes("newbuild")
		? await payload.count({
				collection: "developments",
				where: { city: { equals: Number(city.id) } },
				...gatewayAccess,
			})
		: { totalDocs: 0 };
	return propertyCount.totalDocs + developmentCount.totalDocs;
}

async function findGeoRecord(
	payload: Payload,
	slug: string,
): Promise<City | null> {
	const result = await payload.find({
		collection: "cities",
		where: { slug: { equals: slug } },
		depth: 1,
		limit: 1,
		page: 1,
		select: geoSelect,
		...gatewayAccess,
	});
	return (result.docs[0] as City | undefined) ?? null;
}

async function findPublishedDistricts(
	payload: Payload,
	cityId: number,
): Promise<District[]> {
	const result = await payload.find({
		collection: "districts",
		where: { city: { equals: cityId } },
		depth: 0,
		limit: 48,
		page: 1,
		sort: "sortOrder",
		select: districtSelect,
		...gatewayAccess,
	});
	return result.docs as District[];
}

async function findDistrict(
	payload: Payload,
	cityId: number,
	slug: string,
	category?: CatalogSurfaceSlug,
): Promise<District | null> {
	const result = await payload.find({
		collection: "districts",
		where: { and: [{ city: { equals: cityId } }, { slug: { equals: slug } }] },
		depth: 0,
		limit: 1,
		page: 1,
		select: districtSelect,
		...gatewayAccess,
	});
	const district = (result.docs[0] as District | undefined) ?? null;
	if (district && category && !district.categories?.includes(category)) {
		return null;
	}
	return district;
}

async function findNearbyCities(payload: Payload, city: City): Promise<City[]> {
	const primaryId = isObjectRelation<City>(city.agglomerationOf)
		? Number(city.agglomerationOf.id)
		: typeof city.agglomerationOf === "number"
			? city.agglomerationOf
			: Number(city.id);
	const result = await payload.find({
		collection: "cities",
		where: {
			or: [
				{ id: { equals: primaryId } },
				{ agglomerationOf: { equals: primaryId } },
			],
		},
		depth: 1,
		limit: 24,
		page: 1,
		sort: "sortOrder",
		select: geoSelect,
		...gatewayAccess,
	});
	return (result.docs as City[]).filter(
		(item) =>
			Number(item.id) !== Number(city.id) &&
			Object.hasOwn(siteProfile.geos, item.slug),
	);
}

async function findDevelopments(
	payload: Payload,
	input: {
		cityId: number;
		districtId?: number;
		kind?: Development["kind"];
		page: number;
		limit: number;
	},
) {
	const and: Where[] = [{ city: { equals: input.cityId } }];
	if (input.districtId) and.push({ district: { equals: input.districtId } });
	if (input.kind) and.push({ kind: { equals: input.kind } });
	return payload.find({
		collection: "developments",
		where: { and },
		depth: 1,
		limit: input.limit,
		page: input.page,
		sort: "name",
		select: developmentSelect,
		...gatewayAccess,
	});
}

function toCityDTO(city: City): CityDTO {
	const region = isObjectRelation<Region>(city.region) ? city.region : null;
	if (!region)
		throw new Error(`Public city ${city.id} requires selected region.`);
	return {
		id: String(city.id),
		slug: city.slug,
		name: city.title,
		nameGenitive: city.morphology.genitive,
		nameLocative: city.morphology.prepositional,
		preposition: city.preposition === "na" ? "на" : "в",
		type:
			city.cityType === "city"
				? "city"
				: city.cityType === "urban_settlement"
					? "town"
					: "settlement",
		region: {
			id: String(region.id),
			slug: region.slug,
			name: region.title,
			shortName: region.shortName,
		},
		agglomerationOf: relationId(city.agglomerationOf),
		coordinates:
			city.coordinates?.latitude != null && city.coordinates.longitude != null
				? {
						latitude: city.coordinates.latitude,
						longitude: city.coordinates.longitude,
					}
				: undefined,
	};
}

function toDevelopmentCardDTO(development: Development): DevelopmentCardDTO {
	const city = objectRelation<City>(development.city, "city", development.id);
	const district = isObjectRelation<District>(development.district)
		? development.district
		: undefined;
	const developer = objectRelation<Developer>(
		development.developer,
		"developer",
		development.id,
	);
	const pageKey = {
		kind: "development",
		developmentKind: development.kind,
		slug: development.slug,
	} as const;
	const price = freshestPrice(development);
	return {
		id: String(development.id),
		slug: development.slug,
		pageKey,
		href: safeBuildUrl(pageKey),
		name: development.name,
		kind: development.kind,
		cityName: city.title,
		districtName: district?.title,
		address: development.address ?? undefined,
		developer: {
			id: String(developer.id),
			name: developer.name,
			pageKey: { kind: "developer", slug: developer.slug },
			href: safeBuildUrl({ kind: "developer", slug: developer.slug }),
		},
		primaryMedia: primaryDevelopmentMedia(development),
		priceFrom: price
			? {
					priceMinor: price.amountMinor,
					currency: "RUB",
					period: "total",
					label: rub(price.amountMinor),
				}
			: undefined,
		availability:
			development.salesStatus === "available" ||
			development.salesStatus === "limited" ||
			development.salesStatus === "sold_out"
				? development.salesStatus
				: "unknown",
		completionLabel: development.completion ?? undefined,
	};
}

function toDevelopmentDetailsDTO(
	development: Development,
): DevelopmentDetailsDTO {
	const card = toDevelopmentCardDTO(development);
	return {
		...card,
		description:
			development.descriptions?.find((item) => item.kind === "full")?.text ??
			development.descriptions?.find((item) => item.kind === "short")?.text ??
			undefined,
		gallery:
			development.mediaItems?.flatMap((item) =>
				isObjectRelation<Media>(item.media) && item.media.url
					? [
							{
								kind: "managed" as const,
								src: item.media.url,
								alt: item.media.alt,
							},
						]
					: [],
			) ?? [],
		coordinates:
			development.coordinates?.latitude != null &&
			development.coordinates.longitude != null
				? {
						latitude: development.coordinates.latitude,
						longitude: development.coordinates.longitude,
					}
				: undefined,
		priceRows:
			development.prices?.map((row) => ({
				label: row.label,
				price: {
					priceMinor: row.amountMinor,
					currency: "RUB" as const,
					period: "total" as const,
					label: rub(row.amountMinor),
				},
				checkedAt: row.checkedAt,
			})) ?? [],
		characteristics: [
			development.completion
				? { label: "Срок", value: development.completion }
				: null,
			development.availability
				? { label: "Наличие", value: development.availability }
				: null,
		].filter((item): item is { label: string; value: string } => item != null),
		breadcrumbs: {
			items: [
				{ label: "Главная", pageKey: { kind: "home" }, href: "/" },
				{ label: development.name },
			],
		},
		seo: safeSeo(
			development.name,
			card.address ?? `Проект ${development.name}`,
			card.href,
		),
	};
}

function toDeveloperCardDTO(
	developer: Developer,
	developments: readonly Development[],
): DeveloperCardDTO {
	const pageKey = { kind: "developer", slug: developer.slug } as const;
	return {
		id: String(developer.id),
		slug: developer.slug,
		pageKey,
		href: safeBuildUrl(pageKey),
		name: developer.name,
		logo:
			isObjectRelation<Media>(developer.logo) && developer.logo.url
				? { kind: "managed", src: developer.logo.url, alt: developer.logo.alt }
				: undefined,
		developmentsCount: developments.length,
		geoNames: [
			...new Set(
				developments.flatMap((item) =>
					isObjectRelation<City>(item.city) ? [item.city.title] : [],
				),
			),
		],
	};
}

function toDeveloperDetailsDTO(
	developer: Developer,
	developments: readonly Development[],
	developmentsCount = developments.length,
): DeveloperDetailsDTO {
	const card = {
		...toDeveloperCardDTO(developer, developments),
		developmentsCount,
	};
	return {
		...card,
		legalName: developer.legalName ?? undefined,
		description: developer.description ?? undefined,
		website: developer.siteUrl ?? undefined,
		breadcrumbs: {
			items: [
				{ label: "Главная", pageKey: { kind: "home" }, href: "/" },
				{
					label: "Застройщики",
					pageKey: { kind: "developerRoot" },
					href: safeBuildUrl({ kind: "developerRoot" }),
				},
				{ label: developer.name },
			],
		},
		seo: safeSeo(
			developer.name,
			developer.description ?? `Проекты застройщика ${developer.name}.`,
			card.href,
		),
	};
}

function listingDTO(
	pageKey: PageKeyDTO,
	href: string,
	cityName: string,
	surface: CatalogSurfaceSlug,
	items: readonly (PropertyCardDTO | DevelopmentCardDTO)[],
	total: number,
	page: number,
	pageSize: number,
): ListingPageDTO {
	const totalPages = Math.ceil(total / pageSize);
	return {
		pageKey,
		href,
		h1: `${surfaceLabel(surface)} — ${cityName}`,
		intro: `Актуальные предложения: ${cityName}.`,
		items: items.map(
			(item) =>
				({
					kind:
						"category" in item
							? ("property" as const)
							: ("development" as const),
					item,
				}) as ListingPageDTO["items"][number],
		),
		total,
		pagination: {
			page,
			pageSize,
			totalPages,
			previousPage: page > 1 ? page - 1 : undefined,
			nextPage: page < totalPages ? page + 1 : undefined,
		},
		subLinks: [],
		nearby: [],
		robots: { indexing: "noindex", following: "nofollow" },
		canonical: href,
		breadcrumbs: {
			items: [
				{ label: "Главная", pageKey: { kind: "home" }, href: "/" },
				{
					label: cityName,
					pageKey: {
						kind: "geoHub",
						geo:
							pageKey.kind === "categoryRoot"
								? siteProfile.primaryGeo
								: "geo" in pageKey
									? pageKey.geo
									: siteProfile.primaryGeo,
					},
					href:
						pageKey.kind === "categoryRoot"
							? "/"
							: "geo" in pageKey
								? safeBuildUrl({ kind: "geoHub", geo: pageKey.geo })
								: "/",
				},
				{ label: surfaceLabel(surface) },
			],
		},
		seo: safeSeo(
			`${surfaceLabel(surface)} — ${cityName}`,
			`Каталог: ${surfaceLabel(surface).toLowerCase()}, ${cityName}.`,
			href,
		),
	};
}

function availableMarketsForSurface(
	profile: SiteProfile,
	geo: string,
	surface: CatalogSurfaceSlug,
): Market[] {
	return catalogSurfaceMarketMatrix[surface].filter((market) => {
		const capability = profile.marketCapability[market];
		const geoStatus = profile.marketStatus[geo]?.[market];
		return (
			(capability === "ACTIVE" || capability === "NOINDEX_AUTO") &&
			(geoStatus === "ACTIVE" || geoStatus === "NOINDEX_AUTO")
		);
	});
}

function catalogQueryForSeoFacet(
	profile: SiteProfile,
	geo: string,
	surface: CatalogSurfaceSlug,
	slug: string,
): Partial<CatalogQueryInput> | null {
	const facet = profile.seoFacets[slug];
	if (!facet || facet.geo !== geo || facet.category !== surface) return null;
	if (facet.filter.key !== "rooms" || !Array.isArray(facet.filter.value)) {
		return null;
	}
	const rooms = facet.filter.value.filter(
		(value): value is number =>
			typeof value === "number" && Number.isSafeInteger(value) && value > 0,
	);
	return rooms.length === facet.filter.value.length && rooms.length > 0
		? { rooms }
		: null;
}

function surfacePropertyFilter(
	surface: CatalogSurfaceSlug,
): Pick<CatalogQueryInput, "category" | "dealType"> {
	if (surface === "arenda") return { dealType: "rent" };
	const categoryBySurface: Partial<
		Record<CatalogSurfaceSlug, CatalogQueryInput["category"]>
	> = {
		kvartiry: "apartment",
		doma: "house",
		uchastki: "land",
		"kommercheskaya-nedvizhimost": "commercial",
		komnaty: "room",
		garazhi: "garage",
	};
	const category = categoryBySurface[surface];
	return category ? { category, dealType: "sale" } : {};
}

function activeSurfaces(profile: SiteProfile): CatalogSurfaceSlug[] {
	return Object.entries(profile.categoryStatus).flatMap(([surface, status]) =>
		status === "PREPARED_OFF" ? [] : [surface as CatalogSurfaceSlug],
	);
}

function isRoutableGeo(slug: string): boolean {
	return Object.hasOwn(siteProfile.geos, slug);
}

function surfaceLabel(surface: CatalogSurfaceSlug): string {
	return (
		{
			kvartiry: "Квартиры",
			doma: "Дома",
			uchastki: "Участки",
			"kommercheskaya-nedvizhimost": "Коммерческая недвижимость",
			komnaty: "Комнаты",
			garazhi: "Гаражи",
			arenda: "Аренда",
			novostroyki: "Новостройки",
			"kottedzhnye-poselki": "Коттеджные посёлки",
		} as const
	)[surface];
}

function pageLink(
	pageKey: PageKeyDTO,
	label: string,
	grammar: UrlGrammar = urlGrammar,
): PageLinkDTO {
	return { pageKey, href: safeBuildUrl(pageKey, grammar), label };
}

function safeBuildUrl(
	pageKey: PageKeyDTO,
	grammar: UrlGrammar = urlGrammar,
): string {
	return grammar.buildUrl(pageKey as Parameters<typeof grammar.buildUrl>[0]);
}

function safeSeo(
	title: string,
	description: string,
	canonicalPath: string,
): SeoMetaDTO {
	return {
		title,
		description,
		canonicalPath,
		indexing: "noindex",
		following: "nofollow",
	};
}

function isObjectRelation<T extends { id: unknown }>(
	value: unknown,
): value is T {
	return Boolean(value && typeof value === "object" && "id" in value);
}

function objectRelation<T extends { id: unknown }>(
	value: unknown,
	label: string,
	owner: unknown,
): T {
	if (!isObjectRelation<T>(value))
		throw new Error(`Public ${label} relation was not selected for ${owner}.`);
	return value;
}

function relationId(value: unknown): string | undefined {
	if (isObjectRelation<{ id: unknown }>(value)) return String(value.id);
	return typeof value === "number" || typeof value === "string"
		? String(value)
		: undefined;
}

function freshestPrice(development: Development) {
	return [...(development.prices ?? [])].sort(
		(a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt),
	)[0];
}

function primaryDevelopmentMedia(development: Development) {
	const media = development.mediaItems?.find(
		(item) =>
			item.mediaType === "image" &&
			isObjectRelation<Media>(item.media) &&
			item.media.url,
	)?.media;
	return isObjectRelation<Media>(media) && media.url
		? { kind: "managed" as const, src: media.url, alt: media.alt }
		: undefined;
}

function rub(priceMinor: number): string {
	return new Intl.NumberFormat("ru-RU", {
		style: "currency",
		currency: "RUB",
		maximumFractionDigits: 0,
	}).format(priceMinor / 100);
}
