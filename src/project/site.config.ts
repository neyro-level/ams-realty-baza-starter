export type ProjectKind = "starter-demo" | "client";

export type SiteConfig = {
	brandName: string;
	defaultTitle: string;
	defaultDescription: string;
	locale: string;
	currency: string;
	projectKind: ProjectKind;
};

export const siteConfig = {
	brandName: "AMS Realty Baza Starter",
	defaultTitle: "AMS Realty Baza Starter",
	defaultDescription: "Базовая платформа AMS для сайтов агентств недвижимости.",
	locale: "ru-RU",
	currency: "RUB",
	projectKind: "starter-demo",
} as const satisfies SiteConfig;
