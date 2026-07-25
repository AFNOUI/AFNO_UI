import { siteConfig, siteProfiles } from "./config";
import { siteCommands, siteFaq, siteFeatures, siteNav } from "./content";

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
