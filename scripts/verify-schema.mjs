import { execFileSync } from "node:child_process";
import { loadLocalEnv } from "./integration/env.mjs";

loadLocalEnv();

const databaseUri = process.env.DATABASE_URI;

if (!databaseUri) {
	console.error(
		"verify:schema requires DATABASE_URI for a local PostgreSQL database.",
	);
	process.exit(2);
}

function psql(sql) {
	try {
		execFileSync(
			"psql",
			["-X", "-v", "ON_ERROR_STOP=1", "-d", databaseUri, "-c", sql],
			{
				stdio: "pipe",
				env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? "" },
			},
		);
	} catch (error) {
		const stderr = error.stderr?.toString("utf8")?.trim();
		throw new Error(stderr || "psql command failed");
	}
}

psql(`
DO $$
DECLARE
	required_indexes text[] := ARRAY[
		'properties_feed_identity_unique_idx',
		'properties_feed_active_seen_idx',
		'lead_deliveries_lead_channel_unique_idx',
		'lead_deliveries_recovery_due_idx',
		'lead_deliveries_stale_sending_idx',
		'feed_sources_enabled_due_idx',
		'properties_public_catalog_idx',
		'properties_public_sitemap_idx',
		'payload_jobs_wait_until_idx',
		'payload_jobs_concurrency_key_idx',
		'site_settings_logo_idx',
		'site_settings_social_links_order_idx',
		'site_settings_social_links_parent_id_idx',
		'regions_slug_idx',
		'cities_slug_idx',
		'cities_region_idx',
		'cities_agglomeration_of_idx',
		'districts_city_slug_unique_idx',
		'districts_parent_idx',
		'districts_synonyms_order_idx',
		'districts_synonyms_parent_id_idx',
		'payload_locked_documents_rels_regions_id_idx',
		'payload_locked_documents_rels_cities_id_idx',
		'payload_locked_documents_rels_districts_id_idx'
		,'properties_region_ref_idx'
		,'properties_city_ref_idx'
		,'properties_district_ref_idx'
	];
	required_index text;
	required_constraints text[] := ARRAY[
		'properties_price_minor_invariant',
		'properties_price_per_meter_minor_invariant',
		'properties_total_area_invariant',
		'properties_living_area_invariant',
		'properties_kitchen_area_invariant'
	];
	required_constraint text;
BEGIN
	FOREACH required_index IN ARRAY required_indexes LOOP
		IF NOT EXISTS (
			SELECT 1
			FROM pg_indexes
			WHERE schemaname = 'public'
				AND indexname = required_index
		) THEN
			RAISE EXCEPTION 'Missing required index: %', required_index;
		END IF;
	END LOOP;

	FOREACH required_constraint IN ARRAY required_constraints LOOP
		IF NOT EXISTS (
			SELECT 1
			FROM pg_constraint
			WHERE conrelid = 'properties'::regclass
				AND conname = required_constraint
				AND contype = 'c'
		) THEN
			RAISE EXCEPTION 'Missing required property numeric constraint: %', required_constraint;
		END IF;
	END LOOP;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name = 'site_settings'
	) OR NOT EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name = 'site_settings_social_links'
	) THEN
		RAISE EXCEPTION 'Missing site settings Global tables';
	END IF;

	IF (
		SELECT count(*) FROM information_schema.tables
		WHERE table_schema = 'public'
			AND table_name IN ('regions', 'cities', 'districts')
	) <> 3 THEN
		RAISE EXCEPTION 'Missing canonical geo hierarchy tables';
	END IF;

	IF (
		SELECT count(*) FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'properties'
			AND column_name IN ('region_ref_id', 'city_ref_id', 'district_ref_id')
	) <> 3 THEN
		RAISE EXCEPTION 'Missing additive property geo reference columns';
	END IF;

	IF (
		SELECT count(*) FROM pg_constraint
		WHERE conname IN (
			'properties_region_ref_id_regions_id_fk',
			'properties_city_ref_id_cities_id_fk',
			'properties_district_ref_id_districts_id_fk'
		)
	) <> 3 THEN
		RAISE EXCEPTION 'Missing property geo reference foreign keys';
	END IF;

	IF (
		SELECT count(*) FROM pg_trigger
		WHERE tgname IN (
			'regions_root_slug_guard',
			'cities_root_slug_guard',
			'cities_agglomeration_guard',
			'districts_slug_guard',
			'regions_prevent_published_slug_change',
			'cities_prevent_published_slug_change',
			'districts_prevent_published_slug_change',
			'districts_parent_guard'
		) AND NOT tgisinternal
	) <> 8 THEN
		RAISE EXCEPTION 'Missing canonical geo hierarchy triggers';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'feed_sources_prevent_delete_with_links'
			AND NOT tgisinternal
	) THEN
		RAISE EXCEPTION 'Missing feed source delete guard trigger';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint constraint_row
		JOIN pg_attribute column_row
			ON column_row.attrelid = constraint_row.conrelid
			AND column_row.attnum = ANY (constraint_row.conkey)
		WHERE constraint_row.conrelid = 'lead_deliveries'::regclass
			AND constraint_row.conname = 'lead_deliveries_lead_id_leads_id_fk'
			AND constraint_row.contype = 'f'
			AND constraint_row.confdeltype = 'c'
			AND column_row.attname = 'lead_id'
			AND column_row.attnotnull
	) THEN
		RAISE EXCEPTION 'Lead delivery relation must be NOT NULL with ON DELETE CASCADE';
	END IF;
END $$;
`);

psql(`
DO $$
DECLARE
	fixture_feed_source_id integer;
	fixture_lead_id integer;
BEGIN
	INSERT INTO feed_sources (code, title, parser, market, feed_url_ref, enabled, next_due_at)
	VALUES ('verify-schema-feed', 'Verify schema feed', 'yrl', 'secondary', 'VERIFY_SCHEMA_FEED_URL', true, NOW())
	RETURNING id INTO fixture_feed_source_id;

	INSERT INTO properties (
		feed_source_id,
		external_id,
		origin,
		slug,
		market,
		category,
		deal_type,
		title,
		price_minor,
		price_per_meter_minor,
		total_area,
		living_area,
		kitchen_area
	)
	VALUES (
		fixture_feed_source_id,
		'offer-1',
		'feed',
		'verify-schema-offer-1',
		'secondary',
		'apartment',
		'sale',
		'Verify schema offer 1',
		123400,
		10000,
		12.34,
		10.25,
		2.09
	);

	BEGIN
		UPDATE properties
		SET price_minor = 1234.5
		WHERE feed_source_id = fixture_feed_source_id;
		RAISE EXCEPTION 'Expected fractional minor units to fail';
	EXCEPTION WHEN check_violation THEN
		NULL;
	END;

	BEGIN
		UPDATE properties
		SET total_area = 12.345
		WHERE feed_source_id = fixture_feed_source_id;
		RAISE EXCEPTION 'Expected area precision above two decimals to fail';
	EXCEPTION WHEN check_violation THEN
		NULL;
	END;

	BEGIN
		UPDATE properties
		SET living_area = -1
		WHERE feed_source_id = fixture_feed_source_id;
		RAISE EXCEPTION 'Expected negative area to fail';
	EXCEPTION WHEN check_violation THEN
		NULL;
	END;

	IF NOT EXISTS (
		SELECT 1 FROM properties
		WHERE feed_source_id = fixture_feed_source_id
			AND price_minor = 123400
			AND total_area = 12.34
			AND living_area = 10.25
			AND kitchen_area = 2.09
	) THEN
		RAISE EXCEPTION 'Valid numeric values were not preserved';
	END IF;

	BEGIN
		INSERT INTO properties (
			feed_source_id,
			external_id,
			origin,
			slug,
			market,
			category,
			deal_type,
			title
		)
		VALUES (
			fixture_feed_source_id,
			'offer-1',
			'feed',
			'verify-schema-offer-duplicate',
			'secondary',
			'apartment',
			'sale',
			'Verify schema offer duplicate'
		);
		RAISE EXCEPTION 'Expected feed identity unique constraint to reject duplicate property';
	EXCEPTION WHEN unique_violation THEN
		NULL;
	END;

	BEGIN
		DELETE FROM feed_sources WHERE id = fixture_feed_source_id;
		RAISE EXCEPTION 'Expected feed source delete guard to reject linked feed source deletion';
	EXCEPTION WHEN raise_exception THEN
		NULL;
	END;

	INSERT INTO leads (
		name,
		phone_e164,
		form_kind,
		source_page,
		consent_accepted,
		consent_version,
		consent_consented_at,
		idempotency_key
	)
	VALUES (
		'Verify Lead',
		'+79990000000',
		'callback',
		'/verify-schema',
		true,
		'pd-verify',
		now(),
		'verify-schema-lead'
	)
	RETURNING id INTO fixture_lead_id;

	INSERT INTO lead_deliveries (lead_id, channel_id, channel_kind, idempotency_key)
	VALUES (fixture_lead_id, 'max-primary', 'messenger', 'verify-schema-delivery-1');

	BEGIN
		INSERT INTO lead_deliveries (lead_id, channel_id, channel_kind, idempotency_key)
		VALUES (fixture_lead_id, 'max-primary', 'messenger', 'verify-schema-delivery-duplicate');
		RAISE EXCEPTION 'Expected lead delivery unique constraint to reject duplicate channel';
	EXCEPTION WHEN unique_violation THEN
		NULL;
	END;

	DELETE FROM leads WHERE leads.id = fixture_lead_id;
	IF EXISTS (
		SELECT 1 FROM lead_deliveries WHERE lead_deliveries.lead_id = fixture_lead_id
	) THEN
		RAISE EXCEPTION 'Lead delete did not cascade to linked deliveries';
	END IF;
	DELETE FROM properties WHERE properties.feed_source_id = fixture_feed_source_id;
	DELETE FROM feed_sources WHERE feed_sources.id = fixture_feed_source_id;
END $$;
`);

console.log("verify:schema passed");
