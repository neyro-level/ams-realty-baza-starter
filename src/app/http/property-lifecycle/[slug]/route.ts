import { NextResponse } from "next/server";
import { createPropertyGoneResponse } from "@/server/http/property-gone-response";
import { getPublicProperty } from "@/server/public-gateway";
import { absoluteUrl } from "@/server/seo/site";

export const dynamic = "force-dynamic";

export async function GET(
	_request: Request,
	context: { params: Promise<{ slug: string }> },
) {
	const { slug } = await context.params;
	const state = await getPublicProperty(slug);
	if (!state) {
		return new NextResponse("Not Found", {
			status: 404,
			headers: {
				"X-Robots-Tag": "noindex, follow",
				"Cache-Control": "private, no-store",
			},
		});
	}

	if (!("property" in state)) {
		if (state.lifecycle.kind === "redirect") {
			return NextResponse.redirect(
				absoluteUrl(state.lifecycle.destination),
				308,
			);
		}

		return createPropertyGoneResponse(slug);
	}

	return new NextResponse(null, { status: 204 });
}
