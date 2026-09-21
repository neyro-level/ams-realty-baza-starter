import { z } from "zod";

const booleanString = z
	.enum(["true", "false"])
	.optional()
	.transform((value) => value === "true");

const optionalUrl = z
	.string()
	.url()
	.optional()
	.or(z.literal("").transform(() => undefined));
const optionalString = z
	.string()
	.min(1)
	.optional()
	.or(z.literal("").transform(() => undefined));
const optionalInteger = z.preprocess(
	(value) => (value === "" || value == null ? undefined : value),
	z.coerce.number().int().positive().optional(),
);

const runtimeEnvSchema = z.object({
	AMS_PROFILE: z.literal("REALTY_BASE").default("REALTY_BASE"),
	TZ: z.string().min(1).default("Europe/Moscow"),
	JOBS_AUTORUN: booleanString.default(false),
	CACHE_INVALIDATION_MODE: z.enum(["http"]).default("http"),
	PAYLOAD_DB_PUSH: booleanString.default(false),

	// Public origin stays optional at Zod parse so `next build` can import this module.
	// Production runtime fail-fast for empty/invalid URL is evaluateRuntimeEnv.
	NEXT_PUBLIC_SERVER_URL: optionalString,
	INTERNAL_REVALIDATE_BASE_URL: optionalUrl,
	INTERNAL_HEALTH_SECRET: optionalString,
	REVALIDATE_SECRET: optionalString,
	REVALIDATE_RATE_LIMIT_PER_MINUTE: optionalInteger.default(30),

	DATABASE_URI: optionalString,
	DATABASE_POOL_MAX: optionalInteger.default(10),
	PAYLOAD_SECRET: optionalString,
	MEDIA_DIR: optionalString,

	OUTBOUND_ALLOWED_HOSTS: optionalString,
	EXTERNAL_IMAGE_HOSTS: optionalString,
	LEAD_CHANNELS: optionalString,
	LEAD_OUTBOUND_HOSTS: optionalString,
	MAX_BOT_TOKEN: optionalString,
	MAX_CHAT_ID: optionalString,
	MAX_API_URL: optionalUrl,
	CUSTOM_WEBHOOK_URL: optionalString,
	CUSTOM_WEBHOOK_HMAC_SECRET: optionalString,
	LEAD_RATE_LIMIT_PER_MINUTE: optionalInteger.default(30),

	ARCHIVE_RETENTION_DAYS: optionalInteger,
	LEAD_RETENTION_DAYS: optionalInteger,
	ALERT_WEBHOOK_URL: optionalUrl,
	BACKUP_STATUS_PATH: optionalString,
});

export type RuntimeEnvMode =
	| "build"
	| "development"
	| "migrate"
	| "runtime"
	| "test";

const buildPhases = new Set([
	"phase-production-build",
	"phase-development-build",
]);
const knownChannelCredentials: Record<string, readonly string[]> = {
	max: ["MAX_BOT_TOKEN", "MAX_CHAT_ID", "MAX_API_URL"],
	"custom-webhook": ["CUSTOM_WEBHOOK_URL", "CUSTOM_WEBHOOK_HMAC_SECRET"],
};

export function detectRuntimeEnvMode(
	env: NodeJS.ProcessEnv = process.env,
): RuntimeEnvMode {
	if (env.NEXT_PHASE && buildPhases.has(env.NEXT_PHASE)) return "build";
	const lifecycle = env.npm_lifecycle_event ?? "";
	if (lifecycle.includes("migrate") || env.PAYLOAD_MIGRATING === "true") {
		return "migrate";
	}
	if (env.NODE_ENV === "test" || lifecycle.includes("test")) return "test";
	if (env.NODE_ENV === "production") return "runtime";
	return "development";
}

export function requiredKeysForMode(mode: RuntimeEnvMode): string[] {
	if (mode === "migrate") return ["DATABASE_URI", "PAYLOAD_SECRET"];
	if (mode !== "runtime") return [];
	return [
		"AMS_PROFILE",
		"TZ",
		"DATABASE_URI",
		"PAYLOAD_SECRET",
		"NEXT_PUBLIC_SERVER_URL",
		"MEDIA_DIR",
	];
}

function isHttpOrigin(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

function isSafeInternalOrigin(value: string): boolean {
	try {
		const parsed = new URL(value);
		return (
			parsed.protocol === "https:" ||
			(parsed.protocol === "http:" &&
				(parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost"))
		);
	} catch {
		return false;
	}
}

function isHttpsUrl(value: string): boolean {
	try {
		return new URL(value).protocol === "https:";
	} catch {
		return false;
	}
}

function parseChannelIds(raw?: string): string[] | null {
	if (!raw?.trim()) return [];
	const trimmed = raw.trim();
	if (trimmed.startsWith("[")) {
		try {
			const parsed = JSON.parse(trimmed) as unknown;
			return Array.isArray(parsed)
				? parsed.map((item) => String(item).trim()).filter(Boolean)
				: null;
		} catch {
			return null;
		}
	}
	return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
}

function addInvalid(invalid: string[], key: string) {
	if (!invalid.includes(key)) invalid.push(key);
}

export function evaluateRuntimeEnv(
	env: NodeJS.ProcessEnv = process.env,
	mode: RuntimeEnvMode = detectRuntimeEnvMode(env),
): { ok: boolean; mode: RuntimeEnvMode; missing: string[] } {
	const missing: string[] = [];
	const parsed = runtimeEnvSchema.safeParse(env);
	if (!parsed.success) {
		for (const issue of parsed.error.issues) {
			addInvalid(missing, String(issue.path[0] ?? "PROJECT_ENV"));
		}
	}
	for (const key of requiredKeysForMode(mode)) {
		if (!env[key]?.trim()) addInvalid(missing, key);
	}
	if (mode === "runtime") {
		if (env.AMS_PROFILE?.trim() && env.AMS_PROFILE !== "REALTY_BASE") {
			addInvalid(missing, "AMS_PROFILE");
		}
		const siteUrl = env.NEXT_PUBLIC_SERVER_URL?.trim();
		if (siteUrl && !isHttpOrigin(siteUrl)) addInvalid(missing, "NEXT_PUBLIC_SERVER_URL");
		if (env.PAYLOAD_DB_PUSH === "true") addInvalid(missing, "PAYLOAD_DB_PUSH");
		if ((env.CACHE_INVALIDATION_MODE?.trim() || "http") === "http") {
			if (!env.REVALIDATE_SECRET?.trim()) addInvalid(missing, "REVALIDATE_SECRET");
			const baseUrl = env.INTERNAL_REVALIDATE_BASE_URL?.trim();
			if (!baseUrl || !isSafeInternalOrigin(baseUrl)) {
				addInvalid(missing, "INTERNAL_REVALIDATE_BASE_URL");
			}
		}
		const channels = parseChannelIds(env.LEAD_CHANNELS);
		if (channels === null) addInvalid(missing, "LEAD_CHANNELS");
		for (const channel of channels ?? []) {
			const keys = knownChannelCredentials[channel];
			if (!keys) {
				addInvalid(missing, "LEAD_CHANNELS");
				continue;
			}
			for (const key of keys) if (!env[key]?.trim()) addInvalid(missing, key);
		}
		if ((channels?.length ?? 0) > 0 && !env.LEAD_OUTBOUND_HOSTS?.trim()) {
			addInvalid(missing, "LEAD_OUTBOUND_HOSTS");
		}
		if (channels?.includes("custom-webhook")) {
			const url = env.CUSTOM_WEBHOOK_URL?.trim();
			if (url && !isHttpsUrl(url)) addInvalid(missing, "CUSTOM_WEBHOOK_URL");
		}
	}
	return { ok: missing.length === 0, mode, missing };
}

export function parseProjectEnv(
	rawEnv: NodeJS.ProcessEnv,
	mode: RuntimeEnvMode = detectRuntimeEnvMode(rawEnv),
) {
	const result = evaluateRuntimeEnv(rawEnv, mode);
	if (!result.ok) {
		throw new Error(
			`Project env fail-fast (${mode}): invalid or missing ${result.missing.join(", ")}.`,
		);
	}
	return runtimeEnvSchema.parse(rawEnv);
}

export function assertRuntimeEnvOrThrow(
	env: NodeJS.ProcessEnv = process.env,
): void {
	parseProjectEnv(env, detectRuntimeEnvMode(env));
}

export const runtimeEnv = runtimeEnvSchema.parse(process.env);

export const isPayloadRuntimeConfigured =
	Boolean(runtimeEnv.DATABASE_URI) && Boolean(runtimeEnv.PAYLOAD_SECRET);

export function requirePayloadRuntime() {
	if (!runtimeEnv.DATABASE_URI) {
		throw new Error("DATABASE_URI is required for Payload runtime.");
	}
	if (!runtimeEnv.PAYLOAD_SECRET) {
		throw new Error("PAYLOAD_SECRET is required for Payload runtime.");
	}
	return {
		databaseUri: runtimeEnv.DATABASE_URI,
		payloadSecret: runtimeEnv.PAYLOAD_SECRET,
	};
}
