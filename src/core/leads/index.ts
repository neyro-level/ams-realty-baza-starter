export {
	buildCustomWebhookHeaders,
	buildCustomWebhookLeadPayload,
	type CustomWebhookAcceptanceFailureReason,
	type CustomWebhookAcceptanceResult,
	type CustomWebhookHeaders,
	type CustomWebhookIdempotencyRegistry,
	type CustomWebhookLeadPayload,
	type CustomWebhookTransport,
	type CustomWebhookTransportRequest,
	type CustomWebhookTransportResponse,
	type CustomWebhookVerificationResult,
	classifyCustomWebhookResponse,
	sendCustomWebhookLead,
	serializeCustomWebhookPayload,
	signCustomWebhookBody,
	verifyAndRegisterCustomWebhookRequest,
	verifyCustomWebhookRequest,
} from "./adapters/custom-webhook.ts";
export {
	buildMaxLeadPayload,
	classifyMaxResponse,
	type MaxLeadPayload,
	type MaxTransport,
	type MaxTransportResponse,
	sendMaxLead,
} from "./adapters/max.ts";
export {
	appendAttemptLog,
	claimLeadDeliveryForSending,
	completeLeadDeliveryAttempt,
	type LeadDeliveryStateRecord,
	recoverStaleSendingDelivery,
} from "./delivery-state.ts";
export {
	parseLeadChannelIds,
	resolveEnabledLeadChannels,
	type LeadChannelEnv,
} from "./channels.ts";
export { hitInProcessLeadRateLimit } from "./in-process-rate-limit.ts";
export {
	buildFraudFingerprint,
	buildLeadIdempotencyKey,
	evaluateLeadRateLimit,
	type LeadIntakeRejected,
	type LeadIntakeResult,
	normalizePhoneToE164,
	prepareLeadIntake,
} from "./intake.ts";
export {
	accelerateLeadDeliveryJobs,
	buildLeadDeliveryIdempotencyKey,
	commitLeadOutbox,
	type LeadChannelConfig,
	type LeadDeliveryJobPlan,
	type LeadDeliveryRecord,
	type LeadOutboxRepository,
	type LeadRecord,
	planRecoverableLeadDeliveryJobs,
} from "./outbox.ts";
