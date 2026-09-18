import {
	MarketingRoute,
	generateMarketingMetadata,
} from "../_lib/marketing-route";

export const dynamic = "force-dynamic";

export function generateMetadata() {
	return generateMarketingMetadata("ipoteka");
}
export default function Page() {
	return <MarketingRoute slug="ipoteka" />;
}
