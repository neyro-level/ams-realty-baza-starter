import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	hashStarterOwnedFiles,
	readStarterOwnedManifest,
	starterOwnedFiles,
	validateStarterVersion,
} from "./starter-ownership.mjs";

const root = process.cwd();
const manifest = readStarterOwnedManifest(root);
const files = starterOwnedFiles(root, manifest);
const first = hashStarterOwnedFiles(root, manifest);
const second = hashStarterOwnedFiles(root, manifest);
assert.deepEqual(first, second, "starter-owned hashes must be reproducible");
assert.ok(files.some((path) => path.startsWith("src/core/")));
assert.ok(files.some((path) => path.startsWith("packages/")));
assert.ok(files.some((path) => path.startsWith("migrations/")));
assert.ok(files.some((path) => path.startsWith("scripts/quality/")));
for (const path of files) {
	assert.ok(!path.startsWith("src/project/"));
	assert.ok(!path.startsWith("docs/seo/"));
}

const fixture = mkdtempSync(join(tmpdir(), "starter-owned-negative-"));
try {
	const base = JSON.parse(readFileSync(join(root, "starter-owned.json"), "utf8"));
	for (const [name, mutate, pattern] of [
		["overlap", (value) => value.include.push({ path: "src/core/routing", type: "tree" }), /overlap/],
		["unknown", (value) => value.include.push({ path: "missing/platform", type: "tree" }), /unknown path/],
		["traversal", (value) => value.include.push({ path: "../outside", type: "tree" }), /normalized repository-relative/],
		["mixed", (value) => value.exclude.push("src/core/routing"), /ownership overlap/],
	]) {
		const value = structuredClone(base);
		mutate(value);
		const path = join(root, `.starter-owned-${name}-${process.pid}.json`);
		writeFileSync(path, JSON.stringify(value));
		try { assert.throws(() => readStarterOwnedManifest(root, path.split(/[\\/]/).at(-1)), pattern); }
		finally { rmSync(path, { force: true }); }
	}
	const external = join(fixture, "external");
	mkdirSync(external);
	const link = join(root, `.starter-owned-link-${process.pid}`);
	symlinkSync(external, link, "junction");
	const symlinkManifest = structuredClone(base);
	symlinkManifest.include.push({ path: link.split(/[\\/]/).at(-1), type: "tree" });
	const symlinkManifestPath = join(root, `.starter-owned-symlink-${process.pid}.json`);
	writeFileSync(symlinkManifestPath, JSON.stringify(symlinkManifest));
	try { assert.throws(() => readStarterOwnedManifest(root, symlinkManifestPath.split(/[\\/]/).at(-1)), /symlink/); }
	finally { rmSync(link, { force: true }); rmSync(symlinkManifestPath, { force: true }); }
} finally {
	rmSync(fixture, { recursive: true, force: true });
}

validateStarterVersion({ schemaVersion: 1, tag: "starter-v2.1.0", sha: "a".repeat(40), manifestVersion: 1, hashes: first });
assert.throws(() => validateStarterVersion({ schemaVersion: 1, tag: "x", sha: "a".repeat(40), manifestVersion: 1, hashes: { "../x": "b".repeat(64) } }), /normalized/);
console.log(`starter ownership: PASS (${files.length} files, reproducible hashes, negative path fixtures)`);
