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

import { siteMetadata } from "./metadata";
import { localBusinessSchema } from "./schema";

export const metadata: Metadata = siteMetadata;

import { HashRedirect } from "../components/HashRedirect";
import { MarqueeBanner } from "../components/MarqueeBanner";
// ... imports

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Google Search Console */}
                <meta name="google-site-verification" content="GSV-PLACEHOLDER" />

                {/* Google Analytics */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-KZX44FG5R2"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'G-KZX44FG5R2');
                        `
                    }}
                />

                {/* Schema Markup */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
                />
            </head>
            <body className={inter.className}>
                <Providers>
                    <HashRedirect />
                    <MarqueeBanner />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
