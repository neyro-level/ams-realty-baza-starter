import type { AppliedPropertyFiltersDTO } from "./filters";
import type { MediaDTO } from "./media";
import type { PropertyCategory, PropertyDealType } from "./common";

export type PropertyPriceDTO = {
	priceMinor: number;
	pricePerMeterMinor?: number;
	currency: "RUB";
	period?: "total" | "month";
	label: string;
};

export type PropertySummaryItemDTO = {
	key: "area" | "livingArea" | "kitchenArea" | "floor" | "rooms" | "lotArea";
	label: string;
	value: string;
};

export type PropertyCharacteristicDTO = {
	label: string;
	value: string;
};

export type PropertyCardDTO = {
	id: string;
	slug: string;
	href: string;
	title: string;
	category: PropertyCategory;
	dealType: PropertyDealType;
	price: PropertyPriceDTO | null;
	address: string;
	city: string;
	district?: string;
	primaryMedia: MediaDTO | null;
	summary: readonly PropertySummaryItemDTO[];
	badges: readonly string[];
};

export type PropertyDetailsDTO = PropertyCardDTO & {
	description: string;
	gallery: readonly MediaDTO[];
	characteristics: readonly PropertyCharacteristicDTO[];
	location?: {
		latitude: number;
		longitude: number;
	};
	related: readonly PropertyCardDTO[];
};

export type PropertyListDTO = {
	items: readonly PropertyCardDTO[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	appliedFilters: AppliedPropertyFiltersDTO;
};
