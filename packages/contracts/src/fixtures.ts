import type {
	BreadcrumbDTO,
	LeadFormContext,
	MediaDTO,
	PageSEOContract,
	PropertyCardDTO,
	PropertyDetailsDTO,
	PropertyFilterDTO,
	PropertyListDTO,
	SiteFooterDTO,
	SiteHeaderDTO,
} from "./index";

const logo = {
	kind: "managed",
	src: "/fixture/logo.svg",
	alt: "AMS Realty Baza Starter",
	width: 160,
	height: 40,
} as const satisfies MediaDTO;

export const baseContractFixture = {
	propertyCard: {
		id: "fixture-property-1",
		slug: "fixture-apartment",
		href: "/obekty/fixture-apartment",
		title: "Двухкомнатная квартира, 58,4 м²",
		category: "apartment",
		dealType: "sale",
		price: {
			priceMinor: 890_000_000,
			pricePerMeterMinor: 15_239_726,
			currency: "RUB",
			period: "total",
			label: "8 900 000 ₽",
		},
		address: "Демо-город, Центральный район",
		city: "Демо-город",
		district: "Центральный",
		primaryMedia: null,
		summary: [{ key: "area", label: "Площадь", value: "58,4 м²" }],
		badges: ["Проверено"],
	} satisfies PropertyCardDTO,
	filters: {
		categories: [{ value: "apartment", label: "Квартиры" }],
		dealTypes: [{ value: "sale", label: "Продажа" }],
		cities: [{ value: "demo-city", label: "Демо-город" }],
		districts: [{ value: "central", label: "Центральный", parentValue: "demo-city" }],
		rooms: [1, 2, 3, 4],
		priceMinor: { min: 200_000_000, max: 3_000_000_000 },
		buildingTypes: [],
		renovations: [],
		landUseTypes: [],
		commercialTypes: [],
		commercialBuildingTypes: [],
		entranceTypes: [],
		applied: { sort: "recommended", view: "grid" },
		total: 1,
		resultLabel: "1 объект",
	} satisfies PropertyFilterDTO,
	header: {
		brandName: "AMS Realty Baza Starter",
		homeHref: "/",
		logo,
		navigation: [{ label: "Недвижимость", href: "/nedvizhimost" }],
		primaryAction: { label: "Подобрать объект", href: "#lead-form" },
	} satisfies SiteHeaderDTO,
	footer: {
		brandName: "AMS Realty Baza Starter",
		logo,
		groups: [{ title: "Недвижимость", links: [{ label: "Каталог", href: "/nedvizhimost" }] }],
		contacts: [],
		legalLinks: [{ label: "Правовая информация", href: "/legal" }],
		copyright: "© AMS Realty Baza Starter",
	} satisfies SiteFooterDTO,
	breadcrumbs: {
		items: [{ label: "Главная", href: "/" }, { label: "Объект" }],
	} satisfies BreadcrumbDTO,
	seo: {
		title: "Недвижимость — AMS Realty Baza Starter",
		description: "Проверенная недвижимость в демо-каталоге.",
		canonicalPath: "/nedvizhimost",
		indexing: "noindex",
		following: "nofollow",
	} satisfies PageSEOContract,
	lead: {
		formKind: "property",
		sourcePage: "/obekty/fixture-apartment",
		property: { id: "fixture-property-1", slug: "fixture-apartment", title: "Двухкомнатная квартира" },
		consentVersion: "fixture-consent-v1",
		consentHref: "/legal/personal-data",
		consentRequired: true,
	} satisfies LeadFormContext,
} as const;

export const propertyListFixture = {
	items: [baseContractFixture.propertyCard],
	total: 1,
	page: 1,
	pageSize: 12,
	totalPages: 1,
	appliedFilters: baseContractFixture.filters.applied,
} as const satisfies PropertyListDTO;

export const propertyDetailsFixture = {
	...baseContractFixture.propertyCard,
	description: "Демонстрационное описание объекта.",
	gallery: [],
	characteristics: [{ label: "Ремонт", value: "Современный" }],
	related: [],
} as const satisfies PropertyDetailsDTO;
