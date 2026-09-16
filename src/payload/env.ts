import { z } from "zod";

const booleanString = z
	.enum(["true", "false"])
	.optional()
	.transform((value) => value === "true");

const optionalUrl = z.string().url().optional().or(z.literal("").transform(() => undefined));
const optionalString = z.string().min(1).optional().or(z.literal("").transform(() => undefined));
const optionalInteger = z.coerce.number().int().positive().optional();

const runtimeEnvSchema = z.object({
	AMS_PROFILE: z.literal("REALTY_BASE").default("REALTY_BASE"),
	TZ: z.string().min(1).default("Europe/Moscow"),
	JOBS_AUTORUN: booleanString.default(false),
	CACHE_INVALIDATION_MODE: z.enum(["http"]).default("http"),
	PAYLOAD_DB_PUSH: booleanString.default(false),

	NEXT_PUBLIC_SERVER_URL: optionalUrl,
	INTERNAL_REVALIDATE_BASE_URL: optionalUrl,

	DATABASE_URI: optionalString,
	DATABASE_POOL_MAX: optionalInteger.default(10),
	PAYLOAD_SECRET: optionalString,

	S3_ENDPOINT: optionalUrl,
	S3_REGION: optionalString,
	S3_BUCKET: optionalString,
	S3_ACCESS_KEY: optionalString,
	S3_SECRET_KEY: optionalString,
	S3_FORCE_PATH_STYLE: booleanString.default(true),

	OUTBOUND_ALLOWED_HOSTS: optionalString,
	EXTERNAL_IMAGE_HOSTS: optionalString,
	LEAD_CHANNELS: optionalString,
	LEAD_OUTBOUND_HOSTS: optionalString,

	ARCHIVE_RETENTION_DAYS: optionalInteger,
	LEAD_RETENTION_DAYS: optionalInteger,
	ALERT_WEBHOOK_URL: optionalUrl,
});

export const runtimeEnv = runtimeEnvSchema.parse(process.env);

export const isPayloadRuntimeConfigured =
	Boolean(runtimeEnv.DATABASE_URI) && Boolean(runtimeEnv.PAYLOAD_SECRET);

export const isS3Configured =
	Boolean(runtimeEnv.S3_ENDPOINT) &&
	Boolean(runtimeEnv.S3_REGION) &&
	Boolean(runtimeEnv.S3_BUCKET) &&
	Boolean(runtimeEnv.S3_ACCESS_KEY) &&
	Boolean(runtimeEnv.S3_SECRET_KEY);

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
