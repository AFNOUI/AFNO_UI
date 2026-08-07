import { pageSeo } from "./pages";
import { siteConfig, siteProfiles } from "./config";
import {
  siteFaq,
  siteNav,
  toolGuides,
  siteFeatures,
  siteCommands,
  type ToolGuidePath,
} from "./content";

/**
 * Root JSON-LD @graph for the homepage. Emits Organization, WebSite, a detailed
 * SoftwareApplication (with featureList), an ItemList of tools, a HowTo install
 * guide (the CLI commands), and an FAQPage — the structured data Google rich
 * results and AI answer engines (ChatGPT, Perplexity, Claude, Gemini) read.
 */
export function buildRootJsonLd() {
  const u = siteConfig.url;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${u}/#organization`,
        name: siteConfig.name,
        url: u,
        logo: `${u}/icon`,
        sameAs: siteProfiles,
      },
      {
        "@type": "WebSite",
        "@id": `${u}/#website`,
        url: u,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": `${u}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": `${u}/#software`,
        name: siteConfig.name,
        alternateName: "Afno UI",
        description: siteConfig.description,
        url: u,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "React UI component library",
        operatingSystem: "Web, Node.js",
        browserRequirements: "Requires JavaScript. Node.js for the afnoui CLI.",
        softwareRequirements: "Next.js 15, React 19, Tailwind CSS v4",
        programmingLanguage: "TypeScript",
        keywords: siteConfig.keywords.join(", "),
        publisher: { "@id": `${u}/#organization` },
        author: { "@id": `${u}/#organization` },
        image: `${u}/opengraph-image`,
        screenshot: `${u}/opengraph-image`,
        softwareHelp: `${u}/docs`,
        installUrl: siteConfig.npm,
        license: "https://opensource.org/licenses/MIT",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: siteFeatures.map((f) => `${f.name}: ${f.description}`),
      },
      // SiteNavigationElement — signals the primary sections to Google (helps
      // sitelink eligibility) and to AI engines.
      ...siteNav.map((n) => ({
        "@type": "SiteNavigationElement",
        "@id": `${u}${n.path}/#nav`,
        name: n.name,
        description: n.blurb,
        url: `${u}${n.path}`,
      })),
      {
        "@type": "ItemList",
        "@id": `${u}/#features`,
        name: "AfnoUI tools and builders",
        itemListElement: siteFeatures.map((f, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: f.name,
          description: f.description,
          url: `${u}${f.path}`,
        })),
      },
      {
        "@type": "HowTo",
        "@id": `${u}/#install`,
        name: "How to install and use AfnoUI",
        description:
          "Install AfnoUI components into your React project with the afnoui CLI.",
        totalTime: "PT2M",
        step: siteCommands.map((c, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: c.run,
          text: c.summary,
          url: `${u}#installation`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${u}/#faq`,
        mainEntity: siteFaq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

/**
 * BreadcrumbList for a sub-page.
 *
 * The site already renders visual breadcrumbs via `<PageBreadcrumb />`, but
 * Google needs the structured-data counterpart to show the breadcrumb trail in
 * results instead of a bare URL. Mirrors what the user sees: Home › <Page>.
 */
export function buildBreadcrumbJsonLd(path: string, name: string) {
  return { "@context": "https://schema.org", ...breadcrumbNode(path, name) };
}

/** Bare BreadcrumbList node — `@context` belongs to the enclosing document. */
function breadcrumbNode(path: string, name: string) {
  const u = siteConfig.url;
  return {
    "@type": "BreadcrumbList",
    "@id": `${u}${path}/#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: u },
      { "@type": "ListItem", position: 2, name, item: `${u}${path}` },
    ],
  };
}

/**
 * Page-level `@graph` for one builder route.
 *
 * Until now every page inherited only the homepage graph, so the individual
 * tools had no structured data of their own to rank or be quoted on. This emits
 * a per-tool `SoftwareApplication` (part of the parent product), the `HowTo`
 * for using that specific builder, its own `FAQPage`, and the `BreadcrumbList`
 * — the four types that actually earn rich results for a tool page.
 */
export function buildToolJsonLd(path: ToolGuidePath) {
  const u = siteConfig.url;
  const guide = toolGuides[path];
  const seo = pageSeo[path as keyof typeof pageSeo];
  const url = `${u}${path}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": `${url}/#software`,
        name: `${seo.title} — ${siteConfig.name}`,
        description: seo.description,
        url,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript.",
        programmingLanguage: "TypeScript",
        keywords: seo.keywords.join(", "),
        isPartOf: { "@id": `${u}/#software` },
        publisher: { "@id": `${u}/#organization` },
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        "@id": `${url}/#howto`,
        name: guide.howToName,
        description: seo.description,
        totalTime: "PT5M",
        step: guide.steps.map((text, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: `Step ${i + 1}`,
          text,
          url,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: guide.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      breadcrumbNode(path, seo.title),
    ],
  };
}
