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
	{
		name: "single-geo-three-cities",
		preset: "MIXED",
		geoMode: "SINGLE_GEO",
		geoCount: 3,
	},
	{
		name: "secondary-only",
		preset: "SECONDARY_FIRST",
		geoMode: "SINGLE_GEO",
		geoCount: 1,
	},
	{
		name: "newbuild-only",
		preset: "NEWBUILD_FIRST",
		geoMode: "SINGLE_GEO",
		geoCount: 1,
	},
	{ name: "multi-geo", preset: "MIXED", geoMode: "MULTI_GEO", geoCount: 2 },
];
const selectedProfile = process.env.AMS_CLONE_PROFILE;
const selectedMatrix = selectedProfile
	? matrix.filter((entry) => entry.name === selectedProfile)
	: matrix;
assert.ok(
	selectedMatrix.length,
	`Unknown AMS_CLONE_PROFILE: ${selectedProfile}`,
);

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

function pnpm(cwd, args, environment) {
	const cli = process.env.npm_execpath;
	assert.ok(cli, "pnpm CLI path is unavailable from npm_execpath");
	return execFileSync(process.execPath, [cli, ...args], {
		cwd,
		env: environment,
		stdio: "pipe",
		maxBuffer: 64 * 1024 * 1024,
	});
}

for (const entry of selectedMatrix) {
	const clone = mkdtempSync(join(tmpdir(), `ams-s13-${entry.name}-`));
	const presetPath = join(
		tmpdir(),
		`ams-s13-${entry.name}-${process.pid}.json`,
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
			"scripts/verify-site-profile.ts",
			"scripts/quality/seo-template-ownership.mjs",
			"src/project/client-readiness.config.ts",
			"src/project/project-literals.json",
			"src/project/seo/templates.ts",
			"src/project/seo/template-inputs.ts",
			"src/project/site-profile.config.ts",
			"src/project/site-profile.config.types.ts",
			"src/project/site-profile.ts",
			"src/project/routing/runtime-route.ts",
			"src/project/routing/legacy-route-manifest.ts",
		]) {
			cpSync(join(root, relativePath), join(clone, relativePath));
		}
		const primarySlug = `${entry.name}-city`;
		const geos = [
			{
				slug: primarySlug,
				title: "Тестоград",
				published: true,
				hubStatus: "ACTIVE",
				morphologyApproved: true,
				morphology: {
					nominative: "Тестоград",
					genitive: "Тестограда",
					prepositional: "Тестограде",
				},
			},
			...Array.from({ length: entry.geoCount - 1 }, (_, index) =>
				entry.geoMode === "MULTI_GEO"
					? {
							slug: `${entry.name}-satellite-${index + 1}`,
							title: `Спутник ${index + 1}`,
							published: true,
							hubStatus: "NOINDEX_AUTO",
							morphologyApproved: true,
							morphology: {
								nominative: `Спутник ${index + 1}`,
								genitive: `Спутника ${index + 1}`,
								prepositional: `Спутнике ${index + 1}`,
							},
							agglomerationOf: primarySlug,
						}
					: {
							slug: `${entry.name}-inactive-${index + 1}`,
							title: `Резерв ${index + 1}`,
							published: false,
							hubStatus: "PREPARED_OFF",
							morphologyApproved: true,
							morphology: {
								nominative: `Резерв ${index + 1}`,
								genitive: `Резерва ${index + 1}`,
								prepositional: `Резерве ${index + 1}`,
							},
							agglomerationOf: primarySlug,
						},
			),
		];
		const seoTemplates = JSON.parse(
			readFileSync(join(root, "docs/CLONE_SEO_TEMPLATES.example.json"), "utf8"),
		);
		const preset = {
			schemaVersion: 2,
			projectId: `P8-24 ${entry.preset}`,
			packageName: `s13-${entry.name}`,
			brandName: `Агентство ${entry.name}`,
			defaultDescription: `Клиентский проект ${entry.preset}`,
			domain: `${entry.name}.client-proof.local`,
			preset: entry.preset,
			geoMode: entry.geoMode,
			primaryGeo: primarySlug,
			productionIndexing: "noindex",
			geos,
			nap: {
				phone: "+7 900 000-00-00",
				email: `hello@${entry.name}.local`,
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
			clientReadiness: {
				deploymentTarget: "approved-runtime",
				database: "approved-managed-postgresql",
				mediaStorage: "approved-object-storage",
				feedImageSource: "external-urls",
				jobsActiveRuntimeCount: 1,
				leadRetentionDays: 180,
				archiveRetentionDays: 90,
				legalContent: "approved",
				requiredHostAllowlists: {
					outbound: [`api.${entry.name}.local`],
					externalImages: [`images.${entry.name}.local`],
					leadOutbound: [`crm.${entry.name}.local`],
				},
				nginx: true,
				automaticBackup: true,
				externalMonitoring: true,
			},
			seoTemplates,
		};
		writeFileSync(presetPath, JSON.stringify(preset));
		const protectedPaths = [
			"src/core",
			"packages",
			"migrations",
			"scripts/quality",
		];
		const protectedBaseline = hash(
			git(clone, ["diff", "--binary", "--", ...protectedPaths]),
		);
		const args = [
			join(clone, "scripts/clone-prepare.mjs"),
			`--root=${clone}`,
			`--preset-file=${presetPath}`,
			"--source-tag=starter-v2.1.0",
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
		pnpm(clone, ["install", "--frozen-lockfile"], proofEnvironment);
		pnpm(clone, ["verify:daily"], {
			...proofEnvironment,
			NEXT_PUBLIC_SERVER_URL: `https://${preset.domain}`,
			NEXT_PUBLIC_INDEXABLE: "false",
		});
		assert.equal(
			hash(git(clone, ["diff", "--binary", "--", ...protectedPaths])),
			protectedBaseline,
			"clone:prepare changed a protected platform path",
		);
		assert.match(
			readFileSync(join(clone, "src/project/site-profile.config.ts"), "utf8"),
			new RegExp(entry.preset),
		);
		assert.match(
			readFileSync(join(clone, "src/project/routing/runtime-route.ts"), "utf8"),
			/resolveEmptyClientRuntimeRoute/,
		);
		assert.equal(
			JSON.parse(readFileSync(join(clone, "package.json"), "utf8"))
				.dependencies?.["@payloadcms/storage-s3"],
			undefined,
			"clone:prepare must not activate S3 storage",
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
		console.log(
			`verify:client-clone-proof: ${entry.name} PASS (bootstrap + daily + protected paths + idempotence)`,
		);
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
	`verify:client-clone-proof: PASS (${selectedMatrix.length} preset(s), no clone mutation in core/packages/guards/migrations)`,
);
