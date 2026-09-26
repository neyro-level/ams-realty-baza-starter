import type { PageKey } from "../../core/routing/index.ts";

const MAX_PUBLIC_GATEWAY_TAGS = 8;

function safeTagPart(value: string | number): string {
	const normalized = String(value).trim().toLowerCase();
	if (!/^[a-z0-9_-]+$/.test(normalized)) {
		throw new Error(`Unsafe public cache tag component: ${normalized}`);
	}
	return normalized;
}

/** Bounded cache identity derived only from canonical route-owner input. */
export function publicGatewayCacheTags(pageKey: PageKey | null): string[] {
	const tags = new Set<string>(["site", "registry"]);
	if (!pageKey) return [...tags];

	switch (pageKey.kind) {
		case "home":
		case "static":
			break;
		case "geoHub":
			tags.add("properties");
			tags.add("developments");
			tags.add("developers");
			tags.add(`geo:${safeTagPart(pageKey.geo)}`);
			break;
		case "categoryRoot":
			tags.add("properties");
			tags.add("developments");
			tags.add("developers");
			break;
		case "categoryGeo":
		case "categoryGeoFacet":
		case "categoryGeoDistrict":
			tags.add("properties");
			tags.add("developments");
			tags.add("developers");
			tags.add(`geo:${safeTagPart(pageKey.geo)}`);
			tags.add(
				`geo-surface:${safeTagPart(pageKey.geo)}:${safeTagPart(pageKey.category)}`,
			);
			if (pageKey.kind === "categoryGeoDistrict") {
				tags.add(`district:${safeTagPart(pageKey.district)}`);
			}
			break;
		case "geoDevelopers":
			tags.add("developers");
			tags.add("developments");
			tags.add(`geo:${safeTagPart(pageKey.geo)}`);
			break;
		case "developerRoot":
			tags.add("developers");
			tags.add("developments");
			break;
		case "property":
			tags.add("properties");
			tags.add(`property:${safeTagPart(pageKey.publicUrlId)}`);
			break;
		case "development":
			tags.add("developments");
			tags.add("properties");
			tags.add(`development:${safeTagPart(pageKey.slug)}`);
			break;
		case "developer":
			tags.add("developers");
			tags.add("developments");
			tags.add(`developer:${safeTagPart(pageKey.slug)}`);
			break;
	}

	if (tags.size > MAX_PUBLIC_GATEWAY_TAGS) {
		throw new Error("Public Gateway cache identity exceeded its bounded tag budget.");
	}
	return [...tags];
}
