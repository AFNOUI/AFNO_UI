/**
 * SEO barrel — import everything SEO-related from `@/lib/seo`.
 * Next.js route conventions (sitemap.ts, robots.ts, manifest.ts,
 * opengraph-image.tsx, icon.tsx, apple-icon.tsx, llms.txt/route.ts) must live
 * at the app root, but they all pull their data from this folder.
 */
export { siteConfig, siteProfiles, siteHost, type SiteConfig } from "./config";
export {
  siteFaq,
  siteNav,
  toolGuides,
  siteFeatures,
  siteCommands,
  type ToolGuidePath,
} from "./content";
export { pageMeta, routeMeta } from "./metadata";
export { pageSeo, type PageSeo, type PageSeoPath } from "./pages";
export { buildRootJsonLd, buildToolJsonLd, buildBreadcrumbJsonLd } from "./jsonld";
