import type { ReactNode } from "react";
import { SiteShellView } from "@ams/realtbase-ui";
import { getPublicShell } from "@/core/data-access/public";

export const dynamic = "force-dynamic";

export default async function PublicSiteLayout({
	children,
}: {
	children: ReactNode;
}) {
	const shell = await getPublicShell();
	return (
		<SiteShellView header={shell.header} footer={shell.footer}>
			{children}
		</SiteShellView>
	);
}
