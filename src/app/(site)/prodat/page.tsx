import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";
export function generateMetadata() {
	return generateFixtureMetadata("prodat");
}
export default function Page() {
	return <FixtureMarketingRoute slug="prodat" />;
}
