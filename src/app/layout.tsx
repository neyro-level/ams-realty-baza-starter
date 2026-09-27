import type { Metadata } from "next";
import { getPublicShell } from "@/project/data-access/public";
import { projectFont } from "@/project/font.generated";
import {
	getProjectIndexingPolicy,
	metadataRobotsForPolicy,
} from "@/project/indexing-policy";
import { getSiteUrl } from "@/project/seo/site";
import { siteConfig } from "@/project/site.config";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
	const shell = await getPublicShell();
	return {
		metadataBase: new URL(getSiteUrl()),
		title: shell.header.brandName,
		robots: metadataRobotsForPolicy(getProjectIndexingPolicy()),
	};
}

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang={siteConfig.locale}>
			<body className={projectFont.variable}>{children}</body>
		</html>
	);
}
