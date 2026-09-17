import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const SAFE_NAME = /[^a-zA-Z0-9._-]+/g;

export function getMediaDirectory(): string {
	const configured = process.env.MEDIA_DIR?.trim();
	return configured && configured.length > 0
		? configured
		: path.resolve(process.cwd(), "media");
}

export function ensureMediaDirectory(): string {
	const directory = getMediaDirectory();
	if (!existsSync(directory)) {
		mkdirSync(directory, { recursive: true });
	}
	return directory;
}

export function isLocalMediaReady(): boolean {
	try {
		ensureMediaDirectory();
		return true;
	} catch {
		return false;
	}
}

export function uniqueMediaFilename(originalName: string): string {
	const base = path.basename(originalName).replace(SAFE_NAME, "-");
	const ext = path.extname(base);
	const stem = path.basename(base, ext) || "file";
	return `${stem}-${randomUUID()}${ext.toLowerCase()}`;
}
