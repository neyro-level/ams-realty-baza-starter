export const legacyRouteManifest = {
	catalog: {
		from: "/nedvizhimost",
		to: "/kvartiry/",
		statusCode: 301,
	},
	property: {
		pattern: /^\/obekty\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/,
		statusCode: 301,
	},
} as const;

export const legacyRouteRoots = ["nedvizhimost", "obekty"] as const;

export type LegacyRouteMatch =
	| { kind: "catalog"; destination: string; statusCode: 301 }
	| { kind: "property"; slug: string; statusCode: 301 }
	| { kind: "none" };

export function matchLegacyRoute(pathname: string): LegacyRouteMatch {
	if (
		pathname === legacyRouteManifest.catalog.from ||
		pathname === `${legacyRouteManifest.catalog.from}/`
	) {
		return {
			kind: "catalog",
			destination: legacyRouteManifest.catalog.to,
			statusCode: legacyRouteManifest.catalog.statusCode,
		};
	}
	const property = pathname.match(legacyRouteManifest.property.pattern);
	return property?.[1]
		? {
				kind: "property",
				slug: property[1],
				statusCode: legacyRouteManifest.property.statusCode,
			}
		: { kind: "none" };
}
