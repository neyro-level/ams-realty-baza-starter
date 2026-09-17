import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const outputDir = join(root, ".release");
const outputFile = join(outputDir, "release-manifest.json");

function git(args) {
	return execFileSync("git", args, {
		cwd: root,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();
}

async function sha256(path) {
	const content = await readFile(join(root, path));
	return createHash("sha256").update(content).digest("hex");
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const migrationDir = join(root, "src", "payload", "migrations");
const migrations = (await readdir(migrationDir))
	.filter((file) => file.endsWith(".ts") || file.endsWith(".json"))
	.sort();
const status = git(["status", "--short"]);

const manifest = {
	project: packageJson.name,
	version: packageJson.version,
	profile: "REALTY_BASE",
	deliveryProfile: "COMMERCIAL",
	mode: "RELEASE",
	source: {
		branch: git(["branch", "--show-current"]),
		commit: git(["rev-parse", "HEAD"]),
		originMain: git(["rev-parse", "origin/main"]),
		clean: status.length === 0,
	},
	runtime: {
		node: packageJson.engines?.node,
		packageManager: packageJson.packageManager,
		nextRuntime: "next-start-full-image",
		jobsAutorunOwner: "single production runtime only",
	},
	artifact: {
		format: "docker-image",
		imageName: "ams-realty-baza-starter",
		dockerfile: "Dockerfile",
	},
	migrations: migrations.map((file) => basename(file)),
	checksums: {
		"package.json": await sha256("package.json"),
		"pnpm-lock.yaml": await sha256("pnpm-lock.yaml"),
		"Dockerfile": await sha256("Dockerfile"),
		"next.config.ts": await sha256("next.config.ts"),
	},
	rollback: {
		strategy:
			"keep previous image tag and previous runtime env; rollback by switching container image back and restarting one jobs owner",
	},
	generatedAt: new Date().toISOString(),
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Release manifest written: ${outputFile}`);
