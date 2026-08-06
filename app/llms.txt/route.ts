import { siteCommands, siteConfig, siteFaq, siteFeatures } from "../lib/seo";

/**
 * /llms.txt — the emerging standard that lets AI-search engines (ChatGPT,
 * Perplexity, Claude, Gemini) read a concise, structured summary of the site.
 * Generated from the shared SEO data so the domain, features, and CLI commands
 * stay in one source of truth (app/lib/seo).
 *
 * This file is the *index*. `/llms-full.txt` carries the expanded corpus
 * (per-builder guides and every FAQ answer) for agents that want depth.
 */
export const dynamic = "force-static";

export function GET() {
  const u = siteConfig.url;

  const features = siteFeatures
    .map((f) => `- ${f.name} — ${f.description} ${u}${f.path}`)
    .join("\n");

  const commands = siteCommands
    .map((c) => `- \`${c.run}\` — ${c.summary}`)
    .join("\n");

  // A short answer set inline, so an agent that fetches only this file can
  // still answer the most common questions without a second request.
  const faq = siteFaq.map((item) => `### ${item.q}\n${item.a}`).join("\n\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

Stack: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Radix UI, Zod, React Hook Form / TanStack Form.
License: Open source (MIT).
Homepage: ${u}
Full corpus for AI agents: ${u}/llms-full.txt
Registry (wire format the CLI fetches): ${u}/registry
CLI package (npm): afnoui — ${siteConfig.npm}
Source: ${siteConfig.github}
Reddit: ${siteConfig.social.reddit}
Instagram: ${siteConfig.social.instagram}

## CLI commands

${commands}

Works with npm, pnpm, yarn, and bun (\`npx\` / \`pnpm dlx\` / \`yarn dlx\` / \`bunx\`).

## Features

${features}

## FAQ

${faq}

## Notes

- You own the source: the CLI writes components into your repo (not a runtime dependency).
- The CLI fetches generated registry JSON from ${u}/registry at install time, so components stay current.
- Every builder exports its complete state as one JSON document and imports it back exactly — configuration, data, and custom renderers — so a build can be saved in a repo or a ticket rather than a server.
- Every builder runs a Build health check that names configuration mistakes and their fix before you export.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
