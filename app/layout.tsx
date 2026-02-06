import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

// 📱 Viewport settings for mobile responsiveness
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    title: "CosmoDecorPK | Premium Home Decor",
    description: "Transform your space with CosmoDecorPK - Premium home decor, plants, and lighting in Pakistan.",
};

import { HashRedirect } from "../components/HashRedirect";
// ... imports

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <HashRedirect />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
