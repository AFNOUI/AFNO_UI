#!/usr/bin/env node

/**
 * Build DnD Registry — mirror of `build-kanban-registry.ts`, scoped to just
 * the Pointer DnD primitives library (`app/components/ui/dnd/*`).
 *
 * Why this exists:
 *   The DnD lab variants (`/dnd/sortable-list`, `/dnd/trash`, …) install via
 *   `afnoui add dnd/<slug>` to `components/dnd-examples/<slug>/<Pascal>Demo.tsx`.
 *   Each snippet imports `../../../lib/dnd` (the primitives package) and
 *   `../../../lib/utils` (the `cn` helper). Without this registry, the snippet
 *   lands in the consumer's project pointing at files that don't exist.
 *
 *   The kanban registry already ships `lib/dnd/*` because the kanban board uses
 *   the same primitives — but a user adopting `afnoui add dnd/<slug>` should
 *   NOT have to run `afnoui add kanban/<variant>` first. This registry makes
 *   the DnD subsystem its own first-class install target, with the same shape
 *   (`dndInstall` + `shared`) as `kanban.json` / `tables.json`.
 *
 * Outputs:
 *   - public/registry/dnd.json                — CLI-consumable
 *   - app/registry/dndRegistryGenerated.ts    — TS mirror (escaped template
 *     literals) so any future in-app tooling can read the same data without
 *     a second source of truth.
 *
 * The pipeline reads the same canonical files the kanban registry reads —
 * if both are regenerated in one build, the `lib/dnd/*` content is identical
 * in both JSON files and the CLI writes the same bytes regardless of which
 * registry installed them first.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUTPUT_DIR = path.join(ROOT, "public", "registry");
const JSON_OUTPUT_FILE = path.join(JSON_OUTPUT_DIR, "dnd.json");
const TS_OUTPUT_FILE = path.join(ROOT, "app", "registry", "dndRegistryGenerated.ts");

type Lang = "typescript" | "tsx" | "css";

interface DndSharedSource {
  /** Repo-relative source path. */
  sourcePath: string;
  /** Destination path inside the consumer project. */
  targetPath: string;
  /** Display name used in registry entries. */
  name: string;
  language: Lang;
  description: string;
}

/**
 * Registry install metadata. Mirrors `kanbanInstall` from `kanban.json`.
 *
 * `uiComponents` lists registry items the variant snippets transitively need —
 * here just `utils` (the `cn` helper), which pulls `clsx` + `tailwind-merge`
 * as transitive npm deps via its own registry entry. We *could* repeat those
 * in `npmDependencies`, but routing them through the existing component
 * pipeline keeps a single source of truth.
 *
 * `lucide-react` is a hard requirement because every DnD variant snippet uses
 * a lucide icon (Trash2, GripVertical, …). We install it eagerly so the
 * snippet compiles after `afnoui add dnd/<slug>` without extra steps.
 */
const DND_INSTALL = {
  npmDependencies: [
    "react",
    "react-dom",
    "lucide-react",
    "clsx",
    "tailwind-merge",
  ],
  npmDevDependencies: [] as string[],
  uiComponents: ["utils"],
} as const;

const DND_SHARED_SOURCES: DndSharedSource[] = [
  {
    sourcePath: "app/components/ui/dnd/index.ts",
    targetPath: "components/dnd/index.ts",
    name: "dnd/index.ts",
    language: "typescript",
    description: "Custom Pointer DnD — public surface (no @dnd-kit dependency).",
  },
  {
    sourcePath: "app/components/ui/dnd/DndContext.tsx",
    targetPath: "components/dnd/DndContext.tsx",
    name: "dnd/DndContext.tsx",
    language: "tsx",
    description:
      "DnD provider with autoscroll, prefers-reduced-motion, RTL index resolution.",
  },
  {
    sourcePath: "app/components/ui/dnd/useDraggable.ts",
    targetPath: "components/dnd/useDraggable.ts",
    name: "dnd/useDraggable.ts",
    language: "typescript",
    description: "Draggable hook with activation distance + custom React preview.",
  },
  {
    sourcePath: "app/components/ui/dnd/useDropZone.ts",
    targetPath: "components/dnd/useDropZone.ts",
    name: "dnd/useDropZone.ts",
    language: "typescript",
    description: "DropZone hook with animated sibling 'make room' translation.",
  },
  {
    sourcePath: "app/components/ui/dnd/DropIndicator.tsx",
    targetPath: "components/dnd/DropIndicator.tsx",
    name: "dnd/DropIndicator.tsx",
    language: "tsx",
    description: "Visual ghost-slot indicator at the computed insertion index.",
  },
  {
    sourcePath: "app/components/ui/dnd/types.ts",
    targetPath: "components/dnd/types.ts",
    name: "dnd/types.ts",
    language: "typescript",
    description: "Shared DnD type contracts.",
  },
  {
    sourcePath: "app/components/ui/dnd/dnd.css",
    targetPath: "components/dnd/dnd.css",
    name: "dnd/dnd.css",
    language: "css",
    description:
      "DnD overlay/indicator animations + cursor styles. @import once at app entry.",
  },
];

/**
 * The DnD source files use only inter-package relative imports (`./types`,
 * `./DndContext`) plus a single `@/lib/utils` alias inside `DropIndicator.tsx`.
 * We leave both alone here: relative imports survive the move from
 * `components/ui/dnd/` → `components/dnd/` (the layout is identical) and the
 * CLI's `rewriteAliasedImportsToRelative` retargets `@/lib/utils` per the
 * consumer's `lib` alias when the file is written. No rewriting needed.
 */
function readSourceFile(source: DndSharedSource): string {
  const abs = path.join(ROOT, source.sourcePath);
  if (!fs.existsSync(abs)) {
    throw new Error(
      `[build-dnd-registry] Missing source file: ${source.sourcePath} (expected at ${abs})`,
    );
  }
  return fs.readFileSync(abs, "utf-8");
}

interface BuiltFile extends DndSharedSource {
  code: string;
}

function buildAllFiles(): BuiltFile[] {
  return DND_SHARED_SOURCES.map((src) => ({ ...src, code: readSourceFile(src) }));
}

function generateJsonRegistry(files: BuiltFile[], generatedAt: string): void {
  const payload = {
    generatedAt,
    dndInstall: DND_INSTALL,
    shared: files.map((f) => ({
      name: f.name,
      path: f.targetPath,
      code: f.code,
      language: f.language,
      description: f.description,
    })),
  };

  fs.mkdirSync(JSON_OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(JSON_OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf-8");
  const sizeKB = (fs.statSync(JSON_OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(`✅ JSON registry: ${path.relative(ROOT, JSON_OUTPUT_FILE)} (${sizeKB} KB)`);
}

function escapeForTemplateLiteral(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function toVarName(targetPath: string): string {
  const base = targetPath
    .replace(/\.[a-z]+$/i, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `${base || "file"}Raw`;
}

function generateTsRegistry(files: BuiltFile[], generatedAt: string): void {
  const varDecls: string[] = [];
  const rows: string[] = [];

  for (const f of files) {
    const v = toVarName(f.targetPath);
    varDecls.push(`const ${v} = \`${escapeForTemplateLiteral(f.code)}\`;`);
    rows.push(
      [
        `  {`,
        `    name: ${JSON.stringify(f.name)},`,
        `    path: ${JSON.stringify(f.targetPath)},`,
        `    code: ${v},`,
        `    language: ${JSON.stringify(f.language)},`,
        `    description: ${JSON.stringify(f.description)},`,
        `  },`,
      ].join("\n"),
    );
  }

  const lines = [
    "/**",
    " * AUTO-GENERATED by scripts/build-dnd-registry.ts",
    " * DO NOT EDIT MANUALLY — run `npm run build:dnd-registry` to regenerate.",
    " */",
    "",
    "export interface DndRegistryFile {",
    "  name: string;",
    "  path: string;",
    "  code: string;",
    "  language: \"typescript\" | \"tsx\" | \"css\";",
    "  description: string;",
    "}",
    "",
    `export const dndRegistryGeneratedAt = ${JSON.stringify(generatedAt)};`,
    "",
    `export const dndInstall = ${JSON.stringify(DND_INSTALL, null, 2)} as const;`,
    "",
    ...varDecls,
    "",
    "/** Always-shipped shared DnD primitive files. */",
    "export const generatedSharedDndFiles: DndRegistryFile[] = [",
    ...rows,
    "];",
    "",
  ];

  fs.mkdirSync(path.dirname(TS_OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(TS_OUTPUT_FILE, lines.join("\n"), "utf-8");
  const sizeKB = (fs.statSync(TS_OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(`✅ TypeScript registry: ${path.relative(ROOT, TS_OUTPUT_FILE)} (${sizeKB} KB)`);
}

function main(): void {
  console.log("📦 Building DnD registry…");
  const generatedAt = new Date().toISOString();
  const files = buildAllFiles();
  console.log(`   Reading ${files.length} shared DnD source files…`);
  generateJsonRegistry(files, generatedAt);
  generateTsRegistry(files, generatedAt);
  console.log("🎯 DnD registry built.");
}

main();
