import { resolvePropertyPageLifecycle } from "../seo/property.ts";

export const lifecyclePreflightHeader = "x-ams-property-lifecycle-preflight";
export type LifecyclePreflightHeaderValue = "not-applicable" | "pass";

export type PropertyLifecycleLookup =
	| { found: false }
	| {
			found: true;
			status: "active" | "archived";
			publishedAt?: string | null;
			contentPurgedAt?: string | null;
			explicitRedirectPath?: string | null;
	  };

export type PropertyLifecyclePreflightDecision =
	| { kind: "pass" }
	| { kind: "gone"; statusCode: 410 }
	| { kind: "redirect"; statusCode: 301; destination: string };

const currentPropertyPath = /^\/obekty\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

export function parseCurrentPropertyLifecyclePath(
	pathname: string,
): string | null {
	const match = pathname.match(currentPropertyPath);
	return match?.[1] ?? null;
}

export function overwriteLifecyclePreflightHeader(
	headers: Headers,
	value: LifecyclePreflightHeaderValue,
): Headers {
	const trustedHeaders = new Headers(headers);
	trustedHeaders.set(lifecyclePreflightHeader, value);
	return trustedHeaders;
}

export function resolvePropertyLifecyclePreflight(
	lookup: PropertyLifecycleLookup,
): PropertyLifecyclePreflightDecision {
	const lifecycle = resolvePropertyPageLifecycle(lookup);
	if (lifecycle.kind === "gone") {
		return { kind: "gone", statusCode: 410 };
	}
	if (lifecycle.kind === "redirect") {
		return {
			kind: "redirect",
			statusCode: 301,
			destination: lifecycle.destination,
		};
	}
	return { kind: "pass" };
}
