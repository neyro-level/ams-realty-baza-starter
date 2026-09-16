import {
	FixtureMarketingRoute,
	generateFixtureMetadata,
} from "@/components/fixture/FixtureMarketingRoute";
export function generateMetadata() {
	return generateFixtureMetadata("soglasie-na-obrabotku-personalnyh-dannyh");
}
export default function Page() {
	return (
		<FixtureMarketingRoute slug="soglasie-na-obrabotku-personalnyh-dannyh" />
	);
}
