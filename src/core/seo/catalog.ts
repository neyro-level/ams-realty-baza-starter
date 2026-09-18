import type { Metadata } from "next";
import type { CatalogQueryInput } from "@/core/data-access/public";
import { projectConfig } from "../../project/project.config.ts";
import { absoluteUrl, siteBrandName } from "./site.ts";

const indexedFilterKeys = projectConfig.indexedCatalogFilterKeys;
const allowedControlKeys = ["page", "sort", "view"] as const;
const nonIndexableFilterKeys = [
	"query",
	"limit",
	"priceFromMinor",
	"priceToMinor",
	"areaFrom",
	"areaTo",
] as const;

export const catalogSeoParamPolicy = {
	indexedFilterKeys,
	allowedControlKeys,
	nonIndexableFilterKeys,
} as const;

type SearchParamValue = string | string[] | undefined;
export type CatalogSearchParams = Record<string, SearchParamValue>;

export type CatalogSeoDecision = {
	canonicalPath: string;
	index: boolean;
	follow: boolean;
	reason:
		| "base"
		| "whitelisted_filter"
		| "control_or_nonindex_filter"
		| "unknown_param";
	query: CatalogQueryInput;
};

export function buildCatalogSeoDecision(
	searchParams: CatalogSearchParams = {},
): CatalogSeoDecision {
	const entries = normalizeSearchParams(searchParams);
	const knownKeys = new Set<string>([
		...indexedFilterKeys,
		...allowedControlKeys,
		...nonIndexableFilterKeys,
	]);
	const hasUnknownParam = entries.some(([key]) => !knownKeys.has(key));
	const hasNonIndexParam = entries.some(([key]) =>
		(
			[...allowedControlKeys, ...nonIndexableFilterKeys] as readonly string[]
		).includes(key),
	);
	const indexedEntries = entries.filter(([key]) =>
		(indexedFilterKeys as readonly string[]).includes(key),
	);
	const canonicalPath = buildCatalogCanonicalPath(indexedEntries);
	const query = buildCatalogQuery(entries);

	if (hasUnknownParam) {
		return {
			canonicalPath,
			index: false,
			follow: true,
			reason: "unknown_param",
			query,
		};
	}

	if (hasNonIndexParam) {
		return {
			canonicalPath,
			index: false,
			follow: true,
			reason: "control_or_nonindex_filter",
			query,
		};
	}

	return {
		canonicalPath,
		index: true,
		follow: true,
		reason: indexedEntries.length ? "whitelisted_filter" : "base",
		query,
	};
}

export function buildCatalogMetadata(
	searchParams: CatalogSearchParams = {},
): Metadata {
	const decision = buildCatalogSeoDecision(searchParams);
	const hasFilter = decision.canonicalPath.includes("?");
	const title = hasFilter
		? `Подбор недвижимости — ${siteBrandName}`
		: `Каталог недвижимости — ${siteBrandName}`;

	return {
		title,
		description: "Каталог опубликованных объектов недвижимости.",
		alternates: { canonical: decision.canonicalPath },
		openGraph: {
			title,
			description: "Каталог опубликованных объектов недвижимости.",
			url: absoluteUrl(decision.canonicalPath),
			type: "website",
		},
		robots: {
			index: decision.index,
			follow: decision.follow,
		},
	};
}

function normalizeSearchParams(
	searchParams: CatalogSearchParams,
): [string, string][] {
	const entries: [string, string][] = [];
	for (const [key, raw] of Object.entries(searchParams)) {
		const values = Array.isArray(raw) ? raw : [raw];
		for (const value of values) {
			if (typeof value === "string" && value.trim()) {
				entries.push([key, value.trim()]);
			}
		}
	}
	return entries.sort(([leftKey, leftValue], [rightKey, rightValue]) =>
		leftKey === rightKey
			? leftValue.localeCompare(rightValue)
			: leftKey.localeCompare(rightKey),
	);
}

function buildCatalogCanonicalPath(entries: [string, string][]): string {
	if (!entries.length) return "/nedvizhimost";
	const params = new URLSearchParams();
	for (const [key, value] of entries) params.append(key, value);
	return `/nedvizhimost?${params.toString()}`;
}

function buildCatalogQuery(entries: [string, string][]): CatalogQueryInput {
	const query: CatalogQueryInput = { page: 1, limit: 24 };
	const rooms: number[] = [];

	for (const [key, value] of entries) {
		if (key === "rooms") {
			const room = Number(value);
			if (Number.isInteger(room) && room > 0) rooms.push(room);
			continue;
		}
		if (
			key === "category" ||
			key === "dealType" ||
			key === "city" ||
			key === "district" ||
			key === "query" ||
			key === "sort" ||
			key === "view"
		) {
			query[key] = value as never;
			continue;
		}
		if (
			key === "page" ||
			key === "limit" ||
			key === "priceFromMinor" ||
			key === "priceToMinor" ||
			key === "areaFrom" ||
			key === "areaTo"
		) {
			const numeric = Number(value);
			if (Number.isFinite(numeric)) query[key] = numeric as never;
		}
	}

	if (rooms.length) query.rooms = rooms;
	return query;
}
