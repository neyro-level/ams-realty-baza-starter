import { execFileSync } from "node:child_process";
import { loadLocalEnv } from "./integration/env.mjs";

loadLocalEnv();

const databaseUri = process.env.DATABASE_URI;

if (!databaseUri) {
	console.error("verify:schema requires DATABASE_URI for a local PostgreSQL database.");
	process.exit(2);
}

function psql(sql) {
	try {
		execFileSync("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-d", databaseUri, "-c", sql], {
			stdio: "pipe",
			env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? "" },
		});
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
		'properties_public_sitemap_idx'
	];
	required_index text;
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

	IF NOT EXISTS (
		SELECT 1
		FROM pg_trigger
		WHERE tgname = 'feed_sources_prevent_delete_with_links'
			AND NOT tgisinternal
	) THEN
		RAISE EXCEPTION 'Missing feed source delete guard trigger';
	END IF;
END $$;
`);

psql(`
DO $$
DECLARE
	fixture_feed_source_id integer;
	fixture_lead_id integer;
BEGIN
	INSERT INTO feed_sources (code, title, parser, market, feed_url_ref, enabled)
	VALUES ('verify-schema-feed', 'Verify schema feed', 'yrl', 'secondary', 'VERIFY_SCHEMA_FEED_URL', true)
	RETURNING id INTO fixture_feed_source_id;

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
		'verify-schema-offer-1',
		'secondary',
		'apartment',
		'sale',
		'Verify schema offer 1'
	);

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

	DELETE FROM lead_deliveries WHERE lead_deliveries.lead_id = fixture_lead_id;
	DELETE FROM leads WHERE leads.id = fixture_lead_id;
	DELETE FROM properties WHERE properties.feed_source_id = fixture_feed_source_id;
	DELETE FROM feed_sources WHERE feed_sources.id = fixture_feed_source_id;
END $$;
`);

console.log("verify:schema passed");
