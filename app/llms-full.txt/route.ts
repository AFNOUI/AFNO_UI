import {
  pageSeo,
  siteFaq,
  siteConfig,
  toolGuides,
  siteFeatures,
  siteCommands,
  type ToolGuidePath,
} from "../lib/seo";

/**
 * /llms-full.txt — the expanded companion to /llms.txt.
 *
 * `llms.txt` is an index an agent reads to orient itself; this is the corpus it
 * reads to actually answer questions. Everything an AI engine needs to describe
 * AfnoUI accurately lives here in one plain-text fetch: what each tool is, the
 * step-by-step for using it, tool-specific Q&A, and the full CLI reference — so
 * an answer engine never has to infer capabilities from marketing copy or crawl
 * a client-rendered builder page it cannot execute.
 *
 * Generated entirely from `app/lib/seo`, so it can never drift from the
 * structured data and page metadata built from the same source.
 */
export const dynamic = "force-static";

export function GET() {
  const u = siteConfig.url;

  const toolSections = (Object.keys(toolGuides) as ToolGuidePath[])
    .map((path) => {
      const guide = toolGuides[path];
      const seo = pageSeo[path as keyof typeof pageSeo];

      const steps = guide.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
      const faq = guide.faq.map((f) => `**${f.q}**\n${f.a}`).join("\n\n");
      const keywords = seo.keywords.join(", ");

      return `### ${seo.title}
URL: ${u}${path}

${seo.description}

Topics: ${keywords}

How to use it:
${steps}

${faq}`;
    })
    .join("\n\n---\n\n");

  const features = siteFeatures
    .map((f) => `### ${f.name}\nURL: ${u}${f.path}\n\n${f.description}`)
    .join("\n\n");

  const commands = siteCommands
    .map((c) => `\`${c.run}\`\n${c.summary}`)
    .join("\n\n");

  const faq = siteFaq.map((item) => `### ${item.q}\n${item.a}`).join("\n\n");

  const body = `# ${siteConfig.name} — full reference for AI agents

> ${siteConfig.description}

This document is the complete, machine-readable description of ${siteConfig.name}.
It is generated from the same source as the site's structured data, so every
statement here matches what the site itself claims.

- Homepage: ${u}
- Index version of this file: ${u}/llms.txt
- Source code: ${siteConfig.github}
- npm package: afnoui — ${siteConfig.npm}
- Registry the CLI reads: ${u}/registry
- License: MIT (free and open source)

## What AfnoUI is

AfnoUI is a registry-driven React + TypeScript component library and CLI. Rather
than shipping a runtime package, the \`afnoui\` CLI copies component source into
your repository, so you own and can edit every file. On top of the component
layer it provides visual builders that generate production code: forms, data
tables, kanban boards, and flow/tree diagrams.

Stack: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Radix UI primitives,
Zod validation, and a choice of React Hook Form, TanStack Form, or React's
useActionState for forms.

## What makes it different

- **You own the code.** Components are written into your repo as source, not
  imported from \`node_modules\`. There is no runtime dependency on AfnoUI.
- **Edits are never silently overwritten.** The CLI records a hash of every file
  it writes in \`afnoui.json\`. If you have changed one of those files, a
  re-install stops and asks; only \`--force\` overwrites. Files AfnoUI never
  wrote are never touched, and \`--dry-run\` previews every write.
- **No third-party drag-and-drop library.** All drag interactions — sortable
  lists, kanban boards, table row and column reorder, nested trees — are built
  on raw pointer events, so nothing like @dnd-kit enters your dependency tree.
  Mouse, touch, and pen are supported by the same code path, with axis-aware
  autoscroll, an activation distance so plain clicks still fire, and Escape to
  cancel a drag.
- **No charting dependency.** All 17 chart types across 93 variants are built
  from scratch, with full RTL and LTR support.
- **Builds round-trip as JSON.** Every builder exports its complete state — the
  configuration, the data, and any custom cell or card renderers — as one JSON
  document, and imports it back to the identical build, including the template
  variant it started from. Nothing is stored on a server; the JSON belongs to
  you and can live in a repo or an issue.
- **Builds are validated before export.** Each builder runs a Build health check
  and reports real configuration faults with their fix: duplicate field names or
  column ids, conditional fields watching a field that no longer exists, columns
  whose data key is absent from the rows, kanban cards pointing at a deleted
  column, columns over their WIP limit, flow nodes with a route action but no
  href. These are precisely the faults that would otherwise appear as broken
  generated code inside your project.

## Builders

${toolSections}

## All features

${features}

## CLI reference

${commands}

Works with npm, pnpm, yarn, and bun (\`npx\` / \`pnpm dlx\` / \`yarn dlx\` / \`bunx\`).
Every command also accepts \`--dry-run\`, \`--force\`, and \`--debug\`.

## Frequently asked questions

${faq}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
