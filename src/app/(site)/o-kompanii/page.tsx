import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";
export function generateMetadata() {
	return generateFixtureMetadata("o-kompanii");
}
export default function Page() {
	return <FixtureMarketingRoute slug="o-kompanii" />;
}
