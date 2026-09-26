import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { getPublicShell } from "@/project/data-access/public";
import {
	getProjectIndexingPolicy,
	metadataRobotsForPolicy,
} from "@/project/indexing-policy";
import { getSiteUrl } from "@/project/seo/site";
import { siteConfig } from "@/project/site.config";

import "./globals.css";

const manrope = Manrope({
	display: "swap",
	subsets: ["cyrillic", "latin"],
	variable: "--font-manrope",
});

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
			<body className={manrope.variable}>{children}</body>
		</html>
	);
}
