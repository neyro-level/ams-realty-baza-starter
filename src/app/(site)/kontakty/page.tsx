import {
	MarketingRoute,
	generateMarketingMetadata,
} from "../_lib/marketing-route";

export const dynamic = "force-dynamic";

export function generateMetadata() {
	return generateMarketingMetadata("kontakty");
}
export default function Page() {
	return <MarketingRoute slug="kontakty" />;
}
