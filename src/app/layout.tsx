import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { getSiteUrl } from "@/core/seo/site";
import { siteConfig } from "@/project/site.config";

import "./globals.css";

const manrope = Manrope({
	display: "swap",
	subsets: ["cyrillic", "latin"],
	variable: "--font-manrope",
});

export const metadata: Metadata = {
	metadataBase: new URL(getSiteUrl()),
	title: siteConfig.defaultTitle,
	description: siteConfig.defaultDescription,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang={siteConfig.locale}>
			<body className={manrope.variable}>{children}</body>
		</html>
	);
}
