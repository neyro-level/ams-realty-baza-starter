import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	cpSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const matrix = [
	{ preset: "MIXED", geoMode: "SINGLE_GEO", suffix: "mixed" },
	{ preset: "NEWBUILD_FIRST", geoMode: "MULTI_GEO", suffix: "newbuild" },
	{ preset: "SECONDARY_FIRST", geoMode: "MULTI_GEO", suffix: "secondary" },
];

function git(cwd, args) {
	return execFileSync("git", args, {
		cwd,
		encoding: "utf8",
		maxBuffer: 32 * 1024 * 1024,
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function hash(value) {
	return createHash("sha256").update(value).digest("hex");
}

for (const entry of matrix) {
	const clone = mkdtempSync(join(tmpdir(), `ams-p8-24-${entry.suffix}-`));
	const presetPath = join(
		tmpdir(),
		`ams-p8-24-${entry.suffix}-${process.pid}.json`,
	);
	try {
		execFileSync("git", ["worktree", "add", "--detach", clone, "HEAD"], {
			cwd: root,
			stdio: "pipe",
		});
		for (const relativePath of [
			"scripts/clone-prepare.mjs",
			"scripts/clone-preset.mjs",
			"scripts/verify-clone-bootstrap.mjs",
			"src/project/site-profile.config.ts",
			"src/project/site-profile.config.types.ts",
			"src/project/site-profile.ts",
			"src/project/routing/runtime-route.ts",
			"src/project/routing/legacy-route-manifest.ts",
		]) {
			cpSync(join(root, relativePath), join(clone, relativePath));
		}
		const geos = [
			{
				slug: `${entry.suffix}-city`,
				title: "Тестоград",
				morphologyApproved: true,
				morphology: {
					nominative: "Тестоград",
					genitive: "Тестограда",
					prepositional: "Тестограде",
				},
			},
			...(entry.geoMode === "MULTI_GEO"
				? [
						{
							slug: `${entry.suffix}-satellite`,
							title: "Спутник",
							morphologyApproved: true,
							morphology: {
								nominative: "Спутник",
								genitive: "Спутника",
								prepositional: "Спутнике",
							},
							agglomerationOf: `${entry.suffix}-city`,
						},
					]
				: []),
		];
		const preset = {
			schemaVersion: 1,
			projectId: `P8-24 ${entry.preset}`,
			packageName: `p8-24-${entry.suffix}`,
			brandName: `Агентство ${entry.suffix}`,
			defaultDescription: `Клиентский проект ${entry.preset}`,
			domain: `${entry.suffix}.client-proof.local`,
			preset: entry.preset,
			geoMode: entry.geoMode,
			primaryGeo: `${entry.suffix}-city`,
			productionIndexing: "noindex",
			geos,
			nap: {
				phone: "+7 900 000-00-00",
				email: `hello@${entry.suffix}.local`,
				address: "Тестоград",
				workingHours: "09:00-18:00",
			},
			brandAssets: {
				status: "ready",
				logoPath: "/brand/logo.svg",
				tokenSource: "src/app/globals.css",
			},
			feed: { status: "ready", mode: "external-urls" },
			developmentExcel: {
				status: "ready",
				template: "client-developments.xlsx",
			},
		};
		writeFileSync(presetPath, JSON.stringify(preset));
		const args = [
			join(clone, "scripts/clone-prepare.mjs"),
			`--root=${clone}`,
			`--preset-file=${presetPath}`,
			"--source-tag=starter-v2.0.0",
			`--source-sha=${git(root, ["rev-parse", "HEAD"]).trim()}`,
			"--date=2026-09-25T00:00:00.000Z",
		];
		const proofEnvironment = { ...process.env, AMS_CLONE_PROOF_MODE: "1" };
		execFileSync(process.execPath, args, {
			cwd: clone,
			env: proofEnvironment,
			stdio: "pipe",
		});
		execFileSync(
			process.execPath,
			[join(clone, "scripts/verify-clone-bootstrap.mjs"), `--root=${clone}`],
			{ cwd: clone, stdio: "pipe" },
		);
		assert.equal(
			git(clone, ["diff", "--", "src/core", "packages", "migrations"]).trim(),
			"",
		);
		assert.equal(git(clone, ["diff", "--", "scripts/quality"]).trim(), "");
		assert.match(
			readFileSync(join(clone, "src/project/site-profile.config.ts"), "utf8"),
			new RegExp(entry.preset),
		);
		assert.match(
			readFileSync(join(clone, "src/project/routing/runtime-route.ts"), "utf8"),
			/resolveEmptyClientRuntimeRoute/,
		);
		const firstDiffHash = hash(git(clone, ["diff"]));
		execFileSync(process.execPath, args, {
			cwd: clone,
			env: proofEnvironment,
			stdio: "pipe",
		});
		assert.equal(
			hash(git(clone, ["diff"])),
			firstDiffHash,
			`${entry.preset} repeat must be idempotent`,
		);
		console.log(`verify:client-clone-proof: ${entry.preset} PASS`);
	} finally {
		try {
			execFileSync("git", ["worktree", "remove", "--force", clone], {
				cwd: root,
				stdio: "pipe",
			});
		} catch {
			rmSync(clone, { recursive: true, force: true });
		}
		rmSync(presetPath, { force: true });
	}
}

console.log(
	"verify:client-clone-proof: PASS (three presets, no core/packages/guards/migrations diff)",
);
