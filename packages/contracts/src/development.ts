import type { DevelopmentKind } from "./common";
import type { DeveloperCardDTO } from "./developer";
import type { MediaDTO } from "./media";
import type { PropertyPriceDTO } from "./property";
import type { PageKeyDTO } from "./routing";
import type { BreadcrumbDTO, SeoMetaDTO } from "./seo";

export type DevelopmentCardDTO = {
	id: string;
	slug: string;
	pageKey: PageKeyDTO;
	href: string;
	name: string;
	kind: DevelopmentKind;
	cityName: string;
	districtName?: string;
	address?: string;
	developer?: Pick<DeveloperCardDTO, "id" | "name" | "href" | "pageKey">;
	primaryMedia?: MediaDTO;
	priceFrom?: PropertyPriceDTO;
	availability: "available" | "limited" | "sold_out" | "unknown";
	completionLabel?: string;
};

export type DevelopmentDetailsDTO = DevelopmentCardDTO & {
	description?: string;
	gallery: readonly MediaDTO[];
	coordinates?: { latitude: number; longitude: number };
	priceRows: readonly {
		label: string;
		price: PropertyPriceDTO;
		checkedAt: string;
	}[];
	characteristics: readonly { label: string; value: string }[];
	breadcrumbs: BreadcrumbDTO;
	seo: SeoMetaDTO;
};
