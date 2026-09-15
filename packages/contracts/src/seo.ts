import type { MediaDTO } from "./media";

export type BreadcrumbItemDTO = {
	label: string;
	href?: string;
};

export type BreadcrumbDTO = {
	items: readonly BreadcrumbItemDTO[];
};

export type PageSEOContract = {
	title: string;
	description: string;
	canonicalPath: string;
	indexing: "index" | "noindex";
	following: "follow" | "nofollow";
	openGraph?: {
		title?: string;
		description?: string;
		image?: MediaDTO;
	};
};
