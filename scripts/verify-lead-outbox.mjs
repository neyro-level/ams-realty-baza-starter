import assert from "node:assert/strict";
import {
	accelerateLeadDeliveryJobs,
	commitLeadOutbox,
	planRecoverableLeadDeliveryJobs,
	prepareLeadIntake,
} from "../src/core/leads/index.ts";

const intake = prepareLeadIntake({
	name: "Иван Петров",
	phone: "8 (916) 123-45-67",
	formKind: "consultation",
	sourcePage: "/kontakty",
	consentAccepted: true,
	consentVersion: "privacy-2026-09",
	consentedAt: "2026-09-16T12:00:00.000Z",
	honeypot: "",
	renderedAt: "2026-09-16T11:59:50.000Z",
	submittedAt: "2026-09-16T12:00:00.000Z",
	idempotencyKey: "client-generated-idempotency-key",
});
assert.equal(intake.accepted, true);

const repository = createRepository();
const channels = [
	{ id: "max", kind: "messenger", enabled: true },
	{ id: "crm-main", kind: "crm", enabled: true },
	{ id: "disabled-channel", kind: "crm", enabled: false },
];

const committed = await commitLeadOutbox({
	intake,
	channels,
	repository,
	nowIso: "2026-09-16T12:00:00.000Z",
});
assert.equal(repository.transactions, 1);
assert.equal(committed.reusedExistingLead, false);
assert.equal(committed.lead.id, "lead-1");
assert.equal(committed.deliveries.length, 2);
assert.deepEqual(
	committed.deliveries.map((delivery) => delivery.channelId).sort(),
	["crm-main", "max"],
);
assert.equal(
	repository.externalCalls,
	0,
	"Outbox commit must not call external channels.",
);

const repeated = await commitLeadOutbox({
	intake,
	channels,
	repository,
	nowIso: "2026-09-16T12:05:00.000Z",
});
assert.equal(repeated.reusedExistingLead, true);
assert.equal(repository.leads.length, 1);
assert.equal(repository.deliveries.length, 2);

const recoveryPlan = await planRecoverableLeadDeliveryJobs(
	repository,
	"2026-09-16T12:10:00.000Z",
);
assert.equal(recoveryPlan.length, 2);
assert.deepEqual(recoveryPlan[0], {
	deliveryId: "delivery-1",
	task: "deliverLead",
	queue: "lead-deliveries",
	input: { leadDeliveryId: "delivery-1" },
});

repository.deliveries[0].jobId = "queued-job-1";
const afterEnqueueRecoveryPlan = await planRecoverableLeadDeliveryJobs(
	repository,
	"2026-09-16T12:10:00.000Z",
);
assert.equal(afterEnqueueRecoveryPlan.length, 1);
assert.equal(afterEnqueueRecoveryPlan[0].deliveryId, "delivery-2");

let enqueueCalls = 0;
await accelerateLeadDeliveryJobs({
	repository,
	nowIso: "2026-09-16T12:10:00.000Z",
	enqueue: async () => {
		enqueueCalls += 1;
		throw new Error("enqueue unavailable");
	},
});
assert.equal(enqueueCalls, 1);
assert.equal(repository.leads.length, 1, "Enqueue failure must not roll back the lead.");

console.log("verify-lead-outbox: ok");

function createRepository() {
	const state = {
		leads: [],
		deliveries: [],
		transactions: 0,
		externalCalls: 0,
		async transaction(operation) {
			this.transactions += 1;
			const leadSnapshot = [...this.leads];
			const deliverySnapshot = [...this.deliveries];
			try {
				return await operation({
					createLead: async (input) => {
						const record = { ...input, id: `lead-${this.leads.length + 1}` };
						this.leads.push(record);
						return record;
					},
					createLeadDelivery: async (input) => {
						const record = {
							...input,
							id: `delivery-${this.deliveries.length + 1}`,
						};
						this.deliveries.push(record);
						return record;
					},
				});
			} catch (error) {
				this.leads = leadSnapshot;
				this.deliveries = deliverySnapshot;
				throw error;
			}
		},
		async findLeadByIdempotencyKey(idempotencyKey) {
			return this.leads.find((lead) => lead.idempotencyKey === idempotencyKey);
		},
		async findLeadDeliveries(leadId) {
			return this.deliveries.filter((delivery) => delivery.lead === leadId);
		},
		async findPendingDeliveriesWithoutJob(nowIso) {
			return this.deliveries.filter(
				(delivery) =>
					delivery.status === "pending" &&
					!delivery.jobId &&
					new Date(delivery.nextAttemptAt) <= new Date(nowIso),
			);
		},
	};
	return state;
}
