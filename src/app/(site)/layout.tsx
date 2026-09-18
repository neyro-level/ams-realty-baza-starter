import type { ReactNode } from "react";
import { StarterSiteFooter, StarterSiteHeader } from "@ams/realtbase-ui";
import { getPublicShell } from "@/core/data-access/public";

export const dynamic = "force-dynamic";

export default async function PublicSiteLayout({
	children,
}: {
	children: ReactNode;
}) {
	const shell = await getPublicShell();
	return (
		<div className="min-h-screen bg-surface-page text-content-strong">
			<StarterSiteHeader header={shell.header} />
			<main>{children}</main>
			<StarterSiteFooter footer={shell.footer} />
		</div>
	);
}
