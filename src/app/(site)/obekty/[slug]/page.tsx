import { notFound, permanentRedirect } from "next/navigation";
import { resolveLegacyPropertyRoute } from "@/project/routing/legacy-route";

export const dynamic = "force-dynamic";

type LegacyPropertyPageProps = { params: Promise<{ slug: string }> };

export default async function PropertyPage({
	params,
}: LegacyPropertyPageProps) {
	const { slug } = await params;
	const route = await resolveLegacyPropertyRoute(slug);
	if (route.kind === "redirect") permanentRedirect(route.destination);
	notFound();
}
