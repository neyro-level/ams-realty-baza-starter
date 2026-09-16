import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";

export const dynamic = "force-dynamic";

export function generateMetadata() {
	return generateFixtureMetadata("prodat");
}
export default function Page() {
	return <FixtureMarketingRoute slug="prodat" />;
}
