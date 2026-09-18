import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const violations = [];
const codeExtensions = /\.(?:js|mjs|cjs|ts|tsx)$/;

function filesUnder(relative) {
	const directory = path.join(root, relative);
	if (!existsSync(directory)) return [];
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const next = path.join(directory, entry.name);
		return entry.isDirectory()
			? filesUnder(path.relative(root, next))
			: codeExtensions.test(entry.name)
				? [next]
				: [];
	});
}

function relative(file) {
	return path.relative(root, file).replaceAll("\\", "/");
}

function report(file, rule) {
	violations.push(`${relative(file)}: ${rule}`);
}

if (existsSync(path.join(root, "packages", "ui", "src", "contracts"))) {
	violations.push(
		"packages/ui/src/contracts: duplicate DTO folder is forbidden; use packages/contracts and view-models",
	);
}

const persistenceImport =
	/from\s+["'](?:payload|@payloadcms\/[^"']+|pg|prisma|@prisma\/[^"']+)["']/;
for (const file of filesUnder("packages/ui")) {
	if (persistenceImport.test(readFileSync(file, "utf8")))
		report(file, "UI imports persistence");
}
const contractsForbidden =
	/from\s+["'](?:next\/[^"']+|payload|@payloadcms\/[^"']+|pg|prisma|@prisma\/[^"']+)["']/;
for (const file of filesUnder("packages/contracts")) {
	if (contractsForbidden.test(readFileSync(file, "utf8")))
		report(file, "contracts import runtime/persistence");
}

for (const file of filesUnder("src")) {
	const content = readFileSync(file, "utf8");
	const name = relative(file);
	if (
		/overrideAccess\s*:\s*true/.test(content) &&
		!name.startsWith("src/server/system-gateway/")
	) {
		report(file, "overrideAccess:true outside System Gateway");
	}
	if (/hostname\s*:\s*["']\*+["']/.test(content))
		report(file, "wildcard image hostname");
	if (/(?:token|secret|password)\s*[:=]\s*["'][^"']{12,}["']/i.test(content)) {
		report(file, "obvious embedded secret");
	}
}

const fixtureRuntimeFiles = [
	...filesUnder("src/fixture"),
	...filesUnder("src/components/fixture"),
	...filesUnder("src/app/(site)"),
];
for (const file of fixtureRuntimeFiles) {
	if (persistenceImport.test(readFileSync(file, "utf8")))
		report(file, "fixture website imports persistence");
}

const requiredFixtureRoutes = [
	"src/app/(site)/page.tsx",
	"src/app/(site)/nedvizhimost/page.tsx",
	"src/app/(site)/obekty/[slug]/page.tsx",
	"src/app/(site)/uslugi/page.tsx",
	"src/app/(site)/o-kompanii/page.tsx",
	"src/app/(site)/ipoteka/page.tsx",
	"src/app/(site)/prodat/page.tsx",
	"src/app/(site)/sdat/page.tsx",
	"src/app/(site)/kontakty/page.tsx",
	"src/app/(site)/politika-konfidencialnosti/page.tsx",
	"src/app/(site)/soglasie-na-obrabotku-personalnyh-dannyh/page.tsx",
	"src/app/not-found.tsx",
];
for (const route of requiredFixtureRoutes) {
	if (!existsSync(path.join(root, route)))
		violations.push(`${route}: required fixture route is missing`);
}

const boundary = JSON.parse(
	readFileSync(path.join(root, "config", "raw-rest-boundary.json"), "utf8"),
);
const allowed = new Set(boundary.allowedRouteFiles);
const routeFiles = filesUnder("src/app")
	.map(relative)
	.filter((file) => /\/api\/(?:.*\/)?route\.(?:js|ts)$/.test(file));
for (const file of routeFiles) {
	if (!allowed.has(file))
		violations.push(`${file}: app API route is not in raw REST allowlist`);
}
if (
	!Array.isArray(boundary.anonymousDenyCollections) ||
	!boundary.anonymousDenyCollections.includes("media")
) {
	violations.push(
		"config/raw-rest-boundary.json: anonymous raw REST deny collections must include media",
	);
}
if (
	!Array.isArray(boundary.anonymousAuthAllowPaths) ||
	!boundary.anonymousAuthAllowPaths.includes("/api/users/login")
) {
	violations.push(
		"config/raw-rest-boundary.json: Payload auth allowlist must preserve /api/users/login",
	);
}
const proxyPath = path.join(root, "src", "proxy.ts");
if (!existsSync(proxyPath)) {
	violations.push("src/proxy.ts: raw REST edge boundary is missing");
} else {
	const proxy = readFileSync(proxyPath, "utf8");
	if (!proxy.includes("anonymousDenyCollections")) {
		violations.push(
			"src/proxy.ts: raw REST edge boundary must read anonymousDenyCollections",
		);
	}
	if (!proxy.includes("notFound")) {
		violations.push(
			"src/proxy.ts: anonymous raw REST denial must return notFound",
		);
	}
}

const globals = readFileSync(
	path.join(root, "src", "app", "globals.css"),
	"utf8",
);
if (!globals.includes('@source "../../packages/ui/src";')) {
	violations.push(
		"src/app/globals.css: packages/ui Tailwind source is missing",
	);
}
function findShadcnOwners(directory = root) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (
			entry.isDirectory() &&
			[".git", ".next", "graphify-out", "node_modules"].includes(entry.name)
		)
			return [];
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) return findShadcnOwners(absolute);
		return entry.name === "components.json" ? [relative(absolute)] : [];
	});
}
const shadcnOwners = findShadcnOwners();
if (
	shadcnOwners.length !== 1 ||
	shadcnOwners[0] !== "packages/ui/components.json"
) {
	violations.push(
		`shadcn owner must be packages/ui/components.json; found ${shadcnOwners.join(", ") || "none"}`,
	);
}

const rootPackage = JSON.parse(
	readFileSync(path.join(root, "package.json"), "utf8"),
);
if (rootPackage.scripts?.["ui:shadcn"] !== "node scripts/ui-shadcn.mjs") {
	violations.push("package.json: ui:shadcn must use the project-owned wrapper");
}

const uiTsConfig = JSON.parse(
	readFileSync(path.join(root, "packages", "ui", "tsconfig.json"), "utf8"),
);
if (
	uiTsConfig.compilerOptions?.paths?.["@ams/realtbase-ui/*"]?.[0] !== "./src/*"
) {
	violations.push(
		"packages/ui/tsconfig.json: @ams/realtbase-ui alias must resolve inside packages/ui/src",
	);
}

const shadcnConfig = JSON.parse(
	readFileSync(path.join(root, "packages", "ui", "components.json"), "utf8"),
);
if (
	shadcnConfig.aliases?.ui !== "@ams/realtbase-ui/components/ui" ||
	shadcnConfig.aliases?.utils !== "@ams/realtbase-ui/lib/utils"
) {
	violations.push(
		"packages/ui/components.json: shadcn aliases must resolve to the canonical UI package",
	);
}

const baseline = JSON.parse(
	readFileSync(path.join(root, "docs", "guard-baseline.json"), "utf8"),
);
if (baseline.frozen !== true) {
	violations.push("docs/guard-baseline.json must be frozen");
}
if (!Array.isArray(baseline.knownExceptions) || baseline.knownExceptions.length !== 0) {
	violations.push("docs/guard-baseline.json knownExceptions must stay empty");
}

const approvedSql =
	/^src\/core\/data-access\/(?:system|ingest|public)\/sql\//;
const migrationSql = /^src\/payload\/migrations\//;
for (const file of filesUnder("src")) {
	const name = relative(file);
	const content = readFileSync(file, "utf8");
	if (
		(/db\.execute\s*\(|\bsql`/.test(content) ||
			/from\s+["']pg["']/.test(content)) &&
		!approvedSql.test(name) &&
		!migrationSql.test(name)
	) {
		report(file, "low-level SQL is only allowed in approved sql layers or migrations");
	}
	if (
		/collection:\s*["']payload-jobs["']/.test(content) &&
		!name.startsWith("src/core/data-access/system/jobs/") &&
		!name.startsWith("src/payload/payload-types.ts")
	) {
		report(file, "payload-jobs access is only allowed in system/jobs");
	}
	if (
		/\bfetch\s*\(/.test(content) &&
		name !== "src/server/security/safe-outbound-client.ts"
	) {
		report(file, "direct fetch is forbidden outside Safe Outbound Client");
	}
}

for (const file of [
	...filesUnder("src/core/ingest"),
	...filesUnder("src/payload/jobs"),
	...filesUnder("src/core/cache"),
]) {
	if (/from\s+["']next\//.test(readFileSync(file, "utf8"))) {
		report(file, "top-level next/* import in ingest/job/cache graph");
	}
}

const payloadConfig = readFileSync(path.join(root, "payload.config.ts"), "utf8");
if (/cors:\s*["']\*["']/.test(payloadConfig) || /origin:\s*["']\*["']/.test(payloadConfig)) {
	violations.push("payload.config.ts: wildcard CORS is forbidden");
}

const classified = new Set(Object.keys(boundary.classifiedCollections ?? {}));
const requiredCollections = [
	"users",
	"pages",
	"properties",
	"feed-sources",
	"import-runs",
	"import-issues",
	"leads",
	"lead-deliveries",
	"media",
	"redirects",
	"payload-jobs",
];
for (const slug of requiredCollections) {
	if (!classified.has(slug)) {
		violations.push(`config/raw-rest-boundary.json: collection ${slug} is unclassified`);
	}
}
if (boundary.classifiedCollections?.media !== "deny-anonymous") {
	violations.push("media must be classified deny-anonymous in raw-rest-boundary.json");
}

for (const file of routeFiles) {
	if (/\/jobs(?:\/|$)/.test(file) && !file.includes("payload")) {
		violations.push(`${file}: public jobs endpoint is forbidden`);
	}
}

const reserved = ["/novostroyki", "/komplex", "/journal"];
for (const prefix of reserved) {
	const appHit = filesUnder("src/app").some((file) =>
		relative(file).includes(prefix.slice(1)),
	);
	if (appHit) {
		violations.push(`reserved namespace ${prefix} must not be occupied by a static app route`);
	}
}

if (!existsSync(path.join(root, "src", "core", "data-access", "system", "jobs", "inspect.ts"))) {
	violations.push("src/core/data-access/system/jobs module is missing");
}

if (violations.length) {
	console.error(violations.join("\n"));
	process.exit(1);
}
console.log("architecture guards: PASS");
