import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";
export function generateMetadata() {
	return generateFixtureMetadata("politika-konfidencialnosti");
}
export default function Page() {
	return <FixtureMarketingRoute slug="politika-konfidencialnosti" />;
}
