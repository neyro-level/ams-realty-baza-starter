import type {
	HomePageDTO,
	PropertyDetailsDTO,
	PropertyListDTO,
} from "@ams/realtbase-contracts";
import { absoluteUrl, siteBrandName } from "./site.ts";

type JsonLd = Record<string, unknown>;

export function JsonLdScript({ data }: { data: JsonLd }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD script output is serialized from server-owned DTOs.
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}

export function buildOrganizationJsonLd(): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "RealEstateAgent",
		name: siteBrandName,
		url: absoluteUrl("/"),
	};
}

export function buildWebsiteJsonLd(home: HomePageDTO): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteBrandName,
		url: absoluteUrl("/"),
		description: home.seo.description,
	};
}

export function buildCatalogItemListJsonLd(list: PropertyListDTO): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: list.items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(item.href),
			name: item.title,
		})),
	};
}

export function buildPropertyJsonLd(property: PropertyDetailsDTO): JsonLd {
	const offer: JsonLd = {
		"@context": "https://schema.org",
		"@type": "Offer",
		url: absoluteUrl(property.href),
		name: property.title,
		description: property.description,
		itemOffered: {
			"@type": "Residence",
			name: property.title,
			address: property.address,
		},
	};
	if (property.price) {
		offer.price = property.price.priceMinor / 100;
		offer.priceCurrency = property.price.currency;
	}
	const area = property.summary.find((item) => item.key === "area")?.value;
	if (area) {
		(offer.itemOffered as JsonLd).floorSize = area;
	}
	return offer;
}

export function buildBreadcrumbJsonLd(
	items: readonly { name: string; path: string }[],
): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		})),
	};
}
