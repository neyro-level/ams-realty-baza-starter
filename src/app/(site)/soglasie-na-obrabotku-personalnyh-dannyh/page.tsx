import {
	MarketingRoute,
	generateMarketingMetadata,
} from "../_lib/marketing-route";

export const dynamic = "force-dynamic";

export function generateMetadata() {
	return generateMarketingMetadata("soglasie-na-obrabotku-personalnyh-dannyh");
}
export default function Page() {
	return <MarketingRoute slug="soglasie-na-obrabotku-personalnyh-dannyh" />;
}
