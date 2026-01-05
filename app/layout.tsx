import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";
import { seoConfig, jsonLd } from "@/lib/seo-config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.openGraph.url),
  title: {
    default: seoConfig.title,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.description,
  keywords: seoConfig.keywords,
  authors: seoConfig.authors,
  creator: seoConfig.creator,
  publisher: seoConfig.publisher,
  robots: seoConfig.robots,
  icons: seoConfig.icons,
  manifest: seoConfig.manifest,
  openGraph: {
    type: "website",
    locale: seoConfig.openGraph.locale,
    url: seoConfig.openGraph.url,
    siteName: seoConfig.openGraph.siteName,
    title: seoConfig.openGraph.title,
    description: seoConfig.openGraph.description,
    images: seoConfig.openGraph.images,
  },
  twitter: {
    card: "summary_large_image",
    site: seoConfig.twitter.site,
    creator: seoConfig.twitter.creator,
    title: seoConfig.twitter.title,
    description: seoConfig.twitter.description,
    images: seoConfig.twitter.images,
  },
  category: seoConfig.category,
  other: {
    "theme-color": seoConfig.themeColor,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
