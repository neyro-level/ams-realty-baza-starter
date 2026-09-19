import { execFileSync } from "node:child_process";
import { propertyNumericInvariantsUpSql } from "../../src/core/data-access/system/sql/property-numeric-invariants.ts";
import { assertLocalTestDatabaseUri } from "./env.mjs";

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

function expectPsqlFailure(uri, sql, expectedPattern) {
	try {
		psql(uri, sql);
	} catch (error) {
		if (!expectedPattern.test(String(error))) throw error;
		return;
	}
	throw new Error(`Expected PostgreSQL failure matching ${expectedPattern}.`);
}

function adminUri(uri) {
	const parsed = new URL(uri);
	parsed.pathname = "/postgres";
	return parsed.toString();
}

function adminUriFrom(uri) {
	return adminUri(uri);
}

export async function prepareIntegrationDatabase(preferredUri) {
	const { database } = assertLocalTestDatabaseUri(preferredUri);
	const admin = adminUriFrom(preferredUri);
	const exists = psql(
		admin,
		`SELECT 1 FROM pg_database WHERE datname = '${database.replace(/'/g, "''")}'`,
	);
	if (!exists) {
		psql(admin, `CREATE DATABASE ${database}`);
	}

	psql(preferredUri, "DROP SCHEMA IF EXISTS public CASCADE");
	psql(preferredUri, "CREATE SCHEMA public");
	psql(preferredUri, "GRANT ALL ON SCHEMA public TO PUBLIC");
	return { uri: preferredUri, fromZero: true };
}

export function runPayloadMigrations(env) {
	execFileSync("pnpm", ["exec", "payload", "migrate"], {
		stdio: "pipe",
		env: {
			...env,
			NODE_OPTIONS: [env.NODE_OPTIONS, "--conditions=react-server"]
				.filter(Boolean)
				.join(" "),
		},
		encoding: "utf8",
		shell: process.platform === "win32",
	});
}

export function provePropertyNumericMigration(testUri) {
	const createPreviousTable = `
		CREATE TABLE properties (
			id serial PRIMARY KEY,
			price_minor numeric,
			price_per_meter_minor numeric,
			total_area numeric,
			living_area numeric,
			kitchen_area numeric
		);
	`;

	psql(testUri, createPreviousTable);
	psql(
		testUri,
		"INSERT INTO properties (price_minor, total_area) VALUES (10.5, 42.25)",
	);
	expectPsqlFailure(
		testUri,
		propertyNumericInvariantsUpSql,
		/properties_price_minor_invariant/i,
	);
	const constraintsAfterFailure = psql(
		testUri,
		"SELECT count(*) FROM pg_constraint WHERE conrelid = 'properties'::regclass AND conname LIKE 'properties_%_invariant'",
	);
	if (constraintsAfterFailure !== "0") {
		throw new Error(
			"Failed numeric migration must not leave partial constraints.",
		);
	}

	psql(testUri, "DROP TABLE properties");
	psql(testUri, createPreviousTable);
	psql(
		testUri,
		"INSERT INTO properties (price_minor, price_per_meter_minor, total_area, living_area, kitchen_area) VALUES (123400, 10000, 12.34, 10.25, 2.09)",
	);
	psql(testUri, propertyNumericInvariantsUpSql);
	const preserved = psql(
		testUri,
		"SELECT price_minor || '|' || price_per_meter_minor || '|' || total_area || '|' || living_area || '|' || kitchen_area FROM properties",
	);
	if (preserved !== "123400|10000|12.34|10.25|2.09") {
		throw new Error(
			`Numeric migration changed valid previous data: ${preserved}`,
		);
	}
	expectPsqlFailure(
		testUri,
		"UPDATE properties SET price_minor = 1.5",
		/properties_price_minor_invariant/i,
	);
	expectPsqlFailure(
		testUri,
		"UPDATE properties SET total_area = 1.234",
		/properties_total_area_invariant/i,
	);
}

export function psqlOnTest(testUri, sql) {
	return psql(testUri, sql);
}
