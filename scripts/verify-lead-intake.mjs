import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import {
	buildFraudFingerprint,
	evaluateLeadRateLimit,
	hitInProcessLeadRateLimit,
	normalizePhoneToE164,
	prepareLeadIntake,
	resolveEnabledLeadChannels,
} from "../src/core/leads/index.ts";
import { getTrustedClientAddress } from "../src/core/security/trusted-client-address.ts";

const validPayload = {
	name: "Иван Петров",
	phone: "8 (916) 123-45-67",
	email: "ivan@example.test",
	message: "Хочу консультацию",
	formKind: "consultation",
	sourcePage: "/kontakty",
	referrer: "/",
	consentAccepted: true,
	consentVersion: "privacy-2026-09",
	consentedAt: "2026-09-16T12:00:00.000Z",
	honeypot: "",
	renderedAt: "2026-09-16T11:59:50.000Z",
	submittedAt: "2026-09-16T12:00:00.000Z",
};

assert.equal(normalizePhoneToE164("8 (916) 123-45-67"), "+79161234567");
assert.equal(normalizePhoneToE164("+44 20 7946 0958"), "+442079460958");
assert.equal(normalizePhoneToE164("12"), undefined);

const accepted = prepareLeadIntake(validPayload);
assert.equal(accepted.accepted, true);
assert.equal(accepted.lead.phoneE164, "+79161234567");
assert.equal(accepted.lead.consent.version, "privacy-2026-09");
assert.equal(accepted.lead.idempotencyKey.startsWith("lead:"), true);
assert.equal(accepted.lead.fraudFingerprint.startsWith("lead-fraud:"), true);
assert.equal(accepted.safeDiagnostics.rawPiiIncluded, false);
assertNoRawPii(accepted.safeDiagnostics);

const sameIdentityLaterConsent = prepareLeadIntake({
	...validPayload,
	consentedAt: "2026-09-16T12:30:00.000Z",
	renderedAt: "2026-09-16T12:29:50.000Z",
	submittedAt: "2026-09-16T12:30:00.000Z",
});
assert.equal(sameIdentityLaterConsent.accepted, true);
assert.equal(
	sameIdentityLaterConsent.lead.idempotencyKey,
	accepted.lead.idempotencyKey,
	"Idempotency must not depend on timestamp alone.",
);

const hmacFingerprint = buildFraudFingerprint(
	{
		phoneE164: "+79161234567",
		sourcePage: "/kontakty",
		submittedAt: "2026-09-16T12:00:00.000Z",
	},
	"test-hmac-key",
);
assert.equal(hmacFingerprint.startsWith("lead-fraud:"), true);
assert.notEqual(hmacFingerprint, accepted.lead.fraudFingerprint);

assert.deepEqual(resolveEnabledLeadChannels({}), []);
assert.deepEqual(
	resolveEnabledLeadChannels({ LEAD_CHANNELS: "max" }),
	[],
	"Enabled channel without credential refs and host allowlist must stay off.",
);
assert.equal(
	resolveEnabledLeadChannels({
		LEAD_CHANNELS: "max",
		LEAD_OUTBOUND_HOSTS: "botapi.max.ru",
		MAX_BOT_TOKEN: "x",
		MAX_CHAT_ID: "1",
	}).length,
	1,
);

const firstHit = hitInProcessLeadRateLimit({
	key: "verify-lead-intake",
	limit: 2,
	now: 1,
});
assert.equal(firstHit, undefined);
hitInProcessLeadRateLimit({ key: "verify-lead-intake", limit: 2, now: 1 });
const limitedInProcess = hitInProcessLeadRateLimit({
	key: "verify-lead-intake",
	limit: 2,
	now: 1,
});
assert.equal(limitedInProcess?.code, "lead.rate_limited");

const routeSource = readFileSync("src/app/api/public/leads/route.ts", "utf8");
assert.equal(routeSource.includes("submitPublicLead"), true);
assert.equal(routeSource.includes("getTrustedClientAddress"), true);
assert.equal(routeSource.includes("x-forwarded-for"), false);
assert.equal(
	getTrustedClientAddress(
		new Request("https://example.test", {
			headers: {
				"x-forwarded-for": "198.51.100.99",
				"x-real-ip": "203.0.113.7",
			},
		}),
	),
	"203.0.113.7",
);
assert.equal(
	getTrustedClientAddress(
		new Request("https://example.test", {
			headers: { "x-forwarded-for": "198.51.100.99" },
		}),
	),
	"untrusted",
);
const boundary = JSON.parse(readFileSync("config/raw-rest-boundary.json", "utf8"));
assert.equal(
	boundary.allowedRouteFiles.includes("src/app/api/public/leads/route.ts"),
	true,
);
assert.equal(boundary.anonymousDenyCollections.includes("leads"), true);

const invalidPhone = prepareLeadIntake({ ...validPayload, phone: "abc123" });
assert.equal(invalidPhone.accepted, false);
assert.equal(invalidPhone.code, "lead.invalid_phone");
assertNoRawPii(invalidPhone.safeDiagnostics);

const honeypot = prepareLeadIntake({ ...validPayload, honeypot: "bot-value" });
assert.equal(honeypot.accepted, false);
assert.equal(honeypot.code, "lead.honeypot");
assertNoRawPii(honeypot.safeDiagnostics);

const tooFast = prepareLeadIntake({
	...validPayload,
	renderedAt: "2026-09-16T11:59:59.000Z",
	submittedAt: "2026-09-16T12:00:00.000Z",
});
assert.equal(tooFast.accepted, false);
assert.equal(tooFast.code, "lead.fill_time_invalid");

const consentMissing = prepareLeadIntake({
	...validPayload,
	consentAccepted: false,
});
assert.equal(consentMissing.accepted, false);
assert.equal(consentMissing.code, "lead.invalid_payload");

const limited = evaluateLeadRateLimit({ windowHits: 10, limit: 10 });
assert.equal(limited?.accepted, false);
assert.equal(limited?.status, 429);
assert.equal(limited?.code, "lead.rate_limited");
assertNoRawPii(limited.safeDiagnostics);

console.log("verify-lead-intake: ok");

function assertNoRawPii(value) {
	const serialized = JSON.stringify(value);
	for (const pii of [
		"Иван",
		"Петров",
		"916",
		"123-45-67",
		"ivan@example.test",
	]) {
		assert.equal(
			serialized.includes(pii),
			false,
			`diagnostics leaked PII: ${pii}`,
		);
	}
}
