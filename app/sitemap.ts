import type { MetadataRoute } from "next";

import { siteConfig } from "./lib/seo";

// Primary application routes (under app/(pages)/).
const routes = [
  "",
  "/form-builder",
  // "/ui-builder",  // not complete yet — excluded from sitemap
  "/table-builder",
  "/kanban-builder",
  "/tree-builder",
  "/schema-engine",
  "/lab",
  "/forms",
  "/tables",
  "/kanban",
  "/trees",
  "/charts",
  "/dnd",
  // "/dashboard",   // not complete yet — excluded from sitemap
  "/components",
] as const;

// Individual component preview pages under /components/*.
const componentSlugs = [
  "accordion",
  "alert",
  "alert-dialog",
  "async-fields",
  "badge",
  "breadcrumb",
  "button",
  "card",
  "carousel",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "composite-input",
  "dialog",
  "dropdown",
  "form",
  "infinite-fields",
  "input",
  "menubar",
  "navigation-menu",
  "popover",
  "progress",
  "radio",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "slider",
  "switch",
  "tab",
  "toggle",
  "tooltip",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const primary: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  const components: MetadataRoute.Sitemap = componentSlugs.map((slug) => ({
    url: `${siteConfig.url}/components/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...primary, ...components];
}
