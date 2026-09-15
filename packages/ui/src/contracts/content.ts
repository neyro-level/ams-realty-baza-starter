export type HomeFeaturedPropertyDTO = {
	title: string;
	price: string;
	note: string;
	href: string;
	image: string | null;
};

export type JournalCategoryLinkDTO = {
	slug: string;
	title: string;
	href: string;
	active?: boolean;
};

export type JournalArticleCardDTO = {
	id: string;
	slug: string;
	href: string;
	title: string;
	excerpt: string;
	image: string;
	dateLabel: string;
	topicLabel: string;
};

export type HouseProjectPreviewDTO = {
	id: string;
	slug: string;
	numberLabel: string;
	areaLabel: string;
	title: string;
	description: string;
	backHref: string;
};

export type CorporateRelatedServiceDTO = {
	label: string;
	href: string;
	description: string;
};

export type CorporateArticlePreviewDTO = {
	slug: string;
	title: string;
	excerpt: string;
};

export type LegalDocumentSectionDTO = {
	title: string;
	paragraphs?: readonly string[];
	items?: readonly string[];
};

export type LegalDocumentDTO = {
	id: string;
	slug: string;
	title: string;
	shortTitle: string;
	description: string;
	version: string;
	updatedAt: string;
	intro: readonly string[];
	sections: readonly LegalDocumentSectionDTO[];
};

export type SitemapLinkDTO = {
	href: string;
	label: string;
	countAsPublishedPage?: boolean;
	emphasis?: boolean;
};

export type SitemapColumnDTO = {
	title?: string;
	items: readonly SitemapLinkDTO[];
};

export type SitemapSectionDTO = {
	title: string;
	columns: readonly SitemapColumnDTO[];
	count?: number;
	grouped?: boolean;
};

export type HtmlSitemapPageDTO = {
	metrics: { totalPages: number; staticPages: number; objectPages: number };
	sections: readonly SitemapSectionDTO[];
};

export type SitemapListingPageDTO = {
	kind: "objects" | "reserve";
	page: number;
	pageSize: number;
	total: number;
	items: readonly { id: string; slug: string; title: string }[];
};
