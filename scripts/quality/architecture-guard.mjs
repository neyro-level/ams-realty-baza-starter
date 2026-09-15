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
	uiTsConfig.compilerOptions?.paths?.["@ams/realtbase-ui/*"]?.[0] !==
	"./src/*"
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

if (violations.length) {
	console.error(violations.join("\n"));
	process.exit(1);
}
console.log("architecture guards: PASS");
