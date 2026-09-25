import { execFileSync } from "node:child_process";
import {
	existsSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import {
	buildCloneBootstrap,
	clonePresetHash,
	parseReservedNamespaces,
	readClonePreset,
	renderSiteProfileConfig,
	validateCloneBootstrap,
} from "./clone-preset.mjs";

const args = new Map(
	process.argv.slice(2).map((arg) => {
		const [key, ...value] = arg.split("=");
		return [key, value.join("=") || true];
	}),
);
const root = resolve(String(args.get("--root") || process.cwd()));
const proofMode = process.env.AMS_CLONE_PROOF_MODE === "1";
const git = (...gitArgs) => {
	try {
		return execFileSync("git", gitArgs, {
			cwd: root,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return "UNKNOWN";
	}
};
const presetFile = args.get("--preset-file");
if (!presetFile || presetFile === true) {
	throw new Error("clone:prepare requires --preset-file=<approved JSON preset>.");
}
const preset = readClonePreset(
	isAbsolute(String(presetFile))
		? String(presetFile)
		: resolve(process.cwd(), String(presetFile)),
);
const presetSha = clonePresetHash(preset);
const sourceTag = String(args.get("--source-tag") || "");
if (sourceTag !== "starter-v2.0.0") {
	throw new Error(
		"clone:prepare requires the approved Plan 8 source tag starter-v2.0.0.",
	);
}

const provenancePath = join(root, "docs", "CLONE_PROVENANCE.md");
const bootstrapPath = join(root, "docs", "CLIENT_BOOTSTRAP.json");
if (existsSync(provenancePath)) {
	if (!existsSync(bootstrapPath)) {
		throw new Error("Prepared clone is missing docs/CLIENT_BOOTSTRAP.json.");
	}
	const existing = JSON.parse(readFileSync(bootstrapPath, "utf8"));
	if (existing.presetSha !== presetSha) {
		throw new Error("Clone is already prepared from a different preset.");
	}
	validateCloneBootstrap(root);
	console.log("clone:prepare: already prepared from the same preset; no changes");
	process.exit(0);
}

const sourceHead = git("rev-parse", "HEAD");
const taggedHead = git("rev-list", "-n", "1", sourceTag);
if (!proofMode) {
	if (sourceHead === "UNKNOWN" || taggedHead === "UNKNOWN" || sourceHead !== taggedHead) {
		throw new Error(
			"clone:prepare must run from the exact immutable starter-v2.0.0 tag.",
		);
	}
	if (git("status", "--porcelain")) {
		throw new Error("clone:prepare requires a clean checkout before preparation.");
	}
}
const sourceSha = String(args.get("--source-sha") || sourceHead);
if (!/^[0-9a-f]{40}$/.test(sourceSha)) {
	throw new Error("clone:prepare requires an exact 40-character source SHA.");
}

const configPath = join(root, "src", "project", "site.config.ts");
const config = readFileSync(configPath, "utf8");
if (!/projectKind:\s*["'](?:starter-demo|client)["']/.test(config)) {
	throw new Error("site.config.ts projectKind owner is missing.");
}

const removalGroups = [
	"docs/legacy",
	"docs/proofs",
	"docs/orchestration",
	"docs/research/ATLAS_BASELINE.md",
	"docs/research/atlas-css-parity.json",
	"docs/AMS_MASTER_PLAN_6_STARTER_FINAL_FREEZE.md",
	"docs/AMS_MASTER_PLAN_7_STARTER_FINAL_AUDIT_CORRECTIONS.md",
	"docs/AMS_MASTER_PLAN_8_GEO_CATALOG_PLATFORM.md",
	"deploy/compose/start-baza.compose.yml",
	"deploy/nginx/start-baza.ams24.ru.conf",
	"scripts/capture-atlas-visual-proof.mjs",
	"scripts/capture-starter-visual-proof.mjs",
	"scripts/verify-atlas-css-parity.mjs",
	"scripts/verify-final-client-clone.mjs",
	"scripts/verify-clone-readiness.mjs",
	"scripts/verify-clone-prepare.mjs",
	"scripts/generate-align-inventory.mjs",
	"scripts/generate-corrections-inventory.mjs",
	"scripts/generate-hardening-inventory.mjs",
	"scripts/generate-residual-inventory.mjs",
];
const removed = [];
for (const relativePath of removalGroups) {
	const target = resolve(root, relativePath);
	const rootRelative = relative(root, target);
	if (!rootRelative || rootRelative.startsWith("..") || isAbsolute(rootRelative)) {
		throw new Error(`unsafe cleanup path: ${relativePath}`);
	}
	if (!existsSync(target)) continue;
	rmSync(target, { recursive: true, force: true });
	removed.push(relativePath);
}

const packagePath = join(root, "package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
packageJson.name = preset.packageName;
delete packageJson.scripts?.["visual:atlas-css-parity"];
delete packageJson.scripts?.["verify:starter:clone-readiness"];
delete packageJson.scripts?.["verify:client-clone-proof"];
delete packageJson.scripts?.["verify:clone-readiness"];
delete packageJson.scripts?.["verify:clone-prepare"];
if (packageJson.scripts?.["verify:daily"]) {
	packageJson.scripts["verify:daily"] = packageJson.scripts[
		"verify:daily"
	].replace("pnpm verify:clone-readiness", "pnpm verify:client-readiness");
}
if (packageJson.scripts?.verify) {
	packageJson.scripts.verify = packageJson.scripts.verify.replace(
		"pnpm verify:clone-readiness",
		"pnpm verify:client-readiness",
	);
}
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, "\t")}\n`);

const replaceLiteral = (source, pattern, replacement, label) => {
	if (!pattern.test(source)) throw new Error(`site.config.ts ${label} owner is missing.`);
	return source.replace(pattern, replacement);
};
let siteConfig = config;
siteConfig = replaceLiteral(
	siteConfig,
	/brandName:\s*["'][^"']+["']/,
	`brandName: ${JSON.stringify(preset.brandName)}`,
	"brandName",
);
siteConfig = replaceLiteral(
	siteConfig,
	/defaultTitle:\s*["'][^"']+["']/,
	`defaultTitle: ${JSON.stringify(preset.brandName)}`,
	"defaultTitle",
);
siteConfig = replaceLiteral(
	siteConfig,
	/defaultDescription:\s*["'][^"']+["']/,
	`defaultDescription: ${JSON.stringify(preset.defaultDescription)}`,
	"defaultDescription",
);
siteConfig = replaceLiteral(
	siteConfig,
	/projectKind:\s*["'](?:starter-demo|client)["']/,
	'projectKind: "client"',
	"projectKind",
);
writeFileSync(configPath, siteConfig);
writeFileSync(
	join(root, "src", "project", "site-profile.config.ts"),
	renderSiteProfileConfig(preset),
);

const readinessPath = join(root, "src", "project", "client-readiness.config.ts");
let readiness = readFileSync(readinessPath, "utf8");
readiness = readiness.replace(
	/domain:\s*(?:null|["'][^"']+["']),/,
	`domain: ${JSON.stringify(preset.domain)},`,
);
readiness = readiness.replace(
	/productionIndexing:\s*(?:null|["'](?:public|noindex)["']),/,
	`productionIndexing: ${JSON.stringify(preset.productionIndexing)},`,
);
writeFileSync(readinessPath, readiness);

const projectConfigSource = readFileSync(
	join(root, "src", "project", "project.config.ts"),
	"utf8",
);
const bootstrap = buildCloneBootstrap(
	preset,
	parseReservedNamespaces(projectConfigSource),
	presetSha,
);
writeFileSync(bootstrapPath, `${JSON.stringify(bootstrap, null, "\t")}\n`);
validateCloneBootstrap(root);

const preparedAt = String(args.get("--date") || new Date().toISOString());
const provenance = `# Clone provenance\n\n- Client project: ${preset.projectId}\n- Preset: ${preset.preset}\n- Preset SHA-256: ${presetSha}\n- Source starter tag: ${sourceTag}\n- Source starter SHA: ${sourceSha}\n- Prepared at: ${preparedAt}\n- Fixture runtime: cleared for client mode\n- Storage topology: separate explicit clone:activate-* step\n- Retained platform standard: AMS Realty Platform Core 5.5 (repository-pinned)\n- Retained UI contract: project Design System and closed @ams/realtbase-ui public API\n\n## Removed starter-only groups\n\n${removed.length ? removed.map((item) => `- \`${item}\``).join("\n") : "- None (already absent)"}\n\nCore, packages, guards, migrations and shared security/data checks remain unchanged.\n`;
writeFileSync(provenancePath, provenance);
console.log(
	`clone:prepare: prepared ${preset.projectId} with ${preset.preset}; removed ${removed.length} starter-only groups`,
);
