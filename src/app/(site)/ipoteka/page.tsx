import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";

export const dynamic = "force-dynamic";

export function generateMetadata() {
	return generateFixtureMetadata("ipoteka");
}
export default function Page() {
	return <FixtureMarketingRoute slug="ipoteka" />;
}
