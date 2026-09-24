import { detectRuntimeEnvMode, runtimeEnv } from "../env.ts";
import { siteConfig } from "../site.config.ts";
import { projectStaticRoutes } from "../static-routes.ts";

export const siteBrandName = siteConfig.brandName;

export type PublicUrlEntry = {
	path: string;
	lastModified?: string | Date | null;
	changeFrequency?:
		| "always"
		| "hourly"
		| "daily"
		| "weekly"
		| "monthly"
		| "yearly"
		| "never";
	priority?: number;
	indexable: boolean;
};

export const staticPublicUrlEntries: readonly PublicUrlEntry[] = projectStaticRoutes;

export function getSiteUrl(): string {
	const configured = runtimeEnv.NEXT_PUBLIC_SERVER_URL?.trim();
	if (!configured) {
		if (detectRuntimeEnvMode() === "runtime") {
			throw new Error(
				"NEXT_PUBLIC_SERVER_URL is required for production runtime metadata.",
			);
		}
		return "http://localhost:3000";
	}
	try {
		const url = new URL(configured);
		return url.origin;
	} catch {
		throw new Error("NEXT_PUBLIC_SERVER_URL must be a valid absolute URL.");
	}
}

export function absoluteUrl(path: string): string {
	return new URL(path, getSiteUrl()).toString();
}
