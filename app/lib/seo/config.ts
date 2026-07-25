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
  // Search-engine site verification. Paste the codes as env vars (or inline the
  // strings here). Each renders its <meta> tag only when set — see
  // docs/SEO_CHECKLIST.md for where to get them.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ?? "",
  },
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
