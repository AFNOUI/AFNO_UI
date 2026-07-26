import Script from "next/script";

import { siteConfig } from "../lib/seo";

/**
 * Google Analytics 4 loader.
 *
 * Renders the gtag.js scripts only when NEXT_PUBLIC_GA_ID is set (see
 * app/lib/seo/config.ts → siteConfig.analytics.gaId), so local/dev and
 * preview builds without the env var ship zero analytics code.
 *
 * GA4 "Enhanced measurement" tracks page_view on History API changes
 * automatically, so App Router client-side navigations are covered without
 * manual pageview wiring.
 */
export function GoogleAnalytics() {
  const gaId = siteConfig.analytics.gaId;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
