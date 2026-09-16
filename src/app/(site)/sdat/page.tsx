import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";
export function generateMetadata() {
	return generateFixtureMetadata("sdat");
}
export default function Page() {
	return <FixtureMarketingRoute slug="sdat" />;
}
