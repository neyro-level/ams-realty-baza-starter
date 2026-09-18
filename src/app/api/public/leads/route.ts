import { NextResponse, type NextRequest } from "next/server";
import { submitPublicLead } from "../../../../core/data-access/public/leads.ts";

export const runtime = "nodejs";

function clientKey(request: NextRequest): string {
	return (
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip") ||
		"local"
	);
}

export async function POST(request: NextRequest) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ accepted: false, code: "lead.invalid_payload" },
			{ status: 400 },
		);
	}

	const result = await submitPublicLead({
		body,
		rateLimitKey: clientKey(request),
	});

	if (!result.accepted) {
		return NextResponse.json(
			{ accepted: false, code: result.code },
			{ status: result.status },
		);
	}

	return NextResponse.json({
		accepted: true,
		reused: result.reused,
	});
}
