import { z } from "zod";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const positiveIntegerSchema = z.coerce.number().int().min(1).max(10_000);
const priceSchema = z.coerce.number().int().min(1).max(10_000_000_000);
const roomSchema = z.coerce.number().int().min(0).max(100);

const catalogSearchSchema = z
	.object({
		page: positiveIntegerSchema.default(1),
		sort: z
			.enum(["recommended", "newest", "priceAsc", "priceDesc"])
			.default("recommended"),
		priceFrom: priceSchema.optional(),
		priceTo: priceSchema.optional(),
		rooms: z.array(roomSchema).max(8).optional(),
		district: slugSchema.optional(),
	})
	.strict()
	.superRefine((value, context) => {
		if (value.priceFrom && value.priceTo && value.priceFrom > value.priceTo) {
			context.addIssue({
				code: "custom",
				path: ["priceFrom"],
				message: "priceFrom must not exceed priceTo.",
			});
		}
	});

export type CatalogSearchParams = {
	page: number;
	sort: "recommended" | "newest" | "priceAsc" | "priceDesc";
	priceFromMinor?: number;
	priceToMinor?: number;
	rooms?: readonly number[];
	district?: string;
	hasFilters: boolean;
	queryString: string;
};

export function parseCatalogSearchParams(
	queryString: string,
): CatalogSearchParams | null {
	const params = new URLSearchParams(queryString);
	const allowed = new Set([
		"page",
		"sort",
		"priceFrom",
		"priceTo",
		"rooms",
		"district",
	]);
	if ([...params.keys()].some((key) => !allowed.has(key))) return null;
	for (const key of ["page", "sort", "priceFrom", "priceTo", "district"]) {
		if (params.getAll(key).length > 1) return null;
	}

	const roomValues = params
		.getAll("rooms")
		.flatMap((value) => value.split(","))
		.filter(Boolean);
	const candidate = Object.fromEntries(
		["page", "sort", "priceFrom", "priceTo", "district"].flatMap((key) => {
			const value = params.get(key);
			return value === null || value === "" ? [] : [[key, value]];
		}),
	);
	const parsed = catalogSearchSchema.safeParse({
		...candidate,
		...(roomValues.length ? { rooms: roomValues } : {}),
	});
	if (!parsed.success) return null;

	const normalized = new URLSearchParams();
	if (parsed.data.page > 1) normalized.set("page", String(parsed.data.page));
	if (params.has("sort")) normalized.set("sort", parsed.data.sort);
	if (parsed.data.priceFrom)
		normalized.set("priceFrom", String(parsed.data.priceFrom));
	if (parsed.data.priceTo)
		normalized.set("priceTo", String(parsed.data.priceTo));
	if (parsed.data.rooms?.length) {
		normalized.set(
			"rooms",
			[...new Set(parsed.data.rooms)].sort((a, b) => a - b).join(","),
		);
	}
	if (parsed.data.district) normalized.set("district", parsed.data.district);

	return {
		page: parsed.data.page,
		sort: parsed.data.sort,
		...(parsed.data.priceFrom
			? { priceFromMinor: parsed.data.priceFrom * 100 }
			: {}),
		...(parsed.data.priceTo ? { priceToMinor: parsed.data.priceTo * 100 } : {}),
		...(parsed.data.rooms?.length
			? { rooms: [...new Set(parsed.data.rooms)].sort((a, b) => a - b) }
			: {}),
		...(parsed.data.district ? { district: parsed.data.district } : {}),
		hasFilters: [...params.keys()].some((key) => key !== "page"),
		queryString: normalized.toString(),
	};
}

export function pageHref(
	pathname: string,
	query: CatalogSearchParams,
	page: number,
): string {
	const params = new URLSearchParams(query.queryString);
	if (page <= 1) params.delete("page");
	else params.set("page", String(page));
	const suffix = params.toString();
	return suffix ? `${pathname}?${suffix}` : pathname;
}

export function catalogCanonicalPath(
	pathname: string,
	query: CatalogSearchParams,
): string {
	if (!query.queryString || query.hasFilters) return pathname;
	return `${pathname}?page=${query.page}`;
}

export function parsePageSearchParams(
	queryString: string,
): { page: number; queryString: string } | null {
	const params = new URLSearchParams(queryString);
	if ([...params.keys()].some((key) => key !== "page")) return null;
	if (params.getAll("page").length > 1) return null;
	const raw = params.get("page");
	if (raw === null || raw === "") return { page: 1, queryString: "" };
	const parsed = positiveIntegerSchema.safeParse(raw);
	if (!parsed.success) return null;
	return {
		page: parsed.data,
		queryString: parsed.data > 1 ? `page=${parsed.data}` : "",
	};
}
