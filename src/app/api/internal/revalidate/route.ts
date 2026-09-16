import { NextResponse, type NextRequest } from "next/server";
import {
	cacheInvalidationRequestSchema,
	invalidateCacheTargets,
	type CacheTarget,
} from "../../../../core/cache/invalidator.ts";
import { redactRecord } from "../../../../server/security/redaction.ts";

export const runtime = "nodejs";

const allowedPathPrefixes = [
	"/",
	"/nedvizhimost",
	"/obekty",
	"/uslugi",
	"/o-kompanii",
	"/ipoteka",
	"/prodat",
	"/sdat",
	"/kontakty",
] as const;
const allowedTags = new Set(["site", "properties", "property", "media"]);
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

function hasValidSecret(request: NextRequest): boolean {
	const expected = process.env.REVALIDATE_SECRET;
	const actual = request.headers.get("x-ams-revalidate-secret");
	return Boolean(expected && actual && actual === expected);
}

function allowedTarget(target: CacheTarget): boolean {
	if (target.type === "tag") return allowedTags.has(target.tag);
	return allowedPathPrefixes.some(
		(prefix) => target.path === prefix || target.path.startsWith(`${prefix}/`),
	);
}

export async function POST(request: NextRequest) {
	if (rateLimited(request)) {
		return NextResponse.json({ error: "rate_limited" }, { status: 429 });
	}

	if (!hasValidSecret(request)) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}

	const payload = cacheInvalidationRequestSchema.safeParse(await request.json());
	if (!payload.success) {
		return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
	}

	const deniedTargets = payload.data.targets.filter((target) => !allowedTarget(target));
	if (deniedTargets.length > 0) {
		console.warn(
			"cache revalidation denied",
			redactRecord({ targets: deniedTargets, reason: payload.data.reason }),
		);
		return NextResponse.json({ error: "target_not_allowed" }, { status: 403 });
	}

	await invalidateCacheTargets(payload.data.targets);

	return NextResponse.json({
		revalidated: true,
		count: payload.data.targets.length,
	});
}
