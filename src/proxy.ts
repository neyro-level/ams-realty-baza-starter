import { NextResponse, type NextRequest } from "next/server";
import { anonymousRawRestEdgeDecision } from "./core/security/anonymous-raw-rest.ts";
import {
	overwriteLifecyclePreflightHeader,
	parseCurrentPropertyLifecyclePath,
} from "./core/http/property-lifecycle-preflight.ts";
import { createEntityGoneResponse } from "./core/http/property-gone-response.ts";
import { lookupCurrentPropertyLifecyclePreflight } from "./project/data-access/public/property-lifecycle-preflight.ts";
import { lookupCanonicalEntityLifecyclePreflight } from "./project/data-access/public/entity-lifecycle-preflight.ts";
import { createProjectUrlGrammar } from "./project/url-grammar.ts";
import { siteProfile } from "./project/site-profile.ts";

const urlGrammar = createProjectUrlGrammar(siteProfile);

export async function proxy(request: NextRequest) {
	const denial = anonymousRawRestEdgeDecision(
		request.nextUrl.pathname,
		request.cookies.get("payload-token")?.value,
	);
	if (denial) {
		return NextResponse.json({ error: "notFound" }, { status: denial.status });
	}

	let requestHeaders = overwriteLifecyclePreflightHeader(
		request.headers,
		"not-applicable",
	);
	const propertySlug = parseCurrentPropertyLifecyclePath(
		request.nextUrl.pathname,
	);
	const canonicalPageKey = urlGrammar.parseUrl(request.nextUrl.pathname);
	const decision = propertySlug
		? await lookupCurrentPropertyLifecyclePreflight(propertySlug)
		: canonicalPageKey
			? await lookupCanonicalEntityLifecyclePreflight(canonicalPageKey)
			: { kind: "pass" as const };
	if (decision.kind === "gone") {
		return createEntityGoneResponse(
			"label" in decision ? String(decision.label) : (propertySlug ?? "entity"),
		);
	}
	if (decision.kind === "redirect") {
		return NextResponse.redirect(
			new URL(decision.destination, request.url),
			decision.statusCode,
		);
	}

	requestHeaders = overwriteLifecyclePreflightHeader(requestHeaders, "pass");
	return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
	matcher: [
		"/api/:path*",
		"/obekty/:slug",
		"/kvartiry/:slug",
		"/doma/:slug",
		"/uchastki/:slug",
		"/kommercheskaya-nedvizhimost/:slug",
		"/komnaty/:slug",
		"/garazhi/:slug",
		"/novostroyki/:slug",
		"/kottedzhnye-poselki/:slug",
		"/zastroyshchiki/:slug",
	],
};
