import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
	display: "swap",
	subsets: ["cyrillic", "latin"],
	variable: "--font-manrope",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://example.test"),
	title: "AMS Realty Baza Starter",
	description: "Базовая платформа AMS для сайтов агентств недвижимости.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="ru">
			<body className={manrope.variable}>{children}</body>
		</html>
	);
}
