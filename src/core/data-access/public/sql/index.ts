import { sql } from "@payloadcms/db-postgres/drizzle";
import type { Payload } from "payload";

/**
 * Approved parameterized SQL for public catalog facets, sitemap paging, and redirect lookup.
 * Generic query(sql: string) is not exported.
 */
export const publicSqlLayer = "src/core/data-access/public/sql" as const;

export type PublicFacetFilters = {
	query?: string;
	category?: string;
	dealType?: string;
	city?: string;
	district?: string;
	rooms?: readonly number[];
	priceFromMinor?: number;
	priceToMinor?: number;
	areaFrom?: number;
	areaTo?: number;
};

export type PublicFacetBucket = { value: string; count: number };

export type PublicCatalogFacetAggregate = {
	total: number;
	priceMin: number | null;
	priceMax: number | null;
	categories: readonly PublicFacetBucket[];
	dealTypes: readonly PublicFacetBucket[];
	cities: readonly PublicFacetBucket[];
	districts: readonly PublicFacetBucket[];
	rooms: readonly { value: number; count: number }[];
};

export type PublicRedirectLookup = {
	from: string;
	to: string;
	statusCode: string;
} | null;

type DrizzleExecutor = {
	execute: (query: unknown) => Promise<unknown>;
};

function getDrizzle(payload: Payload): DrizzleExecutor {
	const drizzle = (payload.db as { drizzle?: DrizzleExecutor } | undefined)?.drizzle;
	if (!drizzle?.execute) {
		throw new Error("Public SQL requires Payload Postgres drizzle.execute.");
	}
	return drizzle;
}

function rowsFrom(result: unknown): Array<Record<string, unknown>> {
	if (Array.isArray(result)) {
		return result as Array<Record<string, unknown>>;
	}
	if (result && typeof result === "object" && "rows" in result) {
		const rows = (result as { rows?: unknown }).rows;
		if (Array.isArray(rows)) {
			return rows as Array<Record<string, unknown>>;
		}
	}
	return [];
}

function asInt(value: unknown, fallback = 0): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function asNullableInt(value: unknown): number | null {
	if (value == null || value === "") return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function parseBuckets(value: unknown): PublicFacetBucket[] {
	if (!Array.isArray(value)) return [];
	return value.flatMap((item) => {
		if (!item || typeof item !== "object") return [];
		const record = item as { value?: unknown; count?: unknown };
		if (record.value == null || record.value === "") return [];
		return [{ value: String(record.value), count: asInt(record.count) }];
	});
}

const publicationSql = sql`
	status = 'active'
	AND published_at IS NOT NULL
	AND content_purged_at IS NULL
`;

function matchingPropertiesSql(filters: PublicFacetFilters) {
	const category = filters.category ?? null;
	const dealType = filters.dealType ?? null;
	const city = filters.city ?? null;
	const district = filters.district ?? null;
	const rooms = filters.rooms?.length ? [...filters.rooms] : null;
	const priceFrom = filters.priceFromMinor ?? null;
	const priceTo = filters.priceToMinor ?? null;
	const areaFrom = filters.areaFrom ?? null;
	const areaTo = filters.areaTo ?? null;
	const search = filters.query ?? null;

	return sql`
		SELECT *
		FROM properties
		WHERE ${publicationSql}
			AND (${category}::varchar IS NULL OR category = ${category})
			AND (${dealType}::varchar IS NULL OR deal_type = ${dealType})
			AND (${city}::varchar IS NULL OR locality = ${city})
			AND (${district}::varchar IS NULL OR district = ${district})
			AND (${rooms}::int[] IS NULL OR rooms = ANY(${rooms}::int[]))
			AND (${priceFrom}::numeric IS NULL OR price_minor >= ${priceFrom})
			AND (${priceTo}::numeric IS NULL OR price_minor <= ${priceTo})
			AND (${areaFrom}::numeric IS NULL OR total_area >= ${areaFrom})
			AND (${areaTo}::numeric IS NULL OR total_area <= ${areaTo})
			AND (
				${search}::varchar IS NULL
				OR title ILIKE '%' || ${search} || '%'
				OR public_address ILIKE '%' || ${search} || '%'
				OR locality ILIKE '%' || ${search} || '%'
				OR district ILIKE '%' || ${search} || '%'
			)
	`;
}

export async function aggregatePublicCatalogFacets(
	payload: Payload,
	filters: PublicFacetFilters,
): Promise<PublicCatalogFacetAggregate> {
	const matching = matchingPropertiesSql(filters);
	const result = await getDrizzle(payload).execute(sql`
		WITH matching AS (${matching})
		SELECT
			(SELECT COUNT(*)::int FROM matching) AS total,
			(SELECT MIN(price_minor) FROM matching) AS price_min,
			(SELECT MAX(price_minor) FROM matching) AS price_max,
			(
				SELECT jsonb_agg(jsonb_build_object('value', category, 'count', cnt) ORDER BY category)
				FROM (
					SELECT category::text AS category, COUNT(*)::int AS cnt
					FROM matching
					GROUP BY category
				) buckets
			) AS categories,
			(
				SELECT jsonb_agg(jsonb_build_object('value', deal_type, 'count', cnt) ORDER BY deal_type)
				FROM (
					SELECT deal_type::text AS deal_type, COUNT(*)::int AS cnt
					FROM matching
					GROUP BY deal_type
				) buckets
			) AS deal_types,
			(
				SELECT jsonb_agg(jsonb_build_object('value', locality, 'count', cnt) ORDER BY locality)
				FROM (
					SELECT locality, COUNT(*)::int AS cnt
					FROM matching
					WHERE locality IS NOT NULL AND locality <> ''
					GROUP BY locality
				) buckets
			) AS cities,
			(
				SELECT jsonb_agg(jsonb_build_object('value', district, 'count', cnt) ORDER BY district)
				FROM (
					SELECT district, COUNT(*)::int AS cnt
					FROM matching
					WHERE district IS NOT NULL AND district <> ''
					GROUP BY district
				) buckets
			) AS districts,
			(
				SELECT jsonb_agg(jsonb_build_object('value', rooms, 'count', cnt) ORDER BY rooms)
				FROM (
					SELECT rooms, COUNT(*)::int AS cnt
					FROM matching
					WHERE rooms IS NOT NULL
					GROUP BY rooms
				) buckets
			) AS rooms
	`);
	const row = rowsFrom(result)[0] ?? {};
	const roomBuckets = parseBuckets(row.rooms).map((bucket) => ({
		value: asInt(bucket.value),
		count: bucket.count,
	}));

	return {
		total: asInt(row.total),
		priceMin: asNullableInt(row.price_min),
		priceMax: asNullableInt(row.price_max),
		categories: parseBuckets(row.categories),
		dealTypes: parseBuckets(row.deal_types),
		cities: parseBuckets(row.cities),
		districts: parseBuckets(row.districts),
		rooms: roomBuckets.filter((bucket) => bucket.value > 0),
	};
}

export async function countPublicSitemapProperties(payload: Payload): Promise<number> {
	const result = await getDrizzle(payload).execute(sql`
		SELECT COUNT(*)::int AS total
		FROM properties
		WHERE ${publicationSql}
	`);
	return asInt(rowsFrom(result)[0]?.total);
}

export async function listPublicSitemapPropertiesPage(
	payload: Payload,
	input: { limit: number; offset: number },
): Promise<readonly { slug: string; updatedAt: string }[]> {
	const limit = Math.trunc(input.limit);
	const offset = Math.trunc(input.offset);
	if (!Number.isInteger(limit) || limit < 1) {
		throw new Error("sitemap page size must be a positive integer.");
	}
	if (!Number.isInteger(offset) || offset < 0) {
		throw new Error("sitemap offset must be a non-negative integer.");
	}

	const result = await getDrizzle(payload).execute(sql`
		SELECT slug, updated_at
		FROM properties
		WHERE ${publicationSql}
		ORDER BY updated_at DESC, id DESC
		LIMIT ${limit}
		OFFSET ${offset}
	`);

	return rowsFrom(result).flatMap((row) => {
		if (row.slug == null || row.slug === "") return [];
		return [
			{
				slug: String(row.slug),
				updatedAt: String(row.updated_at ?? ""),
			},
		];
	});
}

export async function countPublicSitemapPages(payload: Payload): Promise<number> {
	const result = await getDrizzle(payload).execute(sql`
		SELECT COUNT(*)::int AS total
		FROM pages
		WHERE status = 'published'
			AND published_at IS NOT NULL
			AND COALESCE(seo_noindex, false) = false
			AND slug <> 'home'
	`);
	return asInt(rowsFrom(result)[0]?.total);
}

export async function listPublicSitemapPagesPage(
	payload: Payload,
	input: { limit: number; offset: number },
): Promise<readonly { slug: string; updatedAt: string }[]> {
	const limit = Math.trunc(input.limit);
	const offset = Math.trunc(input.offset);
	if (!Number.isInteger(limit) || limit < 1) {
		throw new Error("sitemap page size must be a positive integer.");
	}
	if (!Number.isInteger(offset) || offset < 0) {
		throw new Error("sitemap offset must be a non-negative integer.");
	}

	const result = await getDrizzle(payload).execute(sql`
		SELECT slug, updated_at
		FROM pages
		WHERE status = 'published'
			AND published_at IS NOT NULL
			AND COALESCE(seo_noindex, false) = false
			AND slug <> 'home'
		ORDER BY slug ASC
		LIMIT ${limit}
		OFFSET ${offset}
	`);

	return rowsFrom(result).flatMap((row) => {
		if (row.slug == null || row.slug === "") return [];
		return [
			{
				slug: String(row.slug),
				updatedAt: String(row.updated_at ?? ""),
			},
		];
	});
}

export async function findPublicPropertyLifecycleRow(
	payload: Payload,
	slug: string,
): Promise<{
	status: "active" | "archived";
	publishedAt: string | null;
	contentPurgedAt: string | null;
} | null> {
	const result = await getDrizzle(payload).execute(sql`
		SELECT status, published_at, content_purged_at
		FROM properties
		WHERE slug = ${slug}
		LIMIT 1
	`);
	const row = rowsFrom(result)[0];
	if (!row) return null;
	return {
		status: row.status === "archived" ? "archived" : "active",
		publishedAt: row.published_at == null ? null : String(row.published_at),
		contentPurgedAt:
			row.content_purged_at == null ? null : String(row.content_purged_at),
	};
}

export async function findPublicRedirectByFromPath(
	payload: Payload,
	fromPath: string,
): Promise<PublicRedirectLookup> {
	const result = await getDrizzle(payload).execute(sql`
		SELECT "from", "to", status_code
		FROM redirects
		WHERE "from" = ${fromPath}
		LIMIT 1
	`);
	const row = rowsFrom(result)[0];
	if (!row?.from || !row.to) return null;
	return {
		from: String(row.from),
		to: String(row.to),
		statusCode: String(row.status_code ?? "301"),
	};
}

export async function publicRedirectDestinationIsChain(
	payload: Payload,
	destinationPath: string,
	sourcePath: string,
): Promise<boolean> {
	if (destinationPath === sourcePath) return true;
	const result = await getDrizzle(payload).execute(sql`
		SELECT 1
		FROM redirects
		WHERE "from" = ${destinationPath}
		LIMIT 1
	`);
	return rowsFrom(result).length > 0;
}
