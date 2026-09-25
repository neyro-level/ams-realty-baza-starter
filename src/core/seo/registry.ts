import type { PageKey } from "../routing/url-grammar.ts";

export const seoEvidenceSources = [
	"wordstat",
	"broad39",
	"webmaster",
	"fallback_no_data",
] as const;

export const seoTemplateKeys = [
	"home",
	"geoHub",
	"categoryRoot",
	"categoryGeo",
	"categoryGeoDistrict",
	"categoryGeoFacet",
	"geoDevelopers",
	"developmentNormal",
	"developmentCollision",
	"developer",
	"property",
] as const;
export const seoTiers = ["P1", "P2", "TEST", "NONE"] as const;

export type SeoEvidenceSource = (typeof seoEvidenceSources)[number];
export type SeoTemplateKey = (typeof seoTemplateKeys)[number];
export type SeoTier = (typeof seoTiers)[number];
export type SeoRobots = "index,follow" | "noindex,follow";
export type SeoRegistryStatus = "draft" | "approved" | "retired";

export type ApprovedMorphology = {
	approved: boolean;
	nominative: string;
	genitive?: string;
	prepositional?: string;
	preposition?: "в" | "во";
};

export type SeoTemplateContext = {
	brand: string;
	category?: string;
	city?: ApprovedMorphology;
	region?: ApprovedMorphology;
	district?: ApprovedMorphology;
	facet?: string;
	entityName?: string;
	inventory?: number;
	freshPrice?: {
		label: string;
		fresh: boolean;
	};
};

export type RenderedSeoTemplate = {
	title: string;
	h1: string;
	description: string;
	morphologyApproved: boolean;
};

export type SeoRegistryRow = {
	pageKey: PageKey;
	url: string;
	canonical: string;
	entityRef: string | null;
	targetPhrases: readonly string[];
	metric: "searchDemand";
	value: number | null;
	source: SeoEvidenceSource;
	snapshotDate: string;
	synthetic: boolean;
	tier: SeoTier;
	minimumObjects: number;
	defaultRobots: SeoRobots;
	templateKey: SeoTemplateKey;
	title: string;
	h1: string;
	description: string;
	status: SeoRegistryStatus;
	morphologyApproved: boolean;
};

export type SeoRegistryGuardInput = {
	rows: readonly SeoRegistryRow[];
	buildUrl: (pageKey: PageKey) => string;
	now?: Date;
};

function compact(
	parts: readonly (string | null | undefined | false)[],
): string {
	return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function requireText(value: string | undefined, label: string): string {
	const normalized = value?.trim();
	if (!normalized) throw new Error(`SEO template requires ${label}.`);
	return normalized;
}

function morphologyValues(context: SeoTemplateContext): ApprovedMorphology[] {
	return [context.city, context.region, context.district].filter(
		(value): value is ApprovedMorphology => Boolean(value),
	);
}

function cityPhrase(context: SeoTemplateContext): string | null {
	if (!context.city) return null;
	const city = context.city.prepositional ?? context.city.nominative;
	return `${context.city.preposition ?? "в"} ${city}`;
}

function geoPossessive(context: SeoTemplateContext): string | null {
	const geo = context.city ?? context.region;
	if (!geo) return null;
	return geo.genitive ?? geo.nominative;
}

function districtPhrase(context: SeoTemplateContext): string | null {
	if (!context.district) return null;
	return `в ${context.district.prepositional ?? context.district.nominative}`;
}

function inventoryFragment(inventory: number | undefined): string | null {
	if (inventory === undefined) return null;
	if (!Number.isSafeInteger(inventory) || inventory < 0) {
		throw new Error("SEO inventory must be a non-negative safe integer.");
	}
	return `${inventory} объектов`;
}

function priceFragment(price: SeoTemplateContext["freshPrice"]): string | null {
	if (!price) return null;
	if (!price.fresh) return null;
	return requireText(price.label, "freshPrice.label");
}

export function renderSeoTemplate(
	templateKey: SeoTemplateKey,
	context: SeoTemplateContext,
): RenderedSeoTemplate {
	const brand = requireText(context.brand, "brand");
	const category = context.category?.trim();
	const city = cityPhrase(context);
	const possessiveGeo = geoPossessive(context);
	const district = districtPhrase(context);
	const inventory = inventoryFragment(context.inventory);
	const price = priceFragment(context.freshPrice);
	const entity = context.entityName?.trim();
	const facet = context.facet?.trim();
	let h1: string;
	let description: string;

	switch (templateKey) {
		case "home":
			h1 = compact(["Недвижимость", possessiveGeo]);
			description = compact([
				"Подбор недвижимости",
				city,
				inventory ? `— ${inventory}.` : null,
			]);
			break;
		case "geoHub":
			h1 = compact(["Недвижимость", possessiveGeo]);
			description = compact([
				"Квартиры, дома и новостройки",
				city,
				inventory ? `— ${inventory}.` : null,
			]);
			break;
		case "categoryRoot":
			h1 = requireText(category, "category");
			description = compact([
				`${h1} — актуальные предложения`,
				inventory ? `${inventory}.` : null,
			]);
			break;
		case "categoryGeo":
			h1 = compact([requireText(category, "category"), city]);
			description = compact([
				`${h1} — актуальные предложения`,
				inventory ? `${inventory}.` : null,
			]);
			break;
		case "categoryGeoDistrict":
			h1 = compact([requireText(category, "category"), district, city]);
			description = compact([
				`${h1} — актуальные предложения`,
				inventory ? `${inventory}.` : null,
			]);
			break;
		case "categoryGeoFacet":
			h1 = compact([
				requireText(facet, "facet"),
				requireText(category, "category"),
				city,
			]);
			description = compact([
				`${h1} — актуальные предложения`,
				inventory ? `${inventory}.` : null,
			]);
			break;
		case "geoDevelopers":
			h1 = compact(["Застройщики", city]);
			description = compact([
				"Застройщики и проверенные жилые комплексы",
				city,
				inventory ? `— ${inventory}.` : null,
			]);
			break;
		case "developmentNormal":
			h1 = requireText(entity, "entityName");
			description = compact([h1, city, price ? `— ${price}.` : null]);
			break;
		case "developmentCollision":
			h1 = compact([requireText(entity, "entityName"), city]);
			description = compact([h1, price ? `— ${price}.` : null]);
			break;
		case "developer":
			h1 = requireText(entity, "entityName");
			description = compact([
				`Объекты застройщика ${h1}`,
				city,
				inventory ? `— ${inventory}.` : null,
			]);
			break;
		case "property":
			h1 = requireText(entity, "entityName");
			description = compact([h1, city, price ? `— ${price}.` : null]);
			break;
	}

	return {
		title: compact([h1, `— ${brand}`]),
		h1,
		description,
		morphologyApproved: morphologyValues(context).every(
			(value) => value.approved,
		),
	};
}

function normalizeIntent(phrase: string): string {
	return phrase.trim().toLocaleLowerCase("ru-RU").replace(/\s+/g, " ");
}

function assertSnapshotDate(value: string, now: Date): void {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new Error(`SEO snapshot date must use YYYY-MM-DD: ${value}`);
	}
	const parsed = new Date(`${value}T00:00:00.000Z`);
	if (
		Number.isNaN(parsed.getTime()) ||
		parsed.toISOString().slice(0, 10) !== value
	) {
		throw new Error(`SEO snapshot date is invalid: ${value}`);
	}
	if (parsed.getTime() > now.getTime()) {
		throw new Error(`SEO snapshot date cannot be in the future: ${value}`);
	}
}

export function assertSeoRegistry(input: SeoRegistryGuardInput): void {
	const urls = new Set<string>();
	const canonicals = new Set<string>();
	const intents = new Set<string>();
	const now = input.now ?? new Date();

	for (const row of input.rows) {
		if (!(seoEvidenceSources as readonly string[]).includes(row.source)) {
			throw new Error(`Unsupported SEO evidence source: ${row.source}`);
		}
		if (!(seoTiers as readonly string[]).includes(row.tier)) {
			throw new Error(`Unsupported SEO tier: ${row.tier}`);
		}
		const expectedUrl = input.buildUrl(row.pageKey);
		if (row.url !== expectedUrl) {
			throw new Error(`SEO URL differs from buildUrl(PageKey): ${row.url}`);
		}
		if (row.canonical !== expectedUrl) {
			throw new Error(
				`SEO canonical differs from buildUrl(PageKey): ${row.canonical}`,
			);
		}
		if (urls.has(row.url)) throw new Error(`Duplicate SEO URL: ${row.url}`);
		if (canonicals.has(row.canonical)) {
			throw new Error(`Duplicate SEO canonical: ${row.canonical}`);
		}
		urls.add(row.url);
		canonicals.add(row.canonical);

		if (!row.targetPhrases.length) {
			throw new Error(`SEO target phrases are empty: ${row.url}`);
		}
		for (const phrase of row.targetPhrases) {
			const intent = normalizeIntent(phrase);
			if (!intent) throw new Error(`SEO target phrase is blank: ${row.url}`);
			if (intents.has(intent))
				throw new Error(`Duplicate SEO intent: ${intent}`);
			intents.add(intent);
		}

		assertSnapshotDate(row.snapshotDate, now);
		if (row.source === "fallback_no_data") {
			if (row.value !== null) {
				throw new Error(`fallback_no_data must keep value null: ${row.url}`);
			}
		} else if (
			row.value === null ||
			!Number.isFinite(row.value) ||
			row.value < 0
		) {
			throw new Error(
				`Measured SEO evidence needs a non-negative value: ${row.url}`,
			);
		}
		if (!Number.isSafeInteger(row.minimumObjects) || row.minimumObjects < 0) {
			throw new Error(`SEO minimumObjects is invalid: ${row.url}`);
		}
		if (!row.morphologyApproved && row.defaultRobots === "index,follow") {
			throw new Error(`Unapproved morphology cannot be indexable: ${row.url}`);
		}
		if (
			row.synthetic &&
			(row.status === "approved" || row.defaultRobots === "index,follow")
		) {
			throw new Error(
				`Synthetic SEO row cannot be approved or indexable: ${row.url}`,
			);
		}
		for (const [field, value] of [
			["title", row.title],
			["h1", row.h1],
			["description", row.description],
		] as const) {
			if (!value.trim()) throw new Error(`SEO ${field} is empty: ${row.url}`);
		}
	}
}
