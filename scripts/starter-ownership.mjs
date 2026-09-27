import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

const digestPattern = /^[0-9a-f]{64}$/;

function normalizePath(value, label) {
	if (typeof value !== "string" || !value.trim()) {
		throw new Error(`${label} must be a non-empty path.`);
	}
	const normalized = value.trim().replaceAll("\\", "/");
	if (
		normalized.startsWith("/") ||
		/^[a-z]:\//i.test(normalized) ||
		normalized.endsWith("/") ||
		normalized.split("/").some((part) => !part || part === "." || part === "..")
	) {
		throw new Error(`${label} must be a normalized repository-relative path.`);
	}
	return normalized;
}

function containsPath(parent, child) {
	return child === parent || child.startsWith(`${parent}/`);
}

function assertContainedPath(root, relativePath) {
	const absoluteRoot = resolve(root);
	const absolute = resolve(absoluteRoot, relativePath);
	const fromRoot = relative(absoluteRoot, absolute);
	if (!fromRoot || fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
		throw new Error(`Starter-owned path escapes repository: ${relativePath}.`);
	}
	let cursor = absoluteRoot;
	for (const part of relativePath.split("/")) {
		cursor = resolve(cursor, part);
		if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) {
			throw new Error(`Starter-owned path must not traverse a symlink: ${relativePath}.`);
		}
	}
	if (existsSync(absolute)) {
		const real = realpathSync.native(absolute);
		if (real !== absoluteRoot && !real.startsWith(`${absoluteRoot}${sep}`)) {
			throw new Error(`Starter-owned path resolves outside repository: ${relativePath}.`);
		}
	}
	return absolute;
}

export function readStarterOwnedManifest(root = process.cwd(), manifestPath = "starter-owned.json") {
	const normalizedManifestPath = normalizePath(manifestPath, "manifestPath");
	const absolute = assertContainedPath(root, normalizedManifestPath);
	if (!existsSync(absolute)) throw new Error(`Starter ownership manifest is missing: ${normalizedManifestPath}.`);
	const manifest = JSON.parse(readFileSync(absolute, "utf8"));
	if (manifest.schemaVersion !== 1) throw new Error("starter-owned schemaVersion must equal 1.");
	if (!Array.isArray(manifest.include) || !manifest.include.length) {
		throw new Error("starter-owned include must contain at least one rule.");
	}
	if (!Array.isArray(manifest.exclude)) throw new Error("starter-owned exclude must be an array.");
	const include = manifest.include.map((rule, index) => {
		if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
			throw new Error(`starter-owned include[${index}] must be an object.`);
		}
		if (!['file', 'tree'].includes(rule.type)) {
			throw new Error(`starter-owned include[${index}].type must be file or tree.`);
		}
		return { path: normalizePath(rule.path, `include[${index}].path`), type: rule.type };
	});
	const exclude = manifest.exclude.map((entry, index) => normalizePath(entry, `exclude[${index}]`));
	const allRulePaths = include.map((rule) => rule.path);
	if (new Set(allRulePaths).size !== allRulePaths.length || new Set(exclude).size !== exclude.length) {
		throw new Error("starter-owned contains duplicate paths.");
	}
	for (let left = 0; left < include.length; left += 1) {
		for (let right = left + 1; right < include.length; right += 1) {
			if (containsPath(include[left].path, include[right].path) || containsPath(include[right].path, include[left].path)) {
				throw new Error(`Starter ownership rules overlap: ${include[left].path} and ${include[right].path}.`);
			}
		}
		for (const excluded of exclude) {
			if (containsPath(include[left].path, excluded) || containsPath(excluded, include[left].path)) {
				throw new Error(`Starter and client ownership overlap: ${include[left].path} and ${excluded}.`);
			}
		}
	}
	for (const rule of include) {
		const path = assertContainedPath(root, rule.path);
		if (!existsSync(path)) throw new Error(`Starter-owned rule points to an unknown path: ${rule.path}.`);
		const stats = lstatSync(path);
		if ((rule.type === "file" && !stats.isFile()) || (rule.type === "tree" && !stats.isDirectory())) {
			throw new Error(`Starter-owned rule type does not match path: ${rule.path}.`);
		}
	}
	return { schemaVersion: 1, include, exclude, manifestPath: normalizedManifestPath };
}

function walkFiles(root, relativePath) {
	const absolute = assertContainedPath(root, relativePath);
	const stats = lstatSync(absolute);
	if (stats.isFile()) return [relativePath];
	if (!stats.isDirectory()) throw new Error(`Starter-owned path is not a file or directory: ${relativePath}.`);
	return readdirSync(absolute, { withFileTypes: true })
		.filter((entry) => !["node_modules", ".next"].includes(entry.name))
		.sort((left, right) => left.name.localeCompare(right.name, "en"))
		.flatMap((entry) => {
			const child = `${relativePath}/${entry.name}`;
			if (entry.isSymbolicLink()) throw new Error(`Starter-owned path must not contain a symlink: ${child}.`);
			return entry.isDirectory() ? walkFiles(root, child) : [child];
		});
}

function candidateFiles(root, rule) {
	if (!existsSync(resolve(root, ".git"))) return walkFiles(root, rule.path);
	const result = execFileSync(
		"git",
		["ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", rule.path],
		{ cwd: root, encoding: "utf8" },
	)
		.split("\0")
		.filter(Boolean)
		.map((path) => path.replaceAll("\\", "/"));
	return rule.type === "file" ? result.filter((path) => path === rule.path) : result.filter((path) => containsPath(rule.path, path));
}

export function starterOwnedFiles(root = process.cwd(), manifest = readStarterOwnedManifest(root)) {
	const files = new Set();
	for (const rule of manifest.include) {
		const matches = candidateFiles(root, rule);
		if (!matches.length) throw new Error(`Starter-owned rule has no tracked files: ${rule.path}.`);
		for (const path of matches) {
			if (manifest.exclude.some((excluded) => containsPath(excluded, path))) {
				throw new Error(`Tracked file has mixed starter/client ownership: ${path}.`);
			}
			assertContainedPath(root, path);
			files.add(path);
		}
	}
	return [...files].sort();
}

export function hashStarterOwnedFiles(root = process.cwd(), manifest = readStarterOwnedManifest(root)) {
	return Object.fromEntries(starterOwnedFiles(root, manifest).map((path) => [
		path,
		createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex"),
	]));
}

export function validateStarterVersion(value, { expectedTag, expectedSha } = {}) {
	if (!value || typeof value !== "object" || Array.isArray(value) || value.schemaVersion !== 1) {
		throw new Error(".starter-version schemaVersion must equal 1.");
	}
	if (typeof value.tag !== "string" || !value.tag) throw new Error(".starter-version tag is missing.");
	if (!/^[0-9a-f]{40}$/.test(value.sha)) throw new Error(".starter-version SHA is invalid.");
	if (!Number.isInteger(value.manifestVersion) || value.manifestVersion < 1) {
		throw new Error(".starter-version manifestVersion is invalid.");
	}
	if (!value.hashes || typeof value.hashes !== "object" || Array.isArray(value.hashes) || !Object.keys(value.hashes).length) {
		throw new Error(".starter-version hashes are missing.");
	}
	for (const [path, hash] of Object.entries(value.hashes)) {
		normalizePath(path, `.starter-version hashes.${path}`);
		if (!digestPattern.test(hash)) throw new Error(`.starter-version hash is invalid: ${path}.`);
	}
	if (expectedTag && value.tag !== expectedTag) throw new Error(".starter-version tag mismatch.");
	if (expectedSha && value.sha !== expectedSha) throw new Error(".starter-version SHA mismatch.");
	const serialized = JSON.stringify(value);
	if (/([a-z]:\\|\/Users\/|\\Users\\)/i.test(serialized)) throw new Error(".starter-version contains a machine path.");
	return value;
}
