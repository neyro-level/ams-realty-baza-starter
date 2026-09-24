import { NextResponse, type NextRequest } from "next/server";
import { anonymousRawRestEdgeDecision } from "./core/security/anonymous-raw-rest.ts";
import {
	overwriteLifecyclePreflightHeader,
	parseCurrentPropertyLifecyclePath,
} from "./core/http/property-lifecycle-preflight.ts";
import { createPropertyGoneResponse } from "./core/http/property-gone-response.ts";
import { lookupCurrentPropertyLifecyclePreflight } from "./project/data-access/public/property-lifecycle-preflight.ts";

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
	if (!propertySlug) {
		return NextResponse.next({ request: { headers: requestHeaders } });
	}

	const decision = await lookupCurrentPropertyLifecyclePreflight(propertySlug);
	if (decision.kind === "gone") {
		return createPropertyGoneResponse(propertySlug);
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
	matcher: ["/api/:path*", "/obekty/:slug"],
};
