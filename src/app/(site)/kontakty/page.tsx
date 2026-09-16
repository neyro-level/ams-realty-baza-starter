import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";
export function generateMetadata() {
	return generateFixtureMetadata("kontakty");
}
export default function Page() {
	return <FixtureMarketingRoute slug="kontakty" />;
}
