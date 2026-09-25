import type { SitePreset } from "../core/profile/index.ts";

export type ProjectSiteProfileConfig = {
	preset: SitePreset;
	geoMode: "SINGLE_GEO" | "MULTI_GEO";
	primaryGeo: string;
	geos: Record<
		string,
		{
			published: boolean;
			status: "ACTIVE" | "NOINDEX_AUTO" | "PREPARED_OFF" | "OUT";
			agglomerationOf?: string;
		}
	>;
};
