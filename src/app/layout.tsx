import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://example.test"),
	title: "AMS Realty Baza Starter",
	description: "Базовая платформа AMS для сайтов агентств недвижимости.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="ru">
			<body>{children}</body>
		</html>
	);
}
