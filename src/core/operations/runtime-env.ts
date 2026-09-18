export type RuntimeEnvMode = "build" | "migrate" | "runtime" | "development";

const buildPhases = new Set([
	"phase-production-build",
	"phase-development-build",
]);

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
