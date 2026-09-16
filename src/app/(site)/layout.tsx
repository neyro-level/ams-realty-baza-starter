import type { ReactNode } from "react";
import { SiteShell } from "@/components/fixture/SiteShell";
import { getFixtureShell } from "@/fixture/provider";

export default async function PublicSiteLayout({
	children,
}: {
	children: ReactNode;
}) {
	const shell = await getFixtureShell();
	return (
		<SiteShell header={shell.header} footer={shell.footer}>
			{children}
		</SiteShell>
	);
}
