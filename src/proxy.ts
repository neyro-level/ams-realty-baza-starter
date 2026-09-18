import { NextResponse, type NextRequest } from "next/server";
import { anonymousRawRestEdgeDecision } from "./core/security/anonymous-raw-rest.ts";

export function proxy(request: NextRequest) {
	const denial = anonymousRawRestEdgeDecision(
		request.nextUrl.pathname,
		request.cookies.get("payload-token")?.value,
	);
	if (denial) {
		return NextResponse.json({ error: "notFound" }, { status: denial.status });
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/api/:path*"],
};
