import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";

export const dynamic = "force-dynamic";

export function generateMetadata() {
	return generateFixtureMetadata("kontakty");
}
export default function Page() {
	return <FixtureMarketingRoute slug="kontakty" />;
}
