/**
 * Site configuration — the SINGLE SOURCE OF TRUTH for the frontend's domain,
 * branding, social profiles, and SEO defaults. Every SEO surface (metadata,
 * sitemap, robots, manifest, JSON-LD, /llms.txt) derives from this file.
 *
 * Change `url` (or set NEXT_PUBLIC_SITE_URL) to repoint the whole app.
 * Production canonical host is https://afnoui.com.
 */
export const siteConfig = {
  name: "AfnoUI",
  shortName: "AfnoUI",
  title:
    "AfnoUI — Visual React Builder for Forms, Tables, Kanban, Trees, Charts & DnD",
  description:
    "AfnoUI is the open-source React + TypeScript builder platform — drag-and-drop form, table, kanban, tree, and chart builders plus drag-and-drop utilities, 30+ accessible Radix UI + Tailwind CSS v4 components, and a live theme lab. Install with one command: npx afnoui add.",
  // Canonical production origin (no trailing slash).
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://afnoui.com").replace(
    /\/$/,
    "",
  ),
  ogImage: "/opengraph-image",
  creator: "AfnoUI",
  publisher: "AfnoUI",
  locale: "en_US",
  github: "https://github.com/AFNOUI/AFNO_UI",
  npm: "https://www.npmjs.com/package/afnoui",
  // Social profiles (no Twitter/X currently).
  social: {
    reddit: "https://reddit.com/user/AfnoUI",
    instagram: "https://instagram.com/afno.ui",
  },
  // Google Analytics 4 Measurement ID (e.g. "G-XXXXXXXXXX"). Set
  // NEXT_PUBLIC_GA_ID to enable; the analytics script renders only when set.
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID ?? "G-RKX60W5B2Q",
  },
  // Search-engine site verification. Paste the codes as env vars (or inline the
  // strings here). Each renders its <meta> tag only when set — see
  // docs/SEO_CHECKLIST.md for where to get them.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ?? "",
  },
  // Brand aliases for JSON-LD `alternateName`. Order matters: the solid
  // one-word token comes FIRST because it is the query we want Google to bind
  // to this entity. Google tokenizes the camelCase `AfnoUI` into "afno" + "ui",
  // so the split spelling already ranks; the solid form does not, and until
  // "afnoui" is a recognized entity Google spell-corrects it to afni/afnuu.
  // Only the SOLID one-word spellings — this is the query we need to win.
  //
  // The split form ("Afno UI") is deliberately absent. Google tokenizes the
  // camelCase `AfnoUI` in our visible copy into "afno" + "ui", so that query
  // already ranks on its own and needs no help; listing it here would only
  // spend alias slots reinforcing the spelling we do NOT want to be found by.
  // Generic tokens ("UI"/"ui") are excluded too: a brand alias must be a name,
  // and claiming a category word in markup reads as keyword-stuffing under
  // Google's structured-data policies.
  brandAliases: ["afnoui", "AfnoUI", "AFNOUI", "Afnoui"],
  // Broad keyword set spanning React UI-library and AI-search intents.
  keywords: [
    "AfnoUI",
    "afnoui",
    "React component library",
    "React UI library",
    "shadcn alternative",
    "Radix UI components",
    "Tailwind CSS v4 components",
    "visual form builder React",
    "drag and drop form builder",
    "React form builder TypeScript",
    "UI builder React",
    "table builder React",
    "kanban builder React",
    "tree builder React",
    "React chart library",
    "accessible React components",
    "copy paste React components",
    "CLI component installer",
    "Next.js 15 components",
    "React 19 UI kit",
    "TypeScript design system",
    "Zod form validation",
    "React Hook Form components",
    "TanStack Form components",
  ],
} as const;

export type SiteConfig = typeof siteConfig;

/** All social/profile URLs as a flat list — used for JSON-LD `sameAs`. */
export const siteProfiles: string[] = [
  siteConfig.github,
  siteConfig.npm,
  siteConfig.social.reddit,
  siteConfig.social.instagram,
];

/** Bare host (no protocol / trailing slash), e.g. "afnoui.com" — for display. */
export const siteHost = siteConfig.url
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");
