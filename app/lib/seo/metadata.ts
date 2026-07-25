import type { Metadata } from "next";

import { siteConfig } from "./config";
import { pageSeo, type PageSeoPath } from "./pages";

/**
 * Build per-page metadata that inherits the root title template
 * ("<title> — AfnoUI"), sets a page-specific description, keywords, and a
 * canonical + Open Graph URL. Use from a route's `layout.tsx` (a server
 * component) so it works even when the page itself is a client component.
 */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string; // e.g. "/form-builder"
  keywords?: readonly string[];
}): Metadata {
  const fullTitle = `${opts.title} — ${siteConfig.name}`;
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords ? [...opts.keywords] : undefined,
    alternates: { canonical: opts.path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: fullTitle,
      description: opts.description,
      url: `${siteConfig.url}${opts.path}`,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: opts.description,
    },
  };
}

/**
 * Metadata for a known route, sourced from the central `pageSeo` map in
 * pages.ts — so a route's `layout.tsx` is a single line:
 *   export const metadata = routeMeta("/form-builder");
 */
export function routeMeta(path: PageSeoPath): Metadata {
  const seo = pageSeo[path];
  return pageMeta({ ...seo, path });
}
