import "server-only";

import { resolvePropertyPageLifecycle } from "@/core/seo/property";
import { fixtureProperties } from "@/fixture/provider";
import {
	findPublicPropertyBySlug,
	findPublicPropertyLifecycleBySlug,
} from "@/project/data-access/public/catalog";
import { toPropertyCardDTO } from "@/project/data-access/public/dto";
import { getOptionalPublicGatewayPayload } from "@/project/data-access/public/payload";
import { siteConfig } from "@/project/site.config";

export type LegacyPropertyRoute =
	| { kind: "missing" }
	| { kind: "gone" }
	| { kind: "redirect"; destination: string };

export async function resolveLegacyPropertyRoute(
	slug: string,
): Promise<LegacyPropertyRoute> {
	const payload = await getOptionalPublicGatewayPayload();
	if (!payload) {
		if ((siteConfig.projectKind as "starter-demo" | "client") === "client") {
			return { kind: "missing" };
		}
		const property = fixtureProperties.find(
			(candidate) => candidate.slug === slug,
		);
		return property
			? { kind: "redirect", destination: property.href }
			: { kind: "missing" };
	}

	const lifecycle = resolvePropertyPageLifecycle(
		await findPublicPropertyLifecycleBySlug(payload, slug),
	);
	switch (lifecycle.kind) {
		case "missing":
			return { kind: "missing" };
		case "gone":
			return { kind: "gone" };
		case "redirect":
			return { kind: "redirect", destination: lifecycle.destination };
	}

	const property = await findPublicPropertyBySlug(payload, slug);
	return property
		? { kind: "redirect", destination: toPropertyCardDTO(property).href }
		: { kind: "missing" };
}
