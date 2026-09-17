import { NextResponse, type NextRequest } from "next/server";
import rawRestBoundary from "../config/raw-rest-boundary.json";

const anonymousDenyCollections = new Set(
	rawRestBoundary.anonymousDenyCollections.map((collection) => collection.toLowerCase()),
);
const anonymousAuthAllowPaths = new Set(rawRestBoundary.anonymousAuthAllowPaths);

function hasPayloadSessionCookie(request: NextRequest): boolean {
	const token = request.cookies.get("payload-token")?.value;
	if (!token) return false;
	const parts = token.split(".");
	return parts.length === 3 && parts.every((part) => part.length > 8);
}

function isAnonymousRawCollectionPath(pathname: string): boolean {
	const [, api, collection] = pathname.split("/");

	if (api !== "api" || !collection) return false;
	if (!anonymousDenyCollections.has(collection.toLowerCase())) return false;
	if (anonymousAuthAllowPaths.has(pathname)) return false;

	return true;
}

export function proxy(request: NextRequest) {
	if (
		isAnonymousRawCollectionPath(request.nextUrl.pathname) &&
		!hasPayloadSessionCookie(request)
	) {
		return NextResponse.json({ error: "notFound" }, { status: 404 });
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/api/:path*"],
};
