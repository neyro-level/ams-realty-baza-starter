import { parseLeadChannelIds } from "../leads/channels.ts";

export type RuntimeEnvMode = "build" | "migrate" | "runtime" | "development";

const buildPhases = new Set([
	"phase-production-build",
	"phase-development-build",
]);

const knownChannelCredentials: Record<string, readonly string[]> = {
	max: ["MAX_BOT_TOKEN", "MAX_CHAT_ID"],
	"custom-webhook": ["CUSTOM_WEBHOOK_URL", "CUSTOM_WEBHOOK_HMAC_SECRET"],
};

export function detectRuntimeEnvMode(
	env: NodeJS.ProcessEnv = process.env,
): RuntimeEnvMode {
	if (env.NEXT_PHASE && buildPhases.has(env.NEXT_PHASE)) {
		return "build";
	}

	const lifecycle = env.npm_lifecycle_event ?? "";
	if (lifecycle.includes("migrate") || env.PAYLOAD_MIGRATING === "true") {
		return "migrate";
	}

	if (env.NODE_ENV === "production") {
		return "runtime";
	}

	return "development";
}

export function requiredKeysForMode(mode: RuntimeEnvMode): string[] {
	if (mode === "build" || mode === "development") {
		return [];
	}

	if (mode === "migrate") {
		return ["DATABASE_URI", "PAYLOAD_SECRET"];
	}

	return [
		"AMS_PROFILE",
		"TZ",
		"DATABASE_URI",
		"PAYLOAD_SECRET",
		"NEXT_PUBLIC_SERVER_URL",
		"MEDIA_DIR",
	];
}

function collectConditionalRuntimeKeys(env: NodeJS.ProcessEnv): string[] {
	const missing: string[] = [];
	const cacheMode = env.CACHE_INVALIDATION_MODE?.trim() || "http";
	if (cacheMode === "http" && !env.REVALIDATE_SECRET?.trim()) {
		missing.push("REVALIDATE_SECRET");
	}

	if (env.PAYLOAD_DB_PUSH === "true") {
		missing.push("PAYLOAD_DB_PUSH");
	}

	const rawChannels = env.LEAD_CHANNELS?.trim();
	if (rawChannels) {
		const ids = parseLeadChannelIds(rawChannels);
		if (ids.length === 0 && !missing.includes("LEAD_CHANNELS")) {
			missing.push("LEAD_CHANNELS");
		}

		for (const channel of ids) {
			const refs = knownChannelCredentials[channel];
			if (!refs) {
				if (!missing.includes("LEAD_CHANNELS")) {
					missing.push("LEAD_CHANNELS");
				}
				continue;
			}
			for (const key of refs) {
				if (!env[key]?.trim() && !missing.includes(key)) {
					missing.push(key);
				}
			}
		}
	}

	return missing;
}

function isHttpOrigin(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

export function evaluateRuntimeEnv(
	env: NodeJS.ProcessEnv = process.env,
	mode: RuntimeEnvMode = detectRuntimeEnvMode(env),
): { ok: boolean; mode: RuntimeEnvMode; missing: string[] } {
	const missing: string[] = [];

	for (const key of requiredKeysForMode(mode)) {
		const value = env[key]?.trim();
		if (!value) {
			missing.push(key);
		}
	}

	if (mode === "runtime" && env.AMS_PROFILE?.trim() && env.AMS_PROFILE !== "REALTY_BASE") {
		missing.push("AMS_PROFILE");
	}

	if (mode === "runtime") {
		const origin = env.NEXT_PUBLIC_SERVER_URL?.trim();
		if (origin && !isHttpOrigin(origin) && !missing.includes("NEXT_PUBLIC_SERVER_URL")) {
			missing.push("NEXT_PUBLIC_SERVER_URL");
		}

		for (const key of collectConditionalRuntimeKeys(env)) {
			if (!missing.includes(key)) {
				missing.push(key);
			}
		}
	}

	return { ok: missing.length === 0, mode, missing };
}

export function assertRuntimeEnvOrThrow(
	env: NodeJS.ProcessEnv = process.env,
): void {
	const result = evaluateRuntimeEnv(env);
	if (result.ok) {
		return;
	}

	throw new Error(
		`Runtime env fail-fast (${result.mode}): missing ${result.missing.join(", ")}.`,
	);
}
