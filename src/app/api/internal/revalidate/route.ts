import { type NextRequest, NextResponse } from "next/server";
import { executeInternalRevalidation } from "../../../../core/cache/internal-route-executor.ts";
import { invalidateCacheTargets } from "../../../../core/cache/invalidator.ts";
import { redactRecord } from "../../../../core/security/redaction.ts";

export const runtime = "nodejs";

const rateWindowMs = 60_000;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitPerMinute(): number {
	const value = Number(process.env.REVALIDATE_RATE_LIMIT_PER_MINUTE ?? 30);
	return Number.isInteger(value) && value > 0 ? value : 30;
}

function clientKey(request: NextRequest): string {
	return (
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip") ||
		"local"
	);
}

function rateLimited(request: NextRequest): boolean {
	const key = clientKey(request);
	const now = Date.now();
	const current = rateBuckets.get(key);
	if (!current || current.resetAt <= now) {
		rateBuckets.set(key, { count: 1, resetAt: now + rateWindowMs });
		return false;
	}
	current.count += 1;
	return current.count > rateLimitPerMinute();
}

export async function POST(request: NextRequest) {
	if (rateLimited(request)) {
		return NextResponse.json({ error: "rate_limited" }, { status: 429 });
	}

	const result = await executeInternalRevalidation({
		expectedSecret: process.env.REVALIDATE_SECRET,
		providedSecret: request.headers.get("x-ams-revalidate-secret"),
		body: await request.json().catch(() => undefined),
		invalidate: invalidateCacheTargets,
	});

	if (result.deniedTargets) {
		console.warn(
			"cache revalidation denied",
			redactRecord({ targets: result.deniedTargets }),
		);
	}

	return NextResponse.json(result.body, { status: result.status });
}
