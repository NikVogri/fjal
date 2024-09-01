import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const metadataTitle = "Fjal - Quickly Share Files";
const metatadaDescription = "Quickly and securely share a file to another person or device!";
export const metadata: Metadata = {
	title: metadataTitle,
	description: metatadaDescription,
	// metadataBase: new URL(""), TODO: add metadata base
	keywords: [
		"file sharing",
		"share files",
		"upload files",
		"download files",
		"share files between devices",
		"share files between people",
		"temporary file storage",
	],

	other: {
		locale: "en",
		["og:type"]: "website",
		["og:title"]: metadataTitle,
		["og:locale"]: "en",
		["og:site_name"]: metadataTitle,
		["og:description"]: metatadaDescription,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.className} relative`}>
				<div className="blur-3xl z-0 absolute top-0 left-0 h-screen w-full">
					<div
						className="bg-indigo-500/50 w-1/3 h-1/3 absolute top-1/3 left-8 rotate-90"
						style={{
							clipPath:
								"polygon(74% 11%, 64% 10%, 60% 15%, 54% 24%, 52% 35%, 28% 43%, 17% 54%, 9% 64%, 9% 74%, 11% 78%, 18% 84%, 23% 87%, 43% 89%, 52% 91%, 69% 88%, 72% 86%, 68% 73%, 64% 65%, 63% 56%, 67% 54%, 69% 53%, 74% 54%, 78% 53%, 86% 49%, 93% 45%, 99% 32%, 99% 22%, 96% 19%, 89% 9%);",
						}}
					></div>

					<div
						className="bg-indigo-500/50 w-96 h-96 absolute bottom-0 right-8"
						style={{
							clipPath:
								"polygon(13% 16%, 16% 38%, 34% 60%, 43% 73%, 72% 93%, 85% 94%, 96% 85%, 96% 72%, 97% 57%, 77% 53%, 64% 59%, 45% 46%, 49% 38%, 48% 19%, 41% 8%, 27% 5%);",
						}}
					></div>

					<div
						className="bg-indigo-500/50 w-1/3 h-1/3 absolute -top-8 right-64 -rotate-45"
						style={{
							clipPath:
								"polygon(13% 50%, 15% 15%, 15% 0%, 34% 30%, 91% 28%, 100% 56%, 100% 85%, 94% 100%, 85% 100%, 80% 76%, 56% 70%, 33% 84%);",
						}}
					></div>
				</div>

				<main className="h-screen w-full z-10 relative">{children}</main>
			</body>
		</html>
	);
}
