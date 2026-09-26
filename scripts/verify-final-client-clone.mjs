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
		name: "souz",
		presetFile: "docs/CLONE_PRESET.souz.example.json",
	},
	{
		name: "newbuild-first",
		preset: "NEWBUILD_FIRST",
		geoMode: "SINGLE_GEO",
		geoCount: 1,
	},
	{
		name: "secondary-first",
		preset: "SECONDARY_FIRST",
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

function safeFailure(entry, step, error) {
	const exitCode =
		typeof error === "object" && error && "status" in error
			? String(error.status ?? "unknown")
			: "unknown";
	return new Error(
		`verify:clone-matrix: ${entry.name} FAIL at ${step} (exit ${exitCode}); command output omitted and disposable worktree removed`,
	);
}

for (const entry of selectedMatrix) {
	const clone = mkdtempSync(join(tmpdir(), `ams-plan10-${entry.name}-`));
	const presetPath = join(
		tmpdir(),
		`ams-plan10-${entry.name}-${process.pid}.json`,
	);
	let step = "create disposable worktree";
	try {
		execFileSync("git", ["worktree", "add", "--detach", clone, "HEAD"], {
			cwd: root,
			stdio: "pipe",
		});
		for (const relativePath of [
			"scripts/clone-prepare.mjs",
			"scripts/clone-preset.mjs",
			"scripts/seo-registry.ts",
			"scripts/seo-registry-output.mjs",
			"scripts/seo-registry-output.d.mts",
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
		step = "compose approved preset";
		const primarySlug = `${entry.name}-city`;
		const geos = entry.presetFile
			? []
			: [
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
							preposition: "в",
						},
						districts: [],
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
										preposition: "в",
									},
									districts: [],
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
										preposition: "в",
									},
									districts: [],
									agglomerationOf: primarySlug,
								},
					),
				];
		const seoTemplates = JSON.parse(
			readFileSync(join(root, "docs/CLONE_SEO_TEMPLATES.example.json"), "utf8"),
		);
		const preset = entry.presetFile
			? JSON.parse(readFileSync(join(root, entry.presetFile), "utf8"))
			: {
					schemaVersion: 3,
					projectId: `P8-24 ${entry.preset}`,
					packageName: `s13-${entry.name}`,
					brandName: `Агентство ${entry.name}`,
					defaultDescription: `Клиентский проект ${entry.preset}`,
					domain: `${entry.name}.client-proof.local`,
					preset: entry.preset,
					geoMode: entry.geoMode,
					primaryGeo: primarySlug,
					productionIndexing: "noindex",
					region: {
						slug: `${entry.name}-region`,
						name: "Тестовый край",
						genitive: "Тестового края",
						locative: "Тестовом крае",
						shortName: "Тестовый край",
					},
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
					feed:
						entry.preset === "NEWBUILD_FIRST"
							? { status: "not_required", mode: "external-urls" }
							: { status: "ready", mode: "external-urls" },
					developmentExcel: {
						status:
							entry.preset === "SECONDARY_FIRST" ? "not_required" : "ready",
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
		if (!entry.presetFile) writeFileSync(presetPath, JSON.stringify(preset));
		const effectivePresetPath = entry.presetFile
			? join(root, entry.presetFile)
			: presetPath;
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
			`--preset-file=${effectivePresetPath}`,
			"--source-tag=starter-v2.1.0",
			`--source-sha=${git(root, ["rev-parse", "HEAD"]).trim()}`,
			"--date=2026-09-25T00:00:00.000Z",
		];
		const proofEnvironment = { ...process.env, AMS_CLONE_PROOF_MODE: "1" };
		step = "install locked dependencies";
		pnpm(clone, ["install", "--frozen-lockfile"], proofEnvironment);
		step = "prepare client clone";
		execFileSync(process.execPath, args, {
			cwd: clone,
			env: proofEnvironment,
			stdio: "pipe",
		});
		step = "validate client bootstrap";
		execFileSync(
			process.execPath,
			[join(clone, "scripts/verify-clone-bootstrap.mjs"), `--root=${clone}`],
			{ cwd: clone, stdio: "pipe" },
		);
		step = "generate and check client SEO registry";
		pnpm(clone, ["seo:registry:generate"], proofEnvironment);
		pnpm(clone, ["seo:registry:check"], proofEnvironment);
		step = "verify prepared site profile";
		pnpm(clone, ["verify:site-profile"], proofEnvironment);
		step = "typecheck prepared client";
		pnpm(clone, ["typecheck"], proofEnvironment);
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
		assert.match(
			readFileSync(join(clone, "src/project/site.config.ts"), "utf8"),
			/projectKind:\s*["']client["']/,
			"prepared tree must disable the starter fixture runtime",
		);
		const clientOwnedFiles = [
			"docs/CLIENT_BOOTSTRAP.json",
			"docs/CLONE_PROVENANCE.md",
			"docs/seo/DISTRICTS.csv",
			"docs/seo/SEO_REGISTRY_SEED.csv",
			"src/project/client-readiness.config.ts",
			"src/project/project-literals.json",
			"src/project/seo/registry-seed.ts",
			"src/project/seo/template-inputs.ts",
			"src/project/site-profile.config.ts",
		];
		for (const relativePath of clientOwnedFiles) {
			assert.doesNotMatch(
				readFileSync(join(clone, relativePath), "utf8"),
				/primorsk|приморск/iu,
				`${relativePath} retained starter fixture content`,
			);
		}
		assert.equal(
			JSON.parse(readFileSync(join(clone, "package.json"), "utf8"))
				.dependencies?.["@payloadcms/storage-s3"],
			undefined,
			"clone:prepare must not activate S3 storage",
		);
		assert.equal(
			JSON.parse(readFileSync(join(clone, "package.json"), "utf8")).scripts?.[
				"clone:seed-geo"
			],
			"node --conditions=react-server ./node_modules/payload/bin.js run scripts/clone-seed-geo.ts",
			"prepared clone must retain the explicit geo seed command",
		);
		step = "prove repeat safety";
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
			`verify:clone-matrix: ${entry.name} PASS (client-kind + fixture-free outputs + registry URLs + typecheck + idempotence)`,
		);
	} catch (error) {
		throw safeFailure(entry, step, error);
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
	`verify:clone-matrix: PASS (${selectedMatrix.length} profiles, no source-worktree or protected platform mutation)`,
);
