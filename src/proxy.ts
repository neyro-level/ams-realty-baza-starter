import { NextResponse, type NextRequest } from "next/server";
import { isAnonymousDeniedRawRestPath } from "./server/security/anonymous-raw-rest.ts";

function hasPayloadSessionCookie(request: NextRequest): boolean {
	const token = request.cookies.get("payload-token")?.value;
	if (!token) return false;
	const parts = token.split(".").filter(Boolean);
	return parts.length === 3 && parts.every((part) => part.length > 8);
}

export function proxy(request: NextRequest) {
	if (isAnonymousDeniedRawRestPath(request.nextUrl.pathname) && !hasPayloadSessionCookie(request)) {
		return NextResponse.json({ error: "notFound" }, { status: 404 });
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/api/:path*"],
};
