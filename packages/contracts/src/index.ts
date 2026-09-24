export const contractVersion = "2.0.0" as const;

export type { NapDTO } from "./nap";
export const contractState = "draft" as const;

export type { PropertyCategory, PropertyDealType } from "./common";
export type { MediaDTO } from "./media";
export type {
	PropertyCardDTO,
	PropertyCharacteristicDTO,
	PropertyDetailsDTO,
	PropertyListDTO,
	PropertyPriceDTO,
	PropertySummaryItemDTO,
} from "./property";
export type {
	AppliedPropertyFiltersDTO,
	PropertyFilterDTO,
	PropertyFilterOptionDTO,
	PropertySort,
	PropertyView,
} from "./filters";
export type {
	SiteFooterDTO,
	SiteFooterGroupDTO,
	SiteHeaderDTO,
	SiteNavItemDTO,
} from "./shell";
export type { BreadcrumbDTO, BreadcrumbItemDTO, PageSEOContract } from "./seo";
export type {
	LeadFormContext,
	LeadFormKind,
	LeadPropertyContextDTO,
} from "./lead";
export type {
	HomePageDTO,
	MarketingPageDTO,
	MarketingSectionDTO,
} from "./marketing";
