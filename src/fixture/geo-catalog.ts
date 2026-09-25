import type {
	CityDTO,
	DeveloperDetailsDTO,
	DevelopmentDetailsDTO,
	DistrictDTO,
	GeoHubDTO,
	ListingPageDTO,
	PageKeyDTO,
	PageLinkDTO,
	RegionDTO,
	SeoMetaDTO,
} from "@ams/realtbase-contracts";
import {
	createSafeNavigationBuilder,
	type NavigationCandidate,
} from "../core/navigation/index.ts";
import type { ContentGateDecision } from "../core/seo/content-gate.ts";
import { siteProfileFixtures } from "../project/site-profile.ts";
import { createProjectUrlGrammar } from "../project/url-grammar.ts";
import { fixtureProperties } from "./provider.ts";

const grammar = createProjectUrlGrammar(siteProfileFixtures.multiGeo);
const navigation = createSafeNavigationBuilder({
	profile: siteProfileFixtures.multiGeo,
	grammar,
});

function href(pageKey: PageKeyDTO): string {
	return grammar.buildUrl(pageKey);
}

function gate(
	pageKey: PageKeyDTO,
	indexing: "index" | "noindex" = "index",
): ContentGateDecision {
	return {
		statusCode: 200,
		indexing,
		following: "follow",
		canonical: href(pageKey),
		includeInSitemap: indexing === "index",
		reasons: indexing === "index" ? [] : ["fixture_noindex"],
	};
}

function candidate(
	pageKey: PageKeyDTO,
	label: string,
	count?: number,
	indexing: "index" | "noindex" = "index",
): NavigationCandidate {
	return { pageKey, label, count, gate: gate(pageKey, indexing) };
}

function links(
	candidates: readonly NavigationCandidate[],
): readonly PageLinkDTO[] {
	return navigation.links(candidates);
}

function link(pageKey: PageKeyDTO, label: string, count?: number): PageLinkDTO {
	const result = links([candidate(pageKey, label, count)])[0];
	if (!result) throw new Error(`Fixture link is not safe: ${label}`);
	return result;
}

function seo(
	title: string,
	description: string,
	pageKey: PageKeyDTO,
): SeoMetaDTO {
	return {
		title,
		description,
		canonicalPath: href(pageKey),
		indexing: "noindex",
		following: "follow",
	};
}

export const fixtureRegion = {
	id: "region-fixture-1",
	slug: "primorskiy-region",
	name: "Приморский регион",
	shortName: "Приморье",
} satisfies RegionDTO;

export const fixtureCity = {
	id: "city-fixture-1",
	slug: "primorsk",
	name: "Приморск",
	nameGenitive: "Приморска",
	nameLocative: "Приморске",
	preposition: "в",
	type: "city",
	region: fixtureRegion,
	coordinates: { latitude: 43.1, longitude: 131.9 },
} satisfies CityDTO;

export const fixtureDistrict = {
	id: "district-fixture-1",
	slug: "severnyy",
	name: "Северный",
	type: "microdistrict",
	citySlug: fixtureCity.slug,
	nameLocative: "Северном",
	preposition: "в",
} satisfies DistrictDTO;

const developerKey = { kind: "developer", slug: "demo-developer" } as const;

export const fixtureDeveloper = {
	id: "developer-fixture-1",
	slug: "demo-developer",
	pageKey: developerKey,
	href: href(developerKey),
	name: "Демо Девелопмент",
	developmentsCount: 1,
	geoNames: [fixtureCity.name],
	description: "Проверяемое описание демонстрационного застройщика.",
	breadcrumbs: {
		...navigation.breadcrumbs({
			ancestors: [
				candidate({ kind: "home" }, "Главная"),
				candidate({ kind: "developerRoot" }, "Застройщики"),
			],
			currentLabel: "Демо Девелопмент",
		}),
	},
	seo: seo(
		"Демо Девелопмент",
		"Демонстрационная карточка застройщика.",
		developerKey,
	),
} satisfies DeveloperDetailsDTO;

const developmentKey = {
	kind: "development",
	developmentKind: "residential_complex",
	slug: "severnyy-park",
} as const;

export const fixtureDevelopment = {
	id: "development-fixture-1",
	slug: "severnyy-park",
	pageKey: developmentKey,
	href: href(developmentKey),
	name: "Северный парк",
	kind: "residential_complex",
	cityName: fixtureCity.name,
	districtName: fixtureDistrict.name,
	address: "Приморск, Северный микрорайон",
	developer: {
		id: fixtureDeveloper.id,
		name: fixtureDeveloper.name,
		pageKey: fixtureDeveloper.pageKey,
		href: fixtureDeveloper.href,
	},
	availability: "available",
	completionLabel: "Сдан",
	description: "Демонстрационный жилой комплекс для contract fixture.",
	gallery: [],
	priceRows: [
		{
			label: "Квартиры",
			price: {
				priceMinor: 900_000_000,
				currency: "RUB",
				period: "total",
				label: "от 9 000 000 ₽",
			},
			checkedAt: "2026-09-24T00:00:00.000Z",
		},
	],
	characteristics: [{ label: "Класс", value: "Комфорт" }],
	breadcrumbs: navigation.breadcrumbs({
		ancestors: [
			candidate({ kind: "home" }, "Главная"),
			candidate(
				{ kind: "categoryRoot", category: "novostroyki" },
				"Новостройки",
			),
		],
		currentLabel: "Северный парк",
	}),
	seo: seo(
		"ЖК Северный парк",
		"Демонстрационная карточка жилого комплекса.",
		developmentKey,
	),
} satisfies DevelopmentDetailsDTO;

const geoHubKey = { kind: "geoHub", geo: fixtureCity.slug } as const;

export const fixtureGeoHub = {
	city: fixtureCity,
	title: "Недвижимость в Приморске",
	intro: "Демонстрационная географическая витрина каталога недвижимости.",
	breadcrumbs: navigation.breadcrumbs({
		ancestors: [candidate({ kind: "home" }, "Главная")],
		currentLabel: fixtureCity.name,
	}),
	seo: seo(
		"Недвижимость в Приморске",
		"Каталог недвижимости в Приморске.",
		geoHubKey,
	),
	categoryLinks: links([
		candidate(
			{ kind: "categoryGeo", geo: fixtureCity.slug, category: "kvartiry" },
			"Квартиры",
			3,
		),
	]),
	districtLinks: links([
		candidate(
			{
				kind: "categoryGeoDistrict",
				geo: fixtureCity.slug,
				category: "kvartiry",
				district: fixtureDistrict.slug,
			},
			fixtureDistrict.name,
			3,
		),
	]),
	developerLink: link(
		{ kind: "geoDevelopers", geo: fixtureCity.slug },
		"Застройщики Приморска",
		1,
	),
	nearby: links([
		candidate(
			{ kind: "geoHub", geo: "zarechnyy" },
			"Заречный",
			undefined,
			"noindex",
		),
	]),
} satisfies GeoHubDTO;

const listingKey = {
	kind: "categoryGeo",
	geo: fixtureCity.slug,
	category: "kvartiry",
} as const;

export const fixtureListing = {
	pageKey: listingKey,
	href: href(listingKey),
	h1: "Квартиры в Приморске",
	intro:
		"Демонстрационная выдача квартир с проверяемой канонической навигацией.",
	items: fixtureProperties.map((item) => ({ kind: "property" as const, item })),
	total: fixtureProperties.length,
	pagination: { page: 1, pageSize: 12, totalPages: 1 },
	subLinks: links([
		candidate(
			{
				kind: "categoryGeoDistrict",
				geo: fixtureCity.slug,
				category: "kvartiry",
				district: fixtureDistrict.slug,
			},
			"Северный микрорайон",
			3,
		),
	]),
	nearby: links([
		candidate(
			{ kind: "categoryGeo", geo: "zarechnyy", category: "kvartiry" },
			"Квартиры в Заречном",
			undefined,
			"noindex",
		),
	]),
	robots: { indexing: "noindex", following: "follow" },
	canonical: href(listingKey),
	breadcrumbs: fixtureGeoHub.breadcrumbs,
	seo: seo(
		"Квартиры в Приморске",
		"Демонстрационная выдача квартир в Приморске.",
		listingKey,
	),
} satisfies ListingPageDTO;

export const fixtureGeoSwitcherOptions = links([
	candidate({ kind: "geoHub", geo: "primorsk" }, "Приморск"),
	candidate(
		{ kind: "geoHub", geo: "zarechnyy" },
		"Заречный",
		undefined,
		"noindex",
	),
]);

export const geoCatalogContractFixtures = {
	region: fixtureRegion,
	city: fixtureCity,
	district: fixtureDistrict,
	geoHub: fixtureGeoHub,
	developer: fixtureDeveloper,
	development: fixtureDevelopment,
	listing: fixtureListing,
} as const;
