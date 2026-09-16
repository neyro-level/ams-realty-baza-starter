import "server-only";

import type {
	PropertyCategory,
	PropertyDealType,
	PropertySort,
	PropertyView,
} from "@ams/realtbase-contracts";
import type { Payload, Where } from "payload";
import { z } from "zod";
import type { PropertiesSelect, Property } from "@/payload/payload-types";
import { publicGatewayPolicy } from "./policy";

const publicPropertySelect = {
	slug: true,
	status: true,
	publishedAt: true,
	contentPurgedAt: true,
	market: true,
	category: true,
	dealType: true,
	priceMinor: true,
	currency: true,
	pricePerMeterMinor: true,
	rooms: true,
	totalArea: true,
	livingArea: true,
	kitchenArea: true,
	floor: true,
	floors: true,
	locality: true,
	district: true,
	publicAddress: true,
	lat: true,
	lng: true,
	title: true,
	description: true,
	images: {
		kind: true,
		url: true,
		alt: true,
		order: true,
	},
} satisfies PropertiesSelect<true>;

const propertyCategorySchema = z.enum(["apartment", "house", "land", "commercial"]);
const propertyDealTypeSchema = z.enum(["sale", "rent"]);
const propertySortSchema = z.enum(["recommended", "newest", "priceAsc", "priceDesc"]);
const propertyViewSchema = z.enum(["grid", "list", "map"]);

const optionalPositiveInt = z.coerce.number().int().positive().optional();
const optionalNonNegativeNumber = z.coerce.number().nonnegative().optional();

export const catalogQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce
		.number()
		.int()
		.min(1)
		.max(publicGatewayPolicy.maxLimit)
		.default(24),
	sort: propertySortSchema.default("recommended"),
	view: propertyViewSchema.default("grid"),
	query: z.string().trim().min(1).max(120).optional(),
	category: propertyCategorySchema.optional(),
	dealType: propertyDealTypeSchema.optional(),
	city: z.string().trim().min(1).max(80).optional(),
	district: z.string().trim().min(1).max(80).optional(),
	rooms: z.array(optionalPositiveInt.unwrap()).max(8).optional(),
	priceFromMinor: optionalPositiveInt,
	priceToMinor: optionalPositiveInt,
	areaFrom: optionalNonNegativeNumber,
	areaTo: optionalNonNegativeNumber,
});

export type CatalogQueryInput = z.input<typeof catalogQuerySchema>;
export type CatalogQuery = z.output<typeof catalogQuerySchema>;

export type PublicCatalogProperty = Pick<
	Property,
	| "id"
	| "slug"
	| "market"
	| "category"
	| "dealType"
	| "priceMinor"
	| "currency"
	| "pricePerMeterMinor"
	| "rooms"
	| "totalArea"
	| "livingArea"
	| "kitchenArea"
	| "floor"
	| "floors"
	| "locality"
	| "district"
	| "publicAddress"
	| "lat"
	| "lng"
	| "title"
	| "description"
	| "images"
>;

type PublicCatalogSelectedProperty = PublicCatalogProperty &
	Pick<Property, "status" | "publishedAt" | "contentPurgedAt">;

export type PublicCatalogResult = {
	items: readonly PublicCatalogProperty[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	applied: {
		query?: string;
		category?: PropertyCategory;
		dealType?: PropertyDealType;
		city?: string;
		district?: string;
		rooms?: readonly number[];
		priceFromMinor?: number;
		priceToMinor?: number;
		areaFrom?: number;
		areaTo?: number;
		sort: PropertySort;
		view: PropertyView;
	};
};

export const publicPropertyPublicationWhere: Where = {
	and: [
		{ status: { equals: "active" } },
		{ publishedAt: { exists: true } },
		{ contentPurgedAt: { exists: false } },
	],
};

function buildCatalogWhere(query: CatalogQuery): Where {
	const and: Where[] = [publicPropertyPublicationWhere];

	if (query.query) {
		and.push({
			or: [
				{ title: { contains: query.query } },
				{ publicAddress: { contains: query.query } },
				{ locality: { contains: query.query } },
				{ district: { contains: query.query } },
			],
		});
	}

	if (query.category) and.push({ category: { equals: query.category } });
	if (query.dealType) and.push({ dealType: { equals: query.dealType } });
	if (query.city) and.push({ locality: { equals: query.city } });
	if (query.district) and.push({ district: { equals: query.district } });
	if (query.rooms?.length) and.push({ rooms: { in: query.rooms } });
	if (query.priceFromMinor) and.push({ priceMinor: { greater_than_equal: query.priceFromMinor } });
	if (query.priceToMinor) and.push({ priceMinor: { less_than_equal: query.priceToMinor } });
	if (query.areaFrom) and.push({ totalArea: { greater_than_equal: query.areaFrom } });
	if (query.areaTo) and.push({ totalArea: { less_than_equal: query.areaTo } });

	return { and };
}

function sortForCatalog(sort: PropertySort): string {
	switch (sort) {
		case "newest":
			return "-publishedAt";
		case "priceAsc":
			return "priceMinor";
		case "priceDesc":
			return "-priceMinor";
		case "recommended":
		default:
			return "-publishedAt";
	}
}

function toPublicCatalogProperty(property: PublicCatalogSelectedProperty): PublicCatalogProperty {
	return {
		id: property.id,
		slug: property.slug,
		market: property.market,
		category: property.category,
		dealType: property.dealType,
		priceMinor: property.priceMinor,
		currency: property.currency,
		pricePerMeterMinor: property.pricePerMeterMinor,
		rooms: property.rooms,
		totalArea: property.totalArea,
		livingArea: property.livingArea,
		kitchenArea: property.kitchenArea,
		floor: property.floor,
		floors: property.floors,
		locality: property.locality,
		district: property.district,
		publicAddress: property.publicAddress,
		lat: property.lat,
		lng: property.lng,
		title: property.title,
		description: property.description,
		images:
			property.images?.map((image) => ({
				kind: image.kind,
				url: image.url,
				alt: image.alt,
				order: image.order,
				id: image.id,
			})) ?? null,
	};
}

export async function findPublicCatalogProperties(
	payload: Payload,
	input: CatalogQueryInput,
): Promise<PublicCatalogResult> {
	const query = catalogQuerySchema.parse(input);
	const where = buildCatalogWhere(query);

	const result = await payload.find({
		collection: "properties",
		where,
		depth: publicGatewayPolicy.depth,
		limit: query.limit,
		page: query.page,
		sort: sortForCatalog(query.sort),
		select: publicPropertySelect,
		overrideAccess: publicGatewayPolicy.overrideAccess,
	});

	return {
		items: result.docs.map((property) =>
			toPublicCatalogProperty(property as PublicCatalogSelectedProperty),
		),
		total: result.totalDocs,
		page: result.page ?? query.page,
		pageSize: result.limit,
		totalPages: result.totalPages,
		applied: {
			query: query.query,
			category: query.category,
			dealType: query.dealType,
			city: query.city,
			district: query.district,
			rooms: query.rooms,
			priceFromMinor: query.priceFromMinor,
			priceToMinor: query.priceToMinor,
			areaFrom: query.areaFrom,
			areaTo: query.areaTo,
			sort: query.sort,
			view: query.view,
		},
	};
}

export async function findPublicPropertyBySlug(payload: Payload, slug: string) {
	const result = await payload.find({
		collection: "properties",
		where: {
			and: [publicPropertyPublicationWhere, { slug: { equals: slug } }],
		},
		depth: publicGatewayPolicy.depth,
		limit: 1,
		page: 1,
		select: publicPropertySelect,
		overrideAccess: publicGatewayPolicy.overrideAccess,
	});

	const property = result.docs[0];
	if (!property) return null;

	return toPublicCatalogProperty(property as PublicCatalogSelectedProperty);
}
