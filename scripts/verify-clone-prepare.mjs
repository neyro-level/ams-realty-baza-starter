import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readClonePreset } from "./clone-preset.mjs";

const root = process.cwd();
assert.equal(
	readClonePreset(join(root, "docs/CLONE_PRESET.example.json")).preset,
	"MIXED",
);
const fixture = mkdtempSync(join(tmpdir(), "ams-clone-prepare-"));
const presetPath = join(fixture, "approved-preset.json");
try {
	for (const path of [
		"src/project",
		"src/project/seo",
		"docs/legacy",
		"docs/proofs",
		"docs/orchestration",
		"docs/research",
		"deploy/compose",
		"deploy/nginx",
		"scripts",
	]) {
		mkdirSync(join(fixture, path), { recursive: true });
	}
	writeFileSync(
		join(fixture, "src/project/site.config.ts"),
		'export const siteConfig = { locale: "ru-RU", currency: "RUB", projectKind: "starter-demo" };\n',
	);
	writeFileSync(
		join(fixture, "src/project/client-readiness.config.ts"),
		"export const clientReadinessConfig = { domain: null, productionIndexing: null };\n",
	);
	writeFileSync(
		join(fixture, "src/project/project.config.ts"),
		"export const projectConfig = {};\n",
	);
	writeFileSync(
		join(fixture, "src/project/site-profile.config.ts"),
		"starter\n",
	);
	for (const path of [
		"docs/legacy/a.md",
		"docs/proofs/a.md",
		"docs/orchestration/a.json",
		"docs/research/ATLAS_BASELINE.md",
		"docs/AMS_MASTER_PLAN_8_GEO_CATALOG_PLATFORM.md",
		"deploy/compose/start-baza.compose.yml",
		"deploy/nginx/start-baza.ams24.ru.conf",
		"scripts/verify-atlas-css-parity.mjs",
	]) {
		writeFileSync(join(fixture, path), "starter only\n");
	}
	writeFileSync(
		join(fixture, "package.json"),
		JSON.stringify(
			{
				name: "starter",
				scripts: {
					"clone:prepare": "node scripts/clone-prepare.mjs",
					"visual:atlas-css-parity": "node scripts/verify-atlas-css-parity.mjs",
					"verify:daily": "pnpm verify:clone-readiness && pnpm typecheck",
					verify: "pnpm verify:clone-readiness && pnpm build",
				},
			},
			null,
			2,
		),
	);
	for (const script of ["clone-prepare.mjs", "clone-preset.mjs"]) {
		cpSync(join(root, "scripts", script), join(fixture, "scripts", script));
	}
	const seoTemplates = JSON.parse(
		readFileSync(join(root, "docs/CLONE_SEO_TEMPLATES.example.json"), "utf8"),
	);
	const preset = {
		schemaVersion: 2,
		projectId: "Client Test",
		packageName: "client-test",
		brandName: "Client Test",
		defaultDescription: "Client realty project",
		domain: "client-test.local",
		preset: "MIXED",
		geoMode: "SINGLE_GEO",
		primaryGeo: "client-city",
		productionIndexing: "noindex",
		geos: [
			{
				slug: "client-city",
				title: "Клиентск",
				published: true,
				hubStatus: "ACTIVE",
				morphologyApproved: true,
				morphology: {
					nominative: "Клиентск",
					genitive: "Клиентска",
					prepositional: "Клиентске",
				},
			},
		],
		nap: {
			phone: "+7 900 000-00-00",
			email: "hello@client-test.local",
			address: "Клиентск",
			workingHours: "09:00-18:00",
		},
		brandAssets: {
			status: "ready",
			logoPath: "/brand/logo.svg",
			tokenSource: "src/app/globals.css",
		},
		feed: { status: "ready", mode: "external-urls" },
		developmentExcel: { status: "ready", template: "client-developments.xlsx" },
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
				outbound: ["api.client-test.local"],
				externalImages: ["images.client-test.local"],
				leadOutbound: ["crm.client-test.local"],
			},
			nginx: true,
			automaticBackup: true,
			externalMonitoring: true,
		},
		seoTemplates,
	};
	writeFileSync(presetPath, JSON.stringify({ schemaVersion: 1 }));
	assert.throws(
		() => readClonePreset(presetPath),
		/schemaVersion 1 is obsolete.*Migrate to schemaVersion 2/,
	);
	writeFileSync(
		presetPath,
		JSON.stringify({ ...preset, apiToken: "forbidden" }),
	);
	assert.throws(() => readClonePreset(presetPath), /must not contain secrets/);
	writeFileSync(presetPath, JSON.stringify(preset));
	const run = (proofMode = true) =>
		execFileSync(
			process.execPath,
			[
				join(fixture, "scripts/clone-prepare.mjs"),
				`--root=${fixture}`,
				`--preset-file=${presetPath}`,
				"--source-tag=starter-v2.1.0",
				"--source-sha=0123456789012345678901234567890123456789",
				"--date=2026-09-25T00:00:00.000Z",
			],
			{
				encoding: "utf8",
				env: {
					...process.env,
					...(proofMode ? { AMS_CLONE_PROOF_MODE: "1" } : {}),
				},
				stdio: ["ignore", "pipe", "pipe"],
			},
		);
	assert.throws(() => run(false), /Command failed/);
	assert.ok(
		existsSync(join(fixture, "docs/legacy")),
		"failed source gate must not mutate clone",
	);
	assert.match(run(), /prepared Client Test with MIXED/);
	assert.ok(!existsSync(join(fixture, "docs/legacy")));
	assert.ok(
		!existsSync(
			join(fixture, "docs/AMS_MASTER_PLAN_8_GEO_CATALOG_PLATFORM.md"),
		),
	);
	assert.match(
		readFileSync(join(fixture, "src/project/site.config.ts"), "utf8"),
		/projectKind: "client"/,
	);
	assert.match(
		readFileSync(join(fixture, "src/project/site-profile.config.ts"), "utf8"),
		/client-city/,
	);
	assert.match(
		readFileSync(join(fixture, "src/project/project-literals.json"), "utf8"),
		/client-test\.local/,
	);
	assert.match(
		readFileSync(join(fixture, "src/project/seo/template-inputs.ts"), "utf8"),
		/projectSeoTemplatesInput/,
	);
	assert.equal(
		JSON.parse(readFileSync(join(fixture, "package.json"), "utf8")).name,
		"client-test",
	);
	assert.equal(
		JSON.parse(readFileSync(join(fixture, "package.json"), "utf8"))
			.dependencies?.["@payloadcms/storage-s3"],
		undefined,
		"clone:prepare must not activate S3 storage",
	);
	const provenance = readFileSync(
		join(fixture, "docs/CLONE_PROVENANCE.md"),
		"utf8",
	);
	assert.match(provenance, /starter-v2\.1\.0/);
	assert.match(run(), /already prepared from the same preset; no changes/);
	assert.equal(
		readFileSync(join(fixture, "docs/CLONE_PROVENANCE.md"), "utf8"),
		provenance,
	);
	console.log("verify:clone-prepare: preset, cleanup and idempotence PASS");
} finally {
	rmSync(fixture, { recursive: true, force: true });
}
