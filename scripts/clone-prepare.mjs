import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve } from "node:path";

const args = new Map(process.argv.slice(2).map((arg) => {
	const [key, ...value] = arg.split("=");
	return [key, value.join("=") || true];
}));
const root = resolve(String(args.get("--root") || process.cwd()));
const configPath = join(root, "src", "project", "site.config.ts");
const config = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
const explicitClient = args.has("--client");
if (!explicitClient && !/projectKind:\s*["']client["']/.test(config)) {
	throw new Error("clone:prepare requires projectKind=client or explicit --client");
}

const provenancePath = join(root, "docs", "CLONE_PROVENANCE.md");
if (existsSync(provenancePath)) {
	console.log("clone:prepare: already prepared; no changes");
	process.exit(0);
}

const removalGroups = [
	"docs/legacy",
	"docs/proofs",
	"docs/orchestration",
	"docs/research/ATLAS_BASELINE.md",
	"docs/research/atlas-css-parity.json",
	"docs/AMS_MASTER_PLAN_6_STARTER_FINAL_FREEZE.md",
	"docs/AMS_MASTER_PLAN_7_STARTER_FINAL_AUDIT_CORRECTIONS.md",
	"deploy/compose/start-baza.compose.yml",
	"deploy/nginx/start-baza.ams24.ru.conf",
	"scripts/capture-atlas-visual-proof.mjs",
	"scripts/capture-starter-visual-proof.mjs",
	"scripts/verify-atlas-css-parity.mjs",
	"scripts/generate-align-inventory.mjs",
	"scripts/generate-corrections-inventory.mjs",
	"scripts/generate-hardening-inventory.mjs",
	"scripts/generate-residual-inventory.mjs",
];
const removed = [];
for (const relativePath of removalGroups) {
	const target = resolve(root, relativePath);
	const rootRelative = relative(root, target);
	if (!rootRelative || rootRelative.startsWith("..") || isAbsolute(rootRelative))
		throw new Error(`unsafe cleanup path: ${relativePath}`);
	if (!existsSync(target)) continue;
	rmSync(target, { recursive: true, force: true });
	removed.push(relativePath);
}

const packagePath = join(root, "package.json");
if (existsSync(packagePath)) {
	const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
	delete packageJson.scripts?.["visual:atlas-css-parity"];
	delete packageJson.scripts?.["verify:starter:clone-readiness"];
	if (packageJson.scripts?.["verify:daily"])
		packageJson.scripts["verify:daily"] = packageJson.scripts["verify:daily"].replace("pnpm verify:clone-readiness", "pnpm verify:client-readiness");
	if (packageJson.scripts?.verify)
		packageJson.scripts.verify = packageJson.scripts.verify.replace("pnpm verify:clone-readiness", "pnpm verify:client-readiness");
	writeFileSync(packagePath, `${JSON.stringify(packageJson, null, "\t")}\n`);
}

const git = (...gitArgs) => {
	try { return execFileSync("git", gitArgs, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
	catch { return "UNKNOWN"; }
};
const sourceSha = String(args.get("--source-sha") || git("rev-parse", "HEAD"));
const sourceTag = String(args.get("--source-tag") || git("describe", "--tags", "--exact-match", sourceSha));
const identity = String(args.get("--project-id") || config.match(/brandName:\s*["']([^"']+)/)?.[1] || basename(root));
const preparedAt = String(args.get("--date") || new Date().toISOString());
const provenance = `# Clone provenance\n\n- Client project: ${identity}\n- Source starter tag: ${sourceTag}\n- Source starter SHA: ${sourceSha}\n- Prepared at: ${preparedAt}\n- Retained platform standard: AMS Realty Platform Core 5.5 (repository-pinned)\n- Retained UI contract: project Design System and closed @ams/realtbase-ui public API\n\n## Removed starter-only groups\n\n${removed.length ? removed.map((item) => `- \`${item}\``).join("\n") : "- None (already absent)"}\n\nShared security, data, contracts and client-readiness verification remain active.\n`;
writeFileSync(provenancePath, provenance);
console.log(`clone:prepare: prepared ${identity}; removed ${removed.length} starter-only groups`);
