import type { ReactNode } from "react";
import { SiteShell } from "@/components/fixture/SiteShell";
import { getPublicShell } from "@/server/public-gateway";

export const dynamic = "force-dynamic";

export default async function PublicSiteLayout({
	children,
}: {
	children: ReactNode;
}) {
	const shell = await getPublicShell();
	return (
		<SiteShell header={shell.header} footer={shell.footer}>
			{children}
		</SiteShell>
	);
}
