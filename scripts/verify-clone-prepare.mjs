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
import {
	buildClientSeoSkeleton,
	readClonePreset,
	siteProfileConfigForPreset,
} from "./clone-preset.mjs";

const root = process.cwd();
const clonePresetSource = readFileSync(
	join(root, "scripts/clone-preset.mjs"),
	"utf8",
);
assert.match(
	clonePresetSource,
	/site-profile-presets\.ts/,
	"clone preset must consume the canonical project preset owner",
);
for (const duplicateOwner of [
	"function surfaceStatusesForPreset",
	"const staticRoutes =",
	"const modules =",
	"const filterKeys =",
]) {
	assert.ok(
		!clonePresetSource.includes(duplicateOwner),
		`clone preset reintroduced duplicate owner: ${duplicateOwner}`,
	);
}
assert.equal(
	readClonePreset(join(root, "docs/CLONE_PRESET.example.json")).preset,
	"MIXED",
);
const souzPreset = readClonePreset(
	join(root, "docs/CLONE_PRESET.souz.example.json"),
);
assert.equal(souzPreset.primaryGeo, "rostov-na-donu");
assert.equal(souzPreset.geoCategoryStatus.bataysk.kvartiry, "PREPARED_OFF");
assert.equal(souzPreset.marketStatus.aksay.secondary, "PREPARED_OFF");
assert.deepEqual(souzPreset.seoTiers.bands, { P1: 500, P2: 100, TEST: 50 });
assert.equal(souzPreset.seoTiers.metric, "broad39");
assert.equal(souzPreset.seoTiers.unmeasuredPolicy, "NONE");
const souzProfile = siteProfileConfigForPreset(souzPreset);
const souzSkeleton = buildClientSeoSkeleton(
	souzPreset,
	souzProfile,
	"2026-09-27T00:00:00.000Z",
);
assert.equal(souzSkeleton.rows.length, 13);
assert.deepEqual(
	new Set(souzSkeleton.rows.map((row) => row.pageKey.kind)),
	new Set([
		"home",
		"geoHub",
		"categoryGeo",
		"categoryGeoFacet",
		"geoDevelopers",
	]),
);
assert.ok(
	souzSkeleton.rows.every(
		(row) =>
			row.metric === "broad39" &&
			row.tier === "NONE" &&
			row.minimumObjects === 0 &&
			row.synthetic === false,
	),
);
assert.doesNotMatch(JSON.stringify(souzSkeleton), /primorsk|Приморск/i);
assert.throws(
	() =>
		siteProfileConfigForPreset({
			...souzPreset,
			staticRoutes: [
				...souzPreset.staticRoutes,
				{
					path: "/nedvizhimost",
					changeFrequency: "weekly",
					priority: 0.5,
					indexable: true,
				},
			],
		}),
	/Legacy route root cannot collide/,
);
assert.throws(
	() =>
		siteProfileConfigForPreset({
			...souzPreset,
			categoryStatus: { ...souzPreset.categoryStatus, arenda: "OUT" },
			geoCategoryStatus: {
				...souzPreset.geoCategoryStatus,
				"rostov-na-donu": {
					...souzPreset.geoCategoryStatus["rostov-na-donu"],
					arenda: "OUT",
				},
			},
		}),
	/\/sdat must be absent/,
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
		schemaVersion: 3,
		projectId: "Client Test",
		packageName: "client-test",
		brandName: "Client Test",
		defaultDescription: "Client realty project",
		domain: "client-test.local",
		preset: "MIXED",
		geoMode: "SINGLE_GEO",
		primaryGeo: "client-city",
		productionIndexing: "noindex",
		region: {
			slug: "client-region",
			name: "Клиентский край",
			genitive: "Клиентского края",
			locative: "Клиентском крае",
			shortName: "Клиентский край",
		},
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
					preposition: "в",
				},
				districts: [
					{
						slug: "central",
						name: "Центральный район",
						type: "admin_district",
						locative: "Центральном районе",
						preposition: "в",
						synonyms: ["Центр"],
						parent: null,
					},
				],
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
	writeFileSync(presetPath, JSON.stringify({ schemaVersion: 2 }));
	assert.throws(
		() => readClonePreset(presetPath),
		/schemaVersion 2 is obsolete.*Migrate to schemaVersion 3/,
	);
	writeFileSync(
		presetPath,
		JSON.stringify({ ...preset, categoryStatus: { kvartiry: "ACTIVE" } }),
	);
	assert.throws(() => readClonePreset(presetPath), /categoryStatus/);
	writeFileSync(
		presetPath,
		JSON.stringify({ ...preset, apiToken: "forbidden" }),
	);
	assert.throws(() => readClonePreset(presetPath), /must not contain secrets/);
	writeFileSync(
		presetPath,
		JSON.stringify({
			...preset,
			geos: [
				{
					...preset.geos[0],
					districts: [{ ...preset.geos[0].districts[0], parent: "other-city" }],
				},
			],
		}),
	);
	assert.throws(
		() => readClonePreset(presetPath),
		/parent must belong to the same geo/,
	);
	writeFileSync(
		presetPath,
		JSON.stringify({
			...preset,
			geos: [
				{
					...preset.geos[0],
					morphology: { ...preset.geos[0].morphology, preposition: "около" },
				},
			],
		}),
	);
	assert.throws(() => readClonePreset(presetPath), /morphology.preposition/);
	writeFileSync(
		presetPath,
		JSON.stringify({
			...preset,
			preset: "SECONDARY_FIRST",
			developmentExcel: { status: "not_required" },
		}),
	);
	assert.equal(
		readClonePreset(presetPath).developmentExcel.status,
		"not_required",
	);
	writeFileSync(
		presetPath,
		JSON.stringify({
			...preset,
			preset: "NEWBUILD_FIRST",
			feed: { status: "not_required" },
		}),
	);
	assert.equal(readClonePreset(presetPath).feed.status, "not_required");
	writeFileSync(presetPath, JSON.stringify(preset));
	const run = (proofMode = true) =>
		execFileSync(
			process.execPath,
			[
				"--experimental-strip-types",
				join(root, "scripts/clone-prepare.mjs"),
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
	const bootstrap = JSON.parse(
		readFileSync(join(fixture, "docs/CLIENT_BOOTSTRAP.json"), "utf8"),
	);
	assert.ok(bootstrap.seoRegistry.rows.length > 0);
	assert.ok(
		bootstrap.seoRegistry.rows.every(
			(row) =>
				row.synthetic === false &&
				row.status === "draft" &&
				row.source === "fallback_no_data",
		),
	);
	const generatedRegistry = readFileSync(
		join(fixture, "src/project/seo/registry-seed.ts"),
		"utf8",
	);
	assert.doesNotMatch(generatedRegistry, /primorsk|Приморск/i);
	assert.match(generatedRegistry, /client-city/);
	for (const relativePath of [
		"docs/CLIENT_BOOTSTRAP.json",
		"docs/seo/DISTRICTS.csv",
		"docs/seo/SEO_REGISTRY_SEED.csv",
		"src/project/site-profile.config.ts",
		"src/project/project-literals.json",
		"src/project/seo/template-inputs.ts",
		"src/project/seo/registry-seed.ts",
	]) {
		assert.doesNotMatch(
			readFileSync(join(fixture, relativePath), "utf8"),
			/primorsk|Приморск/i,
			`${relativePath} retained starter geo artifacts`,
		);
	}
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
