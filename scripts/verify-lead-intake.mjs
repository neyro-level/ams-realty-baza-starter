import assert from "node:assert/strict";
import {
	evaluateLeadRateLimit,
	normalizePhoneToE164,
	prepareLeadIntake,
} from "../src/core/leads/index.ts";

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
