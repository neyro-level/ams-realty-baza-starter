import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateStarterReleaseManifest } from "./starter-release.mjs";
import { validateStarterVersion } from "./starter-ownership.mjs";

const limits = { archiveBytes: 64 * 1024 * 1024, files: 5000, fileBytes: 16 * 1024 * 1024, expandedBytes: 256 * 1024 * 1024 };
const digest = (value) => createHash("sha256").update(value).digest("hex");

function safeRelativePath(value, label = "archive path") {
	if (typeof value !== "string" || !value || value.includes("\\")) throw new Error(`${label} is not normalized.`);
	if (value.startsWith("/") || /^[a-z]:\//i.test(value) || value.split("/").some((part) => !part || part === "." || part === "..")) {
		throw new Error(`${label} must stay inside the repository.`);
	}
	return value;
}

function safeTarget(root, path, { allowMissingLeaf = true } = {}) {
	const absoluteRoot = resolve(root);
	const normalized = safeRelativePath(path);
	const target = resolve(absoluteRoot, normalized);
	const fromRoot = relative(absoluteRoot, target);
	if (!fromRoot || fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new Error(`Target path escapes repository: ${path}.`);
	let cursor = absoluteRoot;
	for (const [index, part] of normalized.split("/").entries()) {
		cursor = resolve(cursor, part);
		if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) throw new Error(`Target path traverses a symlink: ${path}.`);
		if (!existsSync(cursor) && index < normalized.split("/").length - 1 && !allowMissingLeaf) break;
	}
	return target;
}

function readJsonBounded(path, maxBytes = limits.archiveBytes) {
	const absolute = resolve(path);
	const stats = lstatSync(absolute);
	if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("Upgrade archive must be a regular file.");
	if (stats.size > maxBytes) throw new Error("Upgrade archive exceeds the compressed-size limit.");
	return JSON.parse(readFileSync(absolute, "utf8"));
}

export function validateUpgradeArchive(value) {
	if (!value || typeof value !== "object" || Array.isArray(value) || value.schemaVersion !== 1) throw new Error("Upgrade archive schemaVersion must equal 1.");
	if (!Array.isArray(value.entries) || !value.entries.length || value.entries.length > limits.files) throw new Error("Upgrade archive file count is invalid or exceeds the limit.");
	const seen = new Set();
	let expandedBytes = 0;
	const contents = new Map();
	for (const entry of value.entries) {
		if (entry?.type !== "file") throw new Error("Upgrade archive accepts regular files only; links are forbidden.");
		const path = safeRelativePath(entry.path);
		if (seen.has(path)) throw new Error(`Upgrade archive contains duplicate path: ${path}.`);
		seen.add(path);
		if (!Number.isInteger(entry.size) || entry.size < 0 || entry.size > limits.fileBytes) throw new Error(`Upgrade archive entry size is invalid or excessive: ${path}.`);
		if (typeof entry.contentBase64 !== "string") throw new Error(`Upgrade archive content is missing: ${path}.`);
		const content = Buffer.from(entry.contentBase64, "base64");
		if (content.length !== entry.size) throw new Error(`Upgrade archive entry size mismatch: ${path}.`);
		if (!/^[0-9a-f]{64}$/.test(entry.sha256) || digest(content) !== entry.sha256) throw new Error(`Upgrade archive hash mismatch: ${path}.`);
		expandedBytes += content.length;
		if (expandedBytes > limits.expandedBytes) throw new Error("Upgrade archive exceeds the expanded-size limit.");
		contents.set(path, content);
	}
	const hashes = Object.fromEntries([...contents].map(([path, content]) => [path, digest(content)]));
	const release = validateStarterReleaseManifest(value.release, {
		expectedTag: value.tag,
		expectedSha: value.sha,
		expectedHashes: hashes,
	});
	return { tag: release.tag, sha: release.sha, manifestVersion: release.starterOwnedManifestVersion, hashes, contents };
}

function writeJson(path, value) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, "\t")}\n`);
}

function readVersion(root) {
	const path = join(root, ".starter-version");
	if (!existsSync(path)) throw new Error("Client .starter-version is missing.");
	return validateStarterVersion(JSON.parse(readFileSync(path, "utf8")));
}

function assertNoDirtyClientOwnedPaths(root, starterPaths) {
	let status = "";
	try {
		status = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], {
			cwd: root,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return;
	}
	for (const line of status.split(/\r?\n/).filter(Boolean)) {
		const rawPath = line.slice(3).split(" -> ").at(-1).replaceAll("\\", "/").replace(/^"|"$/g, "");
		if (rawPath === ".starter-version" || rawPath.startsWith(".starter-upgrade/") || starterPaths.has(rawPath)) continue;
		throw new Error(`Dirty client-owned path blocks starter upgrade: ${rawPath}.`);
	}
}

function backupFile(root, backupRoot, path) {
	const source = safeTarget(root, path);
	if (!existsSync(source)) return { existed: false };
	const target = safeTarget(backupRoot, path);
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, readFileSync(source));
	return { existed: true };
}

function recoverUpgrade(root, journalPath) {
	if (!existsSync(journalPath)) throw new Error("No interrupted starter upgrade journal exists.");
	const journal = JSON.parse(readFileSync(journalPath, "utf8"));
	if (journal.status !== "pending" || !Array.isArray(journal.backups)) throw new Error("Starter upgrade journal is not recoverable.");
	for (const backup of journal.backups) {
		const target = safeTarget(root, backup.path);
		const source = safeTarget(journal.backupRoot, backup.path);
		if (backup.existed) {
			mkdirSync(dirname(target), { recursive: true });
			writeFileSync(target, readFileSync(source));
		} else {
			rmSync(target, { force: true });
		}
	}
	writeFileSync(join(root, ".starter-version"), journal.previousVersion);
	journal.status = "recovered";
	writeJson(journalPath, journal);
	return { status: "recovered", restored: journal.backups.length };
}

export function runStarterUpgrade({ root = process.cwd(), archivePath, recover = false, interruptAfter = 0 } = {}) {
	const absoluteRoot = resolve(root);
	const stateRoot = join(absoluteRoot, ".starter-upgrade");
	const journalPath = join(stateRoot, "journal.json");
	if (recover) return recoverUpgrade(absoluteRoot, journalPath);
	if (existsSync(journalPath)) {
		const prior = JSON.parse(readFileSync(journalPath, "utf8"));
		if (prior.status === "pending") throw new Error("Interrupted starter upgrade requires --recover before another run.");
	}
	if (!archivePath) throw new Error("starter:upgrade requires --archive=<verified JSON archive>.");
	const previousVersionPath = join(absoluteRoot, ".starter-version");
	const previousVersionSource = readFileSync(previousVersionPath, "utf8");
	const previous = readVersion(absoluteRoot);
	assertNoDirtyClientOwnedPaths(absoluteRoot, new Set(Object.keys(previous.hashes)));
	const next = validateUpgradeArchive(readJsonBounded(archivePath));
	if (previous.tag === next.tag && previous.sha === next.sha && JSON.stringify(previous.hashes) === JSON.stringify(next.hashes)) {
		return { status: "already-current", tag: next.tag, sha: next.sha };
	}

	const conflicts = [];
	const writes = [];
	const deletes = [];
	const allPaths = new Set([...Object.keys(previous.hashes), ...Object.keys(next.hashes)]);
	for (const path of [...allPaths].sort()) {
		const target = safeTarget(absoluteRoot, path);
		const exists = existsSync(target);
		const priorHash = previous.hashes[path];
		const nextHash = next.hashes[path];
		const localHash = exists && lstatSync(target).isFile() ? digest(readFileSync(target)) : null;
		if (priorHash && localHash !== priorHash) {
			conflicts.push({ path, reason: exists ? "locally-modified" : "locally-deleted" });
			continue;
		}
		if (!priorHash && exists) {
			conflicts.push({ path, reason: "new-upstream-path-collides" });
			continue;
		}
		if (nextHash && localHash !== nextHash) writes.push(path);
		if (!nextHash && exists) {
			if (path.startsWith("migrations/")) throw new Error(`Upgrade cannot remove an existing migration: ${path}.`);
			deletes.push(path);
		}
	}
	const reportPath = join(stateRoot, "report.json");
	if (conflicts.length) {
		for (const conflict of conflicts) {
			if (next.contents.has(conflict.path)) {
				const rejection = safeTarget(absoluteRoot, `${conflict.path}.rej`);
				mkdirSync(dirname(rejection), { recursive: true });
				writeFileSync(rejection, next.contents.get(conflict.path));
			}
		}
		const report = { schemaVersion: 1, status: "conflicts", from: { tag: previous.tag, sha: previous.sha }, to: { tag: next.tag, sha: next.sha }, conflicts };
		writeJson(reportPath, report);
		return report;
	}

	const backupRoot = join(stateRoot, "backups", `${previous.sha}-to-${next.sha}`);
	const touched = [...new Set([...writes, ...deletes])].sort();
	const backups = touched.map((path) => ({ path, ...backupFile(absoluteRoot, backupRoot, path) }));
	const journal = { schemaVersion: 1, status: "pending", backupRoot, previousVersion: previousVersionSource, backups, writes, deletes };
	writeJson(journalPath, journal);
	let applied = 0;
	for (const path of writes) {
		const target = safeTarget(absoluteRoot, path);
		mkdirSync(dirname(target), { recursive: true });
		const temporary = `${target}.starter-upgrade.tmp`;
		writeFileSync(temporary, next.contents.get(path));
		renameSync(temporary, target);
		applied += 1;
		if (interruptAfter && applied >= interruptAfter) throw new Error("Synthetic starter upgrade interruption.");
	}
	for (const path of deletes) rmSync(safeTarget(absoluteRoot, path), { force: true });
	const nextVersion = validateStarterVersion({ schemaVersion: 1, tag: next.tag, sha: next.sha, manifestVersion: next.manifestVersion, hashes: next.hashes });
	writeJson(previousVersionPath, nextVersion);
	journal.status = "complete";
	writeJson(journalPath, journal);
	const report = { schemaVersion: 1, status: "applied", from: { tag: previous.tag, sha: previous.sha }, to: { tag: next.tag, sha: next.sha }, writes, deletes, backupRoot };
	writeJson(reportPath, report);
	return report;
}

function option(name) {
	const prefix = `--${name}=`;
	return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const result = runStarterUpgrade({
		root: option("root") ? resolve(option("root")) : process.cwd(),
		archivePath: option("archive"),
		recover: process.argv.includes("--recover"),
		interruptAfter: Number(process.env.AMS_STARTER_UPGRADE_INTERRUPT_AFTER || 0),
	});
	console.log(JSON.stringify(result));
	if (result.status === "conflicts") process.exitCode = 2;
}
