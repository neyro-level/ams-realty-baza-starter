import { execFileSync } from "node:child_process";

function psql(uri, sql) {
	try {
		return execFileSync(
			"psql",
			["-X", "-v", "ON_ERROR_STOP=1", "-d", uri, "-t", "-A", "-c", sql],
			{
				stdio: "pipe",
				encoding: "utf8",
				env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? "" },
			},
		).trim();
	} catch (error) {
		const stderr = error.stderr?.toString("utf8")?.trim();
		throw new Error(stderr || "psql command failed");
	}
}

function adminUri(uri) {
	const parsed = new URL(uri);
	parsed.pathname = "/postgres";
	return parsed.toString();
}

export function assertLoopbackDatabaseUri(uri) {
	let parsed;
	try {
		parsed = new URL(uri);
	} catch {
		throw new Error("Test DATABASE_URI is not a valid URL.");
	}
	const host = parsed.hostname.toLowerCase();
	if (host !== "127.0.0.1" && host !== "localhost") {
		throw new Error("Integration tests only accept loopback PostgreSQL.");
	}
	return parsed;
}

function adminUriFrom(uri) {
	return adminUri(uri);
}

export async function prepareIntegrationDatabase(preferredUri, fallbackUri) {
	const preferred = assertLoopbackDatabaseUri(preferredUri);
	const database = decodeURIComponent(preferred.pathname.replace(/^\//, ""));
	const admin = adminUriFrom(preferredUri);
	const exists = psql(
		admin,
		`SELECT 1 FROM pg_database WHERE datname = '${database.replace(/'/g, "''")}'`,
	);
	if (!exists) {
		try {
			if (!/^[a-z0-9_]+$/.test(database)) {
				throw new Error("Unsafe test database name.");
			}
			psql(admin, `CREATE DATABASE ${database}`);
		} catch {
			assertLoopbackDatabaseUri(fallbackUri);
			return { uri: fallbackUri, fromZero: false };
		}
	}

	if (/_test$/.test(database)) {
		psql(preferredUri, "DROP SCHEMA IF EXISTS public CASCADE");
		psql(preferredUri, "CREATE SCHEMA public");
		psql(preferredUri, "GRANT ALL ON SCHEMA public TO PUBLIC");
		return { uri: preferredUri, fromZero: true };
	}

	return { uri: preferredUri, fromZero: false };
}

export function runPayloadMigrations(env) {
	execFileSync("pnpm", ["exec", "payload", "migrate"], {
		stdio: "pipe",
		env,
		encoding: "utf8",
		shell: process.platform === "win32",
	});
}

export function psqlOnTest(testUri, sql) {
	return psql(testUri, sql);
}
