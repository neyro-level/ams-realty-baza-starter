import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runStarterUpgrade, validateUpgradeArchive } from "./starter-upgrade.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const oldSha = "1".repeat(40);
const newSha = "2".repeat(40);
const oldContent = Buffer.from("old core\n");
const newContent = Buffer.from("new core\n");
const migration = Buffer.from("export async function up() {}\n");

function archive(entries = [
	["src/core/example.txt", newContent],
	["migrations/20260927_upgrade.ts", migration],
]) {
	const rows = entries.map(([path, content]) => ({ type: "file", path, size: content.length, sha256: hash(content), contentBase64: content.toString("base64") }));
	const hashes = Object.fromEntries(rows.map((entry) => [entry.path, entry.sha256]));
	return {
		schemaVersion: 1,
		tag: "starter-v2.2.0",
		sha: newSha,
		entries: rows,
		release: { schemaVersion: 1, status: "released", tag: "starter-v2.2.0", sha: newSha, starterOwnedManifestVersion: 1, hashes },
	};
}

function fixture() {
	const root = mkdtempSync(join(tmpdir(), "starter-upgrade-"));
	mkdirSync(join(root, "src/core"), { recursive: true });
	writeFileSync(join(root, "src/core/example.txt"), oldContent);
	writeFileSync(join(root, ".starter-version"), JSON.stringify({ schemaVersion: 1, tag: "starter-v2.1.0", sha: oldSha, manifestVersion: 1, hashes: { "src/core/example.txt": hash(oldContent) } }));
	const archivePath = join(root, "upgrade.json");
	writeFileSync(archivePath, JSON.stringify(archive()));
	return { root, archivePath };
}

{
	const { root, archivePath } = fixture();
	try {
		const result = runStarterUpgrade({ root, archivePath });
		assert.equal(result.status, "applied");
		assert.deepEqual(readFileSync(join(root, "src/core/example.txt")), newContent);
		assert.deepEqual(readFileSync(join(root, "migrations/20260927_upgrade.ts")), migration);
		assert.equal(JSON.parse(readFileSync(join(root, ".starter-version"), "utf8")).sha, newSha);
		assert.equal(runStarterUpgrade({ root, archivePath }).status, "already-current");
	} finally { rmSync(root, { recursive: true, force: true }); }
}

{
	const { root, archivePath } = fixture();
	try {
		writeFileSync(join(root, "client-owned.txt"), "committed\n");
		execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
		execFileSync("git", ["add", "."], { cwd: root, stdio: "ignore" });
		execFileSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "fixture"], { cwd: root, stdio: "ignore" });
		writeFileSync(join(root, "client-owned.txt"), "dirty\n");
		assert.throws(() => runStarterUpgrade({ root, archivePath }), /Dirty client-owned path/);
		assert.deepEqual(readFileSync(join(root, "src/core/example.txt")), oldContent);
	} finally { rmSync(root, { recursive: true, force: true }); }
}

{
	const { root, archivePath } = fixture();
	try {
		writeFileSync(join(root, "src/core/example.txt"), "client change\n");
		const result = runStarterUpgrade({ root, archivePath });
		assert.equal(result.status, "conflicts");
		assert.equal(readFileSync(join(root, "src/core/example.txt"), "utf8"), "client change\n");
		assert.deepEqual(readFileSync(join(root, "src/core/example.txt.rej")), newContent);
		assert.equal(JSON.parse(readFileSync(join(root, ".starter-version"), "utf8")).sha, oldSha);
	} finally { rmSync(root, { recursive: true, force: true }); }
}

for (const [mutate, pattern] of [
	[(value) => { value.entries[0].path = "../escape"; }, /inside the repository/],
	[(value) => { value.entries[0].sha256 = "0".repeat(64); }, /hash mismatch/],
	[(value) => { value.release.status = "candidate"; }, /released/],
	[(value) => { value.entries[0].size = 17 * 1024 * 1024; }, /excessive/],
]) {
	const value = archive();
	mutate(value);
	assert.throws(() => validateUpgradeArchive(value), pattern);
}

{
	const { root, archivePath } = fixture();
	try {
		const outside = join(root, "outside");
		mkdirSync(outside);
		rmSync(join(root, "src/core"), { recursive: true, force: true });
		symlinkSync(outside, join(root, "src/core"), "junction");
		assert.throws(() => runStarterUpgrade({ root, archivePath }), /symlink/);
	} finally { rmSync(root, { recursive: true, force: true }); }
}

{
	const { root, archivePath } = fixture();
	try {
		assert.throws(() => runStarterUpgrade({ root, archivePath, interruptAfter: 1 }), /interruption/);
		assert.equal(JSON.parse(readFileSync(join(root, ".starter-upgrade/journal.json"), "utf8")).status, "pending");
		assert.equal(runStarterUpgrade({ root, recover: true }).status, "recovered");
		assert.deepEqual(readFileSync(join(root, "src/core/example.txt")), oldContent);
		assert.ok(!existsSync(join(root, "migrations/20260927_upgrade.ts")));
	} finally { rmSync(root, { recursive: true, force: true }); }
}

console.log("starter upgrade: PASS (clean, conflict, hostile archive, symlink, interruption recovery)");
