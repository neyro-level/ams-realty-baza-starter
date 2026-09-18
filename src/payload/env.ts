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
const optionalInteger = z.coerce.number().int().positive().optional();

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

	ARCHIVE_RETENTION_DAYS: optionalInteger,
	LEAD_RETENTION_DAYS: optionalInteger,
	ALERT_WEBHOOK_URL: optionalUrl,
	BACKUP_STATUS_PATH: optionalString,
});

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
