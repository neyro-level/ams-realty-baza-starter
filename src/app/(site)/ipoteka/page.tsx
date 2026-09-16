import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";
export function generateMetadata() {
	return generateFixtureMetadata("ipoteka");
}
export default function Page() {
	return <FixtureMarketingRoute slug="ipoteka" />;
}
