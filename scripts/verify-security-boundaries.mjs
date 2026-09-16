import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import rawRestBoundary from "../config/raw-rest-boundary.json" with {
	type: "json",
};

const root = process.cwd();
const codeExtensions = /\.(?:js|mjs|cjs|ts|tsx)$/;
const violations = [];

function normalize(file) {
	return file.replaceAll("\\", "/");
}

function read(relativePath) {
	return readFileSync(path.join(root, relativePath), "utf8");
}

function filesUnder(relativePath) {
	const directory = path.join(root, relativePath);
	if (!existsSync(directory)) return [];

	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (
			entry.isDirectory() &&
			[".git", ".next", "coverage", "node_modules"].includes(entry.name)
		) {
			return [];
		}

		const next = path.join(directory, entry.name);
		if (entry.isDirectory()) return filesUnder(path.relative(root, next));
		return codeExtensions.test(entry.name)
			? [normalize(path.relative(root, next))]
			: [];
	});
}

function requireIncludes(file, needle, reason) {
	assert.ok(read(file).includes(needle), `${file}: ${reason}`);
}

const routeFiles = filesUnder("src/app").filter((file) =>
	/\/api\/(?:.*\/)?route\.(?:js|ts)$/.test(file),
);
assert.deepEqual(
	routeFiles.sort(),
	[...rawRestBoundary.allowedRouteFiles].sort(),
	"every app API route must be explicitly declared in config/raw-rest-boundary.json",
);

for (const collection of [
	"pages",
	"properties",
	"feed-sources",
	"import-runs",
	"import-issues",
	"leads",
	"lead-deliveries",
	"media",
	"redirects",
]) {
	assert.ok(
		rawRestBoundary.anonymousDenyCollections.includes(collection),
		`raw REST anonymous denylist must include ${collection}`,
	);
}

requireIncludes(
	"src/proxy.ts",
	"anonymousDenyCollections",
	"raw REST edge boundary must use the configured denylist",
);
requireIncludes(
	"src/proxy.ts",
	"payload-token",
	"raw REST edge boundary must require an auth signal",
);
requireIncludes(
	"src/proxy.ts",
	"notFound",
	"anonymous raw REST denial must not reveal protected collections",
);
requireIncludes(
	"src/app/api/internal/revalidate/route.ts",
	"x-ams-revalidate-secret",
	"cache revalidation must require the internal secret header",
);
requireIncludes(
	"src/app/api/internal/revalidate/route.ts",
	"rateLimited",
	"cache revalidation must keep application rate limiting",
);
requireIncludes(
	"src/app/api/internal/revalidate/route.ts",
	"allowedTarget",
	"cache revalidation targets must be allowlisted",
);
requireIncludes(
	"src/app/api/internal/healthz/route.ts",
	"x-ams-health-secret",
	"health endpoint must require the internal health secret header",
);
requireIncludes(
	"src/app/api/internal/healthz/route.ts",
	"no-store",
	"health endpoint must not be cacheable",
);

const nextConfig = read("next.config.ts");
for (const required of [
	"Content-Security-Policy",
	"Strict-Transport-Security",
	"X-Content-Type-Options",
	"Referrer-Policy",
	"X-Frame-Options",
	"Permissions-Policy",
	"publicCsp",
	"adminCsp",
]) {
	assert.ok(
		nextConfig.includes(required),
		`next.config.ts missing ${required}`,
	);
}
assert.ok(
	!nextConfig.includes('hostname: "*"'),
	"next.config.ts must not allow wildcard image hosts",
);

const payloadConfig = read("payload.config.ts");
assert.ok(
	/graphQL:\s*{\s*disable:\s*true/s.test(payloadConfig),
	"GraphQL must stay disabled",
);
assert.ok(
	payloadConfig.includes("cors: runtimeEnv.NEXT_PUBLIC_SERVER_URL"),
	"CORS must be exact-origin driven",
);
assert.ok(
	payloadConfig.includes("csrf: runtimeEnv.NEXT_PUBLIC_SERVER_URL"),
	"CSRF must be exact-origin driven",
);

const redaction = read("src/server/security/redaction.ts").toLowerCase();
for (const sensitive of [
	"password",
	"secret",
	"token",
	"authorization",
	"cookie",
	"database",
]) {
	assert.ok(
		redaction.includes(sensitive),
		`central redaction must cover ${sensitive}`,
	);
}

const outbound = read("src/server/security/safe-outbound-client.ts");
for (const required of [
	"allowedHosts",
	"approvedHttpHosts",
	"private or link-local",
	'redirect: "manual"',
	"Outbound response exceeded max size",
]) {
	assert.ok(
		outbound.includes(required),
		`safe outbound client missing ${required}`,
	);
}

const overrideAllowlist = new Set([
	"src/server/system-gateway/overrides.ts",
	"scripts/quality/architecture-guard.mjs",
	"scripts/verify-security-boundaries.mjs",
]);
for (const file of [...filesUnder("src"), ...filesUnder("scripts")]) {
	const content = read(file);
	if (
		/overrideAccess\s*:\s*true/.test(content) &&
		!overrideAllowlist.has(file)
	) {
		violations.push(
			`${file}: direct overrideAccess:true must go through System Gateway`,
		);
	}
}

for (const file of [
	"src/payload/collections/Leads.ts",
	"src/payload/collections/LeadDeliveries.ts",
]) {
	const content = read(file);
	assert.ok(
		content.includes("adminsAndOwners"),
		`${file}: reads must be role protected`,
	);
	assert.ok(
		content.includes("ownersOnly"),
		`${file}: deletes must be owner-only`,
	);
}

const healthAlerts = read("scripts/verify-health-alerts.mjs");
for (const forbidden of ["token", "secret", "password", "phone", "email"]) {
	assert.ok(
		healthAlerts.includes(`"${forbidden}"`),
		`health alerts regression must guard ${forbidden}`,
	);
}

if (violations.length) {
	console.error(violations.join("\n"));
	process.exit(1);
}

console.log("verify-security-boundaries: ok");
