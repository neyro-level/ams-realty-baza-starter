import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";

export const dynamic = "force-dynamic";

export function generateMetadata() {
	return generateFixtureMetadata("politika-konfidencialnosti");
}
export default function Page() {
	return <FixtureMarketingRoute slug="politika-konfidencialnosti" />;
}
