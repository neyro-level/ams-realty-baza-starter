import { execFileSync } from "node:child_process";
import { leadDeliveryRelationalContractUpSql } from "../../migrations/20260919_151000.ts";
import {
	payloadAuthSecurityDownSql,
	payloadAuthSecurityUpSql,
} from "../../migrations/20260921_185354_add_reset_password_requested_at.ts";
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

	const ownsPublicSchema = psql(
		preferredUri,
		"SELECT pg_get_userbyid(nspowner) = current_user FROM pg_namespace WHERE nspname = 'public'",
	);
	const isSuperuser = psql(
		preferredUri,
		"SELECT current_setting('is_superuser') = 'on'",
	);
	if (ownsPublicSchema === "t" || isSuperuser === "t") {
		psql(preferredUri, "DROP SCHEMA IF EXISTS public CASCADE");
		psql(preferredUri, "CREATE SCHEMA public");
		psql(preferredUri, "GRANT ALL ON SCHEMA public TO PUBLIC");
	} else {
		// PostgreSQL 15+ databases can retain a public schema owned by the bootstrap
		// administrator. The isolated test role still owns every Payload object, so
		// remove only that role's disposable objects without requiring superuser.
		psql(preferredUri, "DROP OWNED BY CURRENT_USER CASCADE");
	}
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

export function proveLeadDeliveryRelationalMigration(testUri) {
	psql(
		testUri,
		`
		CREATE TABLE leads (id serial PRIMARY KEY);
		CREATE TABLE lead_deliveries (
			id serial PRIMARY KEY,
			lead_id integer,
			CONSTRAINT lead_deliveries_lead_id_leads_id_fk
				FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
		);
		INSERT INTO leads DEFAULT VALUES;
		INSERT INTO lead_deliveries (lead_id) VALUES (1);
		INSERT INTO lead_deliveries (lead_id) VALUES (NULL);
	`,
	);
	expectPsqlFailure(
		testUri,
		leadDeliveryRelationalContractUpSql,
		/relational retention migration stopped/i,
	);
	const relationAfterFailure = psql(
		testUri,
		"SELECT confdeltype FROM pg_constraint WHERE conname = 'lead_deliveries_lead_id_leads_id_fk'",
	);
	if (relationAfterFailure !== "n") {
		throw new Error("Rejected relational migration changed the previous FK.");
	}

	psql(testUri, "DELETE FROM lead_deliveries WHERE lead_id IS NULL");
	psql(testUri, leadDeliveryRelationalContractUpSql);
	const contract = psql(
		testUri,
		`SELECT constraint_row.confdeltype::text || '|' || column_row.attnotnull::text
		 FROM pg_constraint constraint_row
		 JOIN pg_attribute column_row
		 ON column_row.attrelid = constraint_row.conrelid
		 AND column_row.attnum = ANY (constraint_row.conkey)
		 WHERE constraint_row.conname = 'lead_deliveries_lead_id_leads_id_fk'
		 AND column_row.attname = 'lead_id'`,
	);
	if (contract !== "c|true") {
		throw new Error(
			`Relational migration did not install cascade/not-null: ${contract}`,
		);
	}
	psql(testUri, "DELETE FROM leads WHERE id = 1");
	if (psql(testUri, "SELECT count(*) FROM lead_deliveries") !== "0") {
		throw new Error(
			"Lead delete did not cascade on the previous non-empty fixture.",
		);
	}
}

export function provePayloadAuthSecurityMigration(testUri) {
	psql(
		testUri,
		`
		CREATE TABLE users (
			id serial PRIMARY KEY,
			reset_password_token varchar,
			reset_password_expiration timestamp(3) with time zone
		);
		CREATE TABLE media (id serial PRIMARY KEY);
		CREATE TABLE properties_images (
			id serial PRIMARY KEY,
			media_id integer,
			CONSTRAINT properties_images_media_id_media_id_fk
				FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE set null
		);
	`,
	);
	psql(testUri, payloadAuthSecurityUpSql);
	if (
		psql(
			testUri,
			"SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='reset_password_requested_at'",
		) !== "1"
	) {
		throw new Error(
			"Payload auth migration did not add reset request timestamp.",
		);
	}
	psql(testUri, payloadAuthSecurityDownSql);
	if (
		psql(
			testUri,
			"SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='reset_password_requested_at'",
		) !== "0"
	) {
		throw new Error(
			"Payload auth migration down did not remove the new field.",
		);
	}
	psql(testUri, payloadAuthSecurityUpSql);
}

export function psqlOnTest(testUri, sql) {
	return psql(testUri, sql);
}
