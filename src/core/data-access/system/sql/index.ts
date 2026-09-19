import { sql } from "@payloadcms/db-postgres/drizzle";
import type { Payload } from "payload";

/**
 * Approved parameterized SQL for system atomic/bulk operations.
 * Generic query(sql: string) is not exported.
 */
export const systemSqlLayer = "src/core/data-access/system/sql" as const;

export const approvedSystemSqlOperations = {
	claimLeadDeliveryRow: {
		invariant: "Exactly one due pending delivery can transition to sending.",
		reason:
			"Claim, attempt increment, and affected result must be one conditional statement.",
	},
} as const;

type ApprovedSystemSqlOperation = keyof typeof approvedSystemSqlOperations;

type DrizzleExecutor = {
	execute: (query: unknown) => Promise<unknown>;
};

export type ClaimedLeadDeliveryRow = {
	id: string;
	leadId: string;
	channelId: string;
	channelKind: "messenger" | "crm";
	attempts: number;
	idempotencyKey: string;
	jobId?: string;
};

function getDrizzle(payload: Payload): DrizzleExecutor {
	const drizzle = (payload.db as { drizzle?: DrizzleExecutor } | undefined)
		?.drizzle;
	if (!drizzle?.execute) {
		throw new Error("System SQL requires Payload Postgres drizzle.execute.");
	}
	return drizzle;
}

function executeApprovedSystemSql(
	payload: Payload,
	operation: ApprovedSystemSqlOperation,
	query: unknown,
): Promise<unknown> {
	void approvedSystemSqlOperations[operation];
	return getDrizzle(payload).execute(query);
}

function rowsFrom(result: unknown): Array<Record<string, unknown>> {
	if (Array.isArray(result)) {
		return result as Array<Record<string, unknown>>;
	}
	if (result && typeof result === "object" && "rows" in result) {
		const rows = (result as { rows?: unknown }).rows;
		if (Array.isArray(rows)) {
			return rows as Array<Record<string, unknown>>;
		}
	}
	return [];
}

export async function claimLeadDeliveryRow(
	payload: Payload,
	input: { deliveryId: string; nowIso: string },
): Promise<ClaimedLeadDeliveryRow | undefined> {
	const deliveryId = Number(input.deliveryId);
	if (!Number.isInteger(deliveryId) || deliveryId < 1) {
		return undefined;
	}

	const result = await executeApprovedSystemSql(
		payload,
		"claimLeadDeliveryRow",
		sql`
		UPDATE lead_deliveries AS claimed
		SET
			status = 'sending',
			claimed_at = ${input.nowIso}::timestamptz,
			heartbeat_at = ${input.nowIso}::timestamptz,
			attempts = claimed.attempts + 1
		WHERE claimed.id = ${deliveryId}
			AND claimed.status = 'pending'
			AND claimed.next_attempt_at IS NOT NULL
			AND claimed.next_attempt_at <= ${input.nowIso}::timestamptz
		RETURNING
			claimed.id,
			claimed.lead_id,
			claimed.channel_id,
			claimed.channel_kind,
			claimed.attempts,
			claimed.idempotency_key,
			claimed.job_id
	`,
	);
	const row = rowsFrom(result)[0];
	if (!row) {
		return undefined;
	}

	const channelKind = row.channel_kind === "crm" ? "crm" : "messenger";
	return {
		id: String(row.id),
		leadId: String(row.lead_id),
		channelId: String(row.channel_id),
		channelKind,
		attempts: Number(row.attempts) || 0,
		idempotencyKey: String(row.idempotency_key),
		jobId: row.job_id ? String(row.job_id) : undefined,
	};
}
