import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";
export function generateMetadata() {
	return generateFixtureMetadata("uslugi");
}
export default function Page() {
	return <FixtureMarketingRoute slug="uslugi" />;
}
