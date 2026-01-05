export const seoConfig = {
  title: "Trace - Solana Tax Tracker",
  titleTemplate: "%s | Trace",
  description: "Track every Solana transaction automatically. Generate tax reports in seconds. FIFO/LIFO support, multi-wallet tracking, and accountant-ready exports.",
  canonical: "https://trace.tax", // Change to your domain
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://trace.tax",
    siteName: "Trace",
    title: "Trace - Solana Tax Tracker",
    description: "Track every Solana transaction automatically. Generate tax reports in seconds.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Trace - Solana Tax Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trace_tax", // Change to your Twitter
    creator: "@trace_tax",
    title: "Trace - Solana Tax Tracker",
    description: "Track every Solana transaction automatically. Generate tax reports in seconds.",
    images: ["/opengraph-image.png"],
  },
  keywords: [
    "solana tax",
    "crypto tax",
    "solana tracker",
    "blockchain tax",
    "crypto tax calculator",
    "solana tax calculator",
    "DeFi tax",
    "NFT tax",
    "tax report",
    "FIFO",
    "LIFO",
    "crypto accounting",
    "solana transactions",
  ],
  authors: [
    {
      name: "Trace",
      url: "https://trace.tax",
    },
  ],
  creator: "Trace",
  publisher: "Trace",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#F97316", // Orange color for primary
  category: "finance",
};

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Trace",
  description: "Track every Solana transaction automatically. Generate tax reports in seconds.",
  url: "https://trace.tax",
  applicationCategory: "FinanceApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  featureList: [
    "Automatic transaction tracking",
    "Tax report generation",
    "FIFO/LIFO cost basis",
    "Multi-wallet support",
    "CSV export",
  ],
};
