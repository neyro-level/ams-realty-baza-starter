import { execFileSync } from "node:child_process";
import { leadDeliveryRelationalContractUpSql } from "../../migrations/20260919_151000.ts";
import {
	payloadAuthSecurityDownSql,
	payloadAuthSecurityUpSql,
} from "../../migrations/20260921_185354_add_reset_password_requested_at.ts";
import {
	siteSettingsDownSql,
	siteSettingsUpSql,
} from "../../migrations/20260924_111534.ts";
import {
	geoHierarchyDownSql,
	geoHierarchyUpSql,
} from "../../migrations/20260924_134500_geo_hierarchy.ts";
import {
	propertyGeoRefsDownSql,
	propertyGeoRefsUpSql,
} from "../../migrations/20260924_151000_property_geo_refs.ts";
import { propertyIdentityUpSql } from "../../migrations/20260924_170000_property_taxonomy_identity.ts";
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

export function proveSiteSettingsMigration(testUri) {
	psql(
		testUri,
		`CREATE TABLE media (id serial PRIMARY KEY);
		 CREATE TABLE p8_05_migration_sentinel (id integer PRIMARY KEY, note text NOT NULL);
		 INSERT INTO p8_05_migration_sentinel (id, note) VALUES (1, 'preserve-me');`,
	);
	psql(testUri, siteSettingsUpSql);
	if (
		psql(
			testUri,
			"SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('site_settings','site_settings_social_links')",
		) !== "2"
	) {
		throw new Error("Site settings migration did not create both tables.");
	}
	psql(
		testUri,
		"INSERT INTO site_settings (brand_name, phone) VALUES ('Fixture Agency', '+70000000000')",
	);
	psql(testUri, siteSettingsDownSql);
	if (
		psql(
			testUri,
			"SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('site_settings','site_settings_social_links')",
		) !== "0"
	) {
		throw new Error("Site settings migration down did not remove its tables.");
	}
	if (
		psql(testUri, "SELECT note FROM p8_05_migration_sentinel WHERE id = 1") !==
		"preserve-me"
	) {
		throw new Error("Site settings migration down changed unrelated data.");
	}
	psql(testUri, siteSettingsUpSql);
}

export function proveGeoHierarchyMigration(testUri) {
	psql(
		testUri,
		`CREATE TABLE p8_06_migration_sentinel (id integer PRIMARY KEY, note text NOT NULL);
		 CREATE TABLE payload_locked_documents_rels (id serial PRIMARY KEY);
		 INSERT INTO p8_06_migration_sentinel (id, note) VALUES (1, 'preserve-me');`,
	);
	psql(testUri, geoHierarchyUpSql);
	if (
		psql(
			testUri,
			"SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('regions','cities','districts')",
		) !== "3"
	) {
		throw new Error("Geo hierarchy migration did not create all three tables.");
	}
	psql(
		testUri,
		`INSERT INTO regions (slug, title, morphology_nominative, morphology_genitive, morphology_prepositional, short_name, sort_order, status, published_at, updated_at, created_at)
		 VALUES ('primorskiy-kray', 'Fixture Region', 'Fixture Region', 'Fixture Region genitive', 'Fixture Region prepositional', 'Fixture', 10, 'published', now(), now(), now());
		 INSERT INTO cities (slug, title, morphology_nominative, morphology_genitive, morphology_prepositional, preposition, city_type, region_id, morphology_approved, sort_order, status, published_at, updated_at, created_at)
		 VALUES ('primorsk', 'Fixture Primary City', 'Fixture Primary City', 'Fixture Primary City genitive', 'Fixture Primary City prepositional', 'v', 'city', 1, true, 10, 'published', now(), now(), now());
		 INSERT INTO cities (slug, title, morphology_nominative, morphology_genitive, morphology_prepositional, preposition, city_type, region_id, agglomeration_of_id, morphology_approved, sort_order, status, published_at, updated_at, created_at)
		 VALUES ('zarechnyy', 'Fixture Nearby City', 'Fixture Nearby City', 'Fixture Nearby City genitive', 'Fixture Nearby City prepositional', 'v', 'city', 1, 1, true, 20, 'published', now(), now(), now());
		 INSERT INTO districts (slug, title, morphology_nominative, morphology_genitive, morphology_prepositional, district_type, city_id, preposition, morphology_approved, sort_order, status, published_at, updated_at, created_at)
		 VALUES ('severnyy', 'Fixture District', 'Fixture District', 'Fixture District genitive', 'Fixture District prepositional', 'microdistrict', 1, 'na', true, 10, 'published', now(), now(), now());
		 INSERT INTO districts (slug, title, morphology_nominative, morphology_genitive, morphology_prepositional, district_type, city_id, parent_id, preposition, morphology_approved, sort_order, status, updated_at, created_at)
		 VALUES ('yuzhnyy', 'Fixture Child District', 'Fixture Child District', 'Fixture Child District genitive', 'Fixture Child District prepositional', 'administrative', 1, 1, 'v', true, 20, 'draft', now(), now());`,
	);
	expectPsqlFailure(
		testUri,
		"INSERT INTO regions (slug,title,morphology_nominative,morphology_genitive,morphology_prepositional,short_name,sort_order,status,updated_at,created_at) VALUES ('primorsk','Collision','Collision','Collision','Collision','Collision',0,'draft',now(),now())",
		/already owned by a city/i,
	);
	expectPsqlFailure(
		testUri,
		"INSERT INTO cities (slug,title,morphology_nominative,morphology_genitive,morphology_prepositional,preposition,city_type,region_id,morphology_approved,sort_order,status,updated_at,created_at) VALUES ('novostroyki','Reserved','Reserved','Reserved','Reserved','v','city',1,true,0,'draft',now(),now())",
		/reserved namespace/i,
	);
	expectPsqlFailure(
		testUri,
		"INSERT INTO districts (slug,title,morphology_nominative,morphology_genitive,morphology_prepositional,district_type,city_id,preposition,morphology_approved,sort_order,status,updated_at,created_at) VALUES ('severnyy','Duplicate','Duplicate','Duplicate','Duplicate','microdistrict',1,'na',true,0,'draft',now(),now())",
		/districts_city_slug_unique_idx/i,
	);
	expectPsqlFailure(
		testUri,
		"INSERT INTO districts (slug,title,morphology_nominative,morphology_genitive,morphology_prepositional,district_type,city_id,preposition,morphology_approved,sort_order,status,updated_at,created_at) VALUES ('dvukhkomnatnye','Facet collision','Facet collision','Facet collision','Facet collision','microdistrict',1,'na',true,0,'draft',now(),now())",
		/reserved facet namespace/i,
	);
	expectPsqlFailure(
		testUri,
		"UPDATE cities SET agglomeration_of_id = 2 WHERE id = 1",
		/agglomeration hierarchy contains a cycle/i,
	);
	expectPsqlFailure(
		testUri,
		"UPDATE cities SET slug = 'primorsk-renamed' WHERE id = 1",
		/published geo slug is immutable/i,
	);
	expectPsqlFailure(
		testUri,
		"UPDATE districts SET parent_id = 2 WHERE id = 1",
		/district hierarchy contains a cycle/i,
	);
	psql(testUri, geoHierarchyDownSql);
	if (
		psql(
			testUri,
			"SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('regions','cities','districts')",
		) !== "0"
	) {
		throw new Error("Geo hierarchy down migration left geo tables behind.");
	}
	if (
		psql(testUri, "SELECT note FROM p8_06_migration_sentinel WHERE id = 1") !==
		"preserve-me"
	) {
		throw new Error("Geo hierarchy down migration changed unrelated data.");
	}
	psql(testUri, geoHierarchyUpSql);
}

export function provePropertyGeoRefsMigration(testUri) {
	psql(
		testUri,
		`CREATE TABLE regions (id serial PRIMARY KEY);
		 CREATE TABLE cities (id serial PRIMARY KEY);
		 CREATE TABLE districts (id serial PRIMARY KEY);
		 CREATE TABLE properties (id serial PRIMARY KEY, region varchar, locality varchar, district varchar);
		 CREATE TABLE p8_07_migration_sentinel (id integer PRIMARY KEY, note text NOT NULL);
		 INSERT INTO regions DEFAULT VALUES;
		 INSERT INTO cities DEFAULT VALUES;
		 INSERT INTO districts DEFAULT VALUES;
		 INSERT INTO properties (region, locality, district) VALUES ('raw-region', 'raw-city', 'raw-district');
		 INSERT INTO p8_07_migration_sentinel (id, note) VALUES (1, 'preserve-me');`,
	);
	psql(testUri, propertyGeoRefsUpSql);
	psql(
		testUri,
		"UPDATE properties SET region_ref_id=1, city_ref_id=1, district_ref_id=1 WHERE id=1",
	);
	psql(testUri, propertyGeoRefsDownSql);
	if (
		psql(
			testUri,
			"SELECT region || '|' || locality || '|' || district FROM properties WHERE id=1",
		) !== "raw-region|raw-city|raw-district"
	) {
		throw new Error("Property geo refs down migration changed legacy raw geo.");
	}
	if (
		psql(testUri, "SELECT note FROM p8_07_migration_sentinel WHERE id=1") !==
		"preserve-me"
	) {
		throw new Error("Property geo refs down migration changed unrelated data.");
	}
	psql(testUri, propertyGeoRefsUpSql);
}

export function provePropertyIdentityMigration(testUri) {
	psql(
		testUri,
		`CREATE TYPE enum_properties_category AS ENUM ('apartment', 'house', 'land', 'commercial');
		 CREATE TABLE properties (id serial PRIMARY KEY, slug varchar NOT NULL);
		 INSERT INTO properties (slug) VALUES ('existing-a'), ('existing-b');`,
	);
	psql(testUri, propertyIdentityUpSql);
	const existingIds = psql(
		testUri,
		"SELECT string_agg(public_url_id::text, ',' ORDER BY id) FROM properties",
	);
	if (existingIds !== "1,2") {
		throw new Error(`Identity migration did not deterministically retain assigned IDs: ${existingIds}`);
	}
	psql(testUri, "INSERT INTO properties (slug) VALUES ('new-c'), ('new-d')");
	if (
		psql(testUri, "SELECT count(DISTINCT public_url_id) FROM properties") !== "4"
	) {
		throw new Error("Identity sequence reused a public URL ID.");
	}
	expectPsqlFailure(
		testUri,
		"UPDATE properties SET public_url_id = 999 WHERE slug = 'existing-a'",
		/immutable/i,
	);
	if (
		psql(testUri, "SELECT public_url_id FROM properties WHERE slug='existing-a'") !== "1"
	) {
		throw new Error("Rejected identity update changed an assigned ID.");
	}
}

export function psqlOnTest(testUri, sql) {
	return psql(testUri, sql);
}
