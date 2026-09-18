export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	const { assertRuntimeEnvOrThrow } = await import(
		"./src/core/operations/runtime-env.ts"
	);
	assertRuntimeEnvOrThrow();
}
