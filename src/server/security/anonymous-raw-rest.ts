import rawRestBoundary from "../../../config/raw-rest-boundary.json" with {
	type: "json",
};

const anonymousDenyCollections = new Set(
	rawRestBoundary.anonymousDenyCollections.map((collection) => collection.toLowerCase()),
);
const anonymousAuthAllowPaths = new Set(rawRestBoundary.anonymousAuthAllowPaths);

export function isAnonymousDeniedRawRestPath(pathname: string): boolean {
	const [, api, collection] = pathname.split("/");

	if (api !== "api" || !collection) return false;
	if (!anonymousDenyCollections.has(collection.toLowerCase())) return false;
	if (anonymousAuthAllowPaths.has(pathname)) return false;

	return true;
}
