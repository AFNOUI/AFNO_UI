import { siteCommands, siteConfig, siteFeatures } from "../lib/seo";

/**
 * /llms.txt — the emerging standard that lets AI-search engines (ChatGPT,
 * Perplexity, Claude, Gemini) read a concise, structured summary of the site.
 * Generated from the shared SEO data so the domain, features, and CLI commands
 * stay in one source of truth (app/lib/seo).
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

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

Stack: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Radix UI, Zod, React Hook Form / TanStack Form.
License: Open source (MIT).
Homepage: ${u}
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

## Notes

- You own the source: the CLI writes components into your repo (not a runtime dependency).
- The CLI fetches generated registry JSON from ${u}/registry at install time, so components stay current.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
