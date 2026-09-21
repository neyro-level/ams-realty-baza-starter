import "server-only";

import type {
	HomePageDTO,
	MarketingPageDTO,
	PropertyCardDTO,
	PropertyDetailsDTO,
	PropertyFilterDTO,
	PropertyListDTO,
	SiteFooterDTO,
	SiteHeaderDTO,
} from "@ams/realtbase-contracts";
import type { PublicCatalogProperty, PublicCatalogResult } from "./catalog";
import type { PublicCatalogFacetsResult } from "./catalog";
import { leadConsentContext } from "../../../project/legal.config.ts";
import type { PublicPageRecord } from "./pages";
import { siteConfig } from "../../../project/site.config.ts";

const brandName = siteConfig.brandName;
const logo = {
	kind: "managed" as const,
	src: "/fixture/logo.svg",
	alt: brandName,
	width: 160,
	height: 40,
};

function rub(priceMinor: number) {
	return new Intl.NumberFormat(siteConfig.locale, {
		style: "currency",
		currency: siteConfig.currency,
		maximumFractionDigits: 0,
	}).format(priceMinor / 100);
}

function compact<T>(items: (T | null | undefined | false)[]): T[] {
	return items.filter(Boolean) as T[];
}

export type PublicPropertyLifecycle = {
	status: "active" | "archived";
	isArchived: boolean;
};

export type PublicPropertyDetailsDTO = PropertyDetailsDTO & {
	lifecycle: PublicPropertyLifecycle;
};

export function toPropertyCardDTO(
	property: PublicCatalogProperty,
): PropertyCardDTO {
	const address =
		property.publicAddress ||
		[property.locality, property.district].filter(Boolean).join(", ") ||
		"Адрес уточняется";

	return {
		id: String(property.id),
		slug: property.slug,
		href: `/obekty/${property.slug}`,
		title: property.title,
		category: property.category,
		dealType: property.dealType,
		price: property.priceMinor
			? {
					priceMinor: property.priceMinor,
					pricePerMeterMinor: property.pricePerMeterMinor ?? undefined,
					currency: property.currency ?? siteConfig.currency,
					period: property.dealType === "rent" ? "month" : "total",
					label: rub(property.priceMinor),
				}
			: null,
		address,
		city: property.locality || "Город не указан",
		district: property.district ?? undefined,
		primaryMedia: property.images?.find((image) => image.url)?.url
			? {
					kind: "external",
					src: property.images.find((image) => image.url)?.url ?? "",
					alt:
						property.images.find((image) => image.url)?.alt || property.title,
				}
			: null,
		summary: compact([
			property.rooms
				? {
						key: "rooms" as const,
						label: "Комнаты",
						value: String(property.rooms),
					}
				: null,
			property.totalArea
				? {
						key: "area" as const,
						label: "Площадь",
						value: `${property.totalArea} м²`,
					}
				: null,
			property.floor
				? {
						key: "floor" as const,
						label: "Этаж",
						value: property.floors
							? `${property.floor} из ${property.floors}`
							: String(property.floor),
					}
				: null,
		]),
		badges: [],
	};
}

export function toPropertyDetailsDTO(
	property: PublicCatalogProperty,
	related: readonly PublicCatalogProperty[],
): PublicPropertyDetailsDTO {
	const card = toPropertyCardDTO(property);

	return {
		...card,
		description: property.description || "Описание объекта уточняется.",
		lifecycle: {
			status: property.status,
			isArchived: property.status === "archived",
		},
		gallery:
			property.images
				?.filter((image) => image.url)
				.map((image) => ({
					kind: "external" as const,
					src: image.url ?? "",
					alt: image.alt || property.title,
				})) ?? [],
		characteristics: compact([
			property.totalArea
				? { label: "Общая площадь", value: `${property.totalArea} м²` }
				: null,
			property.livingArea
				? { label: "Жилая площадь", value: `${property.livingArea} м²` }
				: null,
			property.kitchenArea
				? { label: "Кухня", value: `${property.kitchenArea} м²` }
				: null,
			property.rooms
				? { label: "Комнаты", value: String(property.rooms) }
				: null,
			property.floor
				? {
						label: "Этаж",
						value: property.floors
							? `${property.floor} из ${property.floors}`
							: String(property.floor),
					}
				: null,
		]),
		location:
			typeof property.lat === "number" && typeof property.lng === "number"
				? { latitude: property.lat, longitude: property.lng }
				: undefined,
		related: related.map(toPropertyCardDTO),
	};
}

export function toPropertyListDTO(
	result: PublicCatalogResult,
): PropertyListDTO {
	return {
		items: result.items.map(toPropertyCardDTO),
		total: result.total,
		page: result.page,
		pageSize: result.pageSize,
		totalPages: result.totalPages,
		appliedFilters: result.applied,
	};
}

const categoryLabels = {
	apartment: "Квартиры",
	house: "Дома",
	land: "Участки",
	commercial: "Коммерческая",
} as const;

const dealTypeLabels = {
	sale: "Продажа",
	rent: "Аренда",
} as const;

export function toPropertyFilterDTO(
	result: PublicCatalogResult,
	facets?: PublicCatalogFacetsResult,
): PropertyFilterDTO {
	const rooms = facets
		? [...facets.rooms.map((bucket) => bucket.value)].sort((a, b) => a - b)
		: [
				...new Set(
					result.items
						.map((item) => item.rooms)
						.filter((room): room is number => Boolean(room)),
				),
			].sort((a, b) => a - b);
	const categories = facets
		? facets.categories.map((bucket) => bucket.value)
		: [...new Set(result.items.map((item) => item.category))];
	const dealTypes = facets
		? facets.dealTypes.map((bucket) => bucket.value)
		: [...new Set(result.items.map((item) => item.dealType))];
	const cities = facets
		? facets.cities.map((bucket) => bucket.value)
		: [
				...new Set(
					result.items
						.map((item) => item.locality)
						.filter((city): city is string => Boolean(city)),
				),
			];
	const districts = facets
		? facets.districts.map((bucket) => bucket.value)
		: [
				...new Set(
					result.items
						.map((item) => item.district)
						.filter((district): district is string => Boolean(district)),
				),
			];
	const priceMinor = facets
		? facets.priceMinor
		: {
				min: (() => {
					const prices = result.items
						.map((item) => item.priceMinor)
						.filter((price): price is number => Boolean(price));
					return prices.length ? Math.min(...prices) : null;
				})(),
				max: (() => {
					const prices = result.items
						.map((item) => item.priceMinor)
						.filter((price): price is number => Boolean(price));
					return prices.length ? Math.max(...prices) : null;
				})(),
			};

	return {
		categories: categories.flatMap((category) => {
			const label = categoryLabels[category as keyof typeof categoryLabels];
			return label
				? [{ value: category as keyof typeof categoryLabels, label }]
				: [];
		}),
		dealTypes: dealTypes.flatMap((dealType) => {
			const label = dealTypeLabels[dealType as keyof typeof dealTypeLabels];
			return label
				? [{ value: dealType as keyof typeof dealTypeLabels, label }]
				: [];
		}),
		cities: cities.map((city) => ({ value: city, label: city })),
		districts: districts.map((district) => ({
			value: district,
			label: district,
		})),
		rooms,
		priceMinor,
		buildingTypes: [],
		renovations: [],
		landUseTypes: [],
		commercialTypes: [],
		commercialBuildingTypes: [],
		entranceTypes: [],
		applied: result.applied,
		total: result.total,
		resultLabel: `${result.total} ${result.total === 1 ? "объект" : "объектов"}`,
	};
}

export function toShellDTO(pages: readonly PublicPageRecord[]) {
	const starterNavigation = [
		{ label: "Недвижимость", href: "/nedvizhimost" },
		{ label: "Услуги", href: "/uslugi" },
		{ label: "Ипотека", href: "/ipoteka" },
		{ label: "О компании", href: "/o-kompanii" },
		{ label: "Контакты", href: "/kontakty" },
	];
	const cmsNavigation = pages
		.filter((page) => page.slug !== "home")
		.slice(0, 6)
		.map((page) => ({ label: page.title, href: `/${page.slug}` }));
	const links = cmsNavigation.length ? cmsNavigation : starterNavigation;

	const header: SiteHeaderDTO = {
		brandName,
		homeHref: "/",
		logo,
		navigation: links,
		phone: { label: "+7 (000) 000-00-00", href: "tel:+70000000000" },
		primaryAction: { label: "Подобрать объект", href: "/nedvizhimost" },
	};

	const footer: SiteFooterDTO = {
		brandName,
		logo,
		groups: [{ title: "Разделы", links }],
		contacts: [{ label: "+7 (000) 000-00-00", href: "tel:+70000000000" }],
		legalLinks: [
			{
				label: "Политика конфиденциальности",
				href: "/politika-konfidencialnosti",
			},
			{
				label: "Согласие на обработку данных",
				href: "/soglasie-na-obrabotku-personalnyh-dannyh",
			},
		],
		copyright: `© ${brandName}`,
	};

	return { header, footer } as const;
}

export function toHomePageDTO(page: PublicPageRecord | null): HomePageDTO {
	return {
		slug: "home",
		eyebrow: "Недвижимость без лишней неопределённости",
		title: page?.title || "Проверенная недвижимость",
		lead:
			page?.seo.description ||
			"Подбираем объекты по вашим критериям и сопровождаем путь до сделки.",
		seo: page?.seo ?? {
			title: `${brandName} — недвижимость`,
			description: "Подбор недвижимости и сопровождение сделки.",
			canonicalPath: "/",
			indexing: "index",
			following: "follow",
		},
		breadcrumbs: { items: [{ label: "Главная" }] },
		sections: [
			{
				title: "Понятный процесс",
				text: "Сначала фиксируем задачу, затем сравниваем подходящие предложения.",
				items: [
					"Уточняем задачу и бюджет",
					"Проверяем документы",
					"Сопровождаем сделку",
				],
			},
		],
		leadContext: {
			formKind: "general",
			sourcePage: "/",
			...leadConsentContext(),
		},
		featuredPropertyId: "",
		serviceLinks: [
			{
				label: "Купить",
				href: "/nedvizhimost",
				description: "Квартиры и дома в каталоге",
			},
			{
				label: "Продать",
				href: "/prodat",
				description: "Оценка и сопровождение продажи",
			},
			{
				label: "Сдать",
				href: "/sdat",
				description: "Аренда без лишней неопределённости",
			},
			{
				label: "Ипотека",
				href: "/ipoteka",
				description: "Подбор программы и одобрение",
			},
		],
	};
}

export function toMarketingPageDTO(page: PublicPageRecord): MarketingPageDTO {
	return {
		slug: page.slug,
		eyebrow: "Страница",
		title: page.title,
		lead: page.seo.description,
		seo: page.seo,
		breadcrumbs: {
			items: [{ label: "Главная", href: "/" }, { label: page.title }],
		},
		sections: [],
		leadContext: {
			formKind: "general",
			sourcePage: page.seo.canonicalPath,
			...leadConsentContext(),
		},
	};
}
