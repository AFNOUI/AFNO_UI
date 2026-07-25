import type { MetadataRoute } from "next";

import { siteConfig } from "./lib/seo";

/**
 * robots.txt — explicitly welcomes both traditional search crawlers and the
 * AI-search / LLM crawlers that increasingly drive discovery (ChatGPT,
 * Perplexity, Claude, Gemini, Apple, Amazon, etc.). Allowing these bots lets
 * AfnoUI be cited/surfaced inside AI chat answers.
 */
const aiCrawlers = [
  "GPTBot", // OpenAI — training + ChatGPT browsing
  "OAI-SearchBot", // OpenAI — ChatGPT search index
  "ChatGPT-User", // OpenAI — live user browsing
  "PerplexityBot", // Perplexity index
  "Perplexity-User", // Perplexity live browsing
  "ClaudeBot", // Anthropic — Claude
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended", // Google Gemini / AI Overviews
  "Applebot-Extended", // Apple Intelligence
  "Amazonbot",
  "cohere-ai",
  "Bytespider",
  "DuckAssistBot",
  "meta-externalagent", // Meta AI
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // All standard crawlers: full access.
      { userAgent: "*", allow: "/" },
      // AI crawlers: full access (opt-in to being cited by AI search).
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
