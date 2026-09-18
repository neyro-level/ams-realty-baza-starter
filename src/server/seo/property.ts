import type { PublicPropertyLifecycle } from "@/server/public-gateway/dto";
import { sanitizeExplicitRedirectPath } from "./redirect-path.ts";

export { sanitizeExplicitRedirectPath } from "./redirect-path.ts";

export type PropertyPageLifecycleState =
	| { kind: "missing"; statusCode: 404 }
	| { kind: "active"; statusCode: 200 }
	| { kind: "archived"; statusCode: 200; robots: "noindex" }
	| { kind: "gone"; statusCode: 410; robots: "noindex" }
	| { kind: "redirect"; statusCode: 308; destination: string };

export function getPropertyRobots(property: {
	lifecycle: PublicPropertyLifecycle;
}): { indexing: "index" | "noindex"; following: "follow" } {
	if (property.lifecycle.status === "archived") {
		return { indexing: "noindex", following: "follow" };
	}

	return { indexing: "index", following: "follow" };
}

export function resolvePropertyPageLifecycle(
	input:
		| { found: false }
		| {
				found: true;
				status: "active" | "archived";
				publishedAt?: string | null;
				contentPurgedAt?: string | null;
				explicitRedirectPath?: string | null;
		  },
): PropertyPageLifecycleState {
	if (!input.found || !input.publishedAt) {
		return { kind: "missing", statusCode: 404 };
	}

	if (input.contentPurgedAt) {
		const destination = sanitizeExplicitRedirectPath(input.explicitRedirectPath);
		if (destination) {
			return {
				kind: "redirect",
				statusCode: 308,
				destination,
			};
		}

		return { kind: "gone", statusCode: 410, robots: "noindex" };
	}

	if (input.status === "archived") {
		return { kind: "archived", statusCode: 200, robots: "noindex" };
	}

	return { kind: "active", statusCode: 200 };
}
