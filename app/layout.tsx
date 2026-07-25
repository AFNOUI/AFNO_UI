import type { Metadata, Viewport } from "next";

import "./globals.css";

import { buildRootJsonLd, siteConfig } from "./lib/seo";
import { QueryProvider } from "./providers/QueryProvider";
import { RtlLayoutProvider } from "./providers/RtlLayoutProvide";
import { I18nProviderWrapper } from "./providers/I18nextProvider";
import { RootThemeProvider } from "./providers/RootThemeProvider";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    // Every child page renders as "<Page> — AfnoUI".
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.creator, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    // OG image is auto-wired from app/opengraph-image.tsx (file convention).
  },
  twitter: {
    // Card metadata is still read by many link-preview systems even without an
    // X/Twitter account. Image is auto-wired from app/opengraph-image.tsx.
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
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
  // Search-engine ownership verification — each renders only when its env var
  // is set (see docs/SEO_CHECKLIST.md).
  verification: {
    google: siteConfig.verification.google || undefined,
    yandex: siteConfig.verification.yandex || undefined,
    other: siteConfig.verification.bing
      ? { "msvalidate.01": siteConfig.verification.bing }
      : undefined,
  },
  // icons (app/icon.tsx, app/apple-icon.tsx) and the web manifest
  // (app/manifest.ts) are auto-wired by Next's file conventions.
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

// JSON-LD structured data (Organization, WebSite, SoftwareApplication,
// ItemList, HowTo install steps, FAQPage) — helps Google rich results and gives
// AI search engines (ChatGPT, Perplexity, Gemini, Claude) machine-readable
// facts. Built from app/lib/seo so all content stays in one place.
const jsonLd = buildRootJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // JSON-LD must be a raw script tag; content is static and trusted.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <QueryProvider>
          <RootThemeProvider>
            <TooltipProvider>
              <RtlLayoutProvider>
                <Toaster />
                <Sonner />
                <I18nProviderWrapper>
                  {children}
                </I18nProviderWrapper>
              </RtlLayoutProvider>
            </TooltipProvider>
          </RootThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
