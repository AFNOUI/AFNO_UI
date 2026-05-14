#!/usr/bin/env node

/**
 * Build Kanban Registry — mirror of `build-tables-registry.ts`.
 *
 * The kanban export pipeline ships these "shared engine" files to the user:
 *
 *   components/kanban/KanbanBoard.tsx       (engine)
 *   components/kanban/KanbanCard.tsx        (card renderer)
 *   components/kanban/KanbanCardDialog.tsx  (click dialog renderer)
 *   components/kanban/KanbanAddCardDialog.tsx (+ card form)
 *   components/kanban/types.ts              (KanbanBuilderConfig + …)
 *   utils/cellJsRunner.ts                   (shared with tables, lives at <base>/utils/)
 *   utils/rowDialogTemplate.ts              (shared with tables, lives at <base>/utils/)
 *   lib/dnd/index.ts                        (custom pointer DnD library)
 *   lib/dnd/DndContext.tsx
 *   lib/dnd/useDraggable.ts
 *   lib/dnd/useDropZone.ts
 *   lib/dnd/DropIndicator.tsx
 *   lib/dnd/types.ts
 *   lib/dnd/dnd.css
 *
 * Outputs:
 *   - app/registry/kanbanRegistryGenerated.ts  (template-literal mirror; consumed by
 *                                                app/registry/kanbanRegistry.ts)
 *   - public/registry/kanban.json              (CLI-consumable; same shape as tables.json)
 *
 * `cellJsRunner.ts` + `rowDialogTemplate.ts` are intentionally duplicated with the
 * tables registry. They ship to the same target paths (`utils/<file>.ts`, sibling to
 * `lib/`) with identical content, so the CLI writes the same file regardless of
 * which registry installs first. We deliberately do NOT route them under
 * `components/tables/` — that would create a stray `tables/` folder for users who
 * only install `kanban/<variant>` (and never run the table system).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUTPUT_DIR = path.join(ROOT, "public", "registry");
const JSON_OUTPUT_FILE = path.join(JSON_OUTPUT_DIR, "kanban.json");
const TS_OUTPUT_FILE = path.join(ROOT, "app", "registry", "kanbanRegistryGenerated.ts");

type Lang = "typescript" | "tsx" | "css";

interface KanbanSharedSource {
  /** Repo-relative source path (e.g. `app/kanban/KanbanBoard.tsx`). */
  sourcePath: string;
  /** Destination path inside the consumer project (e.g. `components/kanban/KanbanBoard.tsx`). */
  targetPath: string;
  /** Display name used in registry entries and the Export tab. */
  name: string;
  language: Lang;
  description: string;
}

/**
 * Registry install metadata. Mirrors the `tableInstall` block from `tables.json` so
 * the CLI installs the same ecosystem with a single `afnoui add kanban/<variant>`.
 *
 * The custom DnD library is bundled — there is no `@dnd-kit/*` dependency.
 */
const KANBAN_INSTALL = {
  npmDependencies: [
    "react",
    "react-dom",
    "lucide-react",
    "clsx",
    "tailwind-merge",
    "class-variance-authority",
  ],
  npmDevDependencies: [] as string[],
  uiComponents: [
    "button",
    "badge",
    "input",
    "label",
    "textarea",
    "select",
    "dialog",
    "scroll-area",
    "avatar",
    "progress",
    "use-toast",
  ],
} as const;

const KANBAN_SHARED_SOURCES: KanbanSharedSource[] = [
  {
    sourcePath: "app/kanban/KanbanBoard.tsx",
    targetPath: "components/kanban/KanbanBoard.tsx",
    name: "KanbanBoard.tsx",
    language: "tsx",
    description:
      "Config-driven board engine — board / compact / swimlane / timeline / calendar layouts, RTL, animated reorder, WIP limits.",
  },
  {
    sourcePath: "app/kanban/KanbanCard.tsx",
    targetPath: "components/kanban/KanbanCard.tsx",
    name: "KanbanCard.tsx",
    language: "tsx",
    description:
      "Renders the configurable card content (tags, priority, dueDate, assignee, …).",
  },
  {
    sourcePath: "app/kanban/KanbanCardDialog.tsx",
    targetPath: "components/kanban/KanbanCardDialog.tsx",
    name: "KanbanCardDialog.tsx",
    language: "tsx",
    description:
      "User-templated dialog opened on card click. HTML/Tailwind w/ {{card.field}} mustache substitution.",
  },
  {
    sourcePath: "app/kanban/KanbanAddCardDialog.tsx",
    targetPath: "components/kanban/KanbanAddCardDialog.tsx",
    name: "KanbanAddCardDialog.tsx",
    language: "tsx",
    description: 'Inline "+ Add card" dialog — fields auto-derived from `visibleFields`.',
  },
  {
    sourcePath: "app/kanban/types.ts",
    targetPath: "components/kanban/types.ts",
    name: "types.ts",
    language: "typescript",
    description: "KanbanBuilderConfig + KanbanCardData + supporting event shapes.",
  },
  /**
   * Shared sandbox helpers (also installed by the tables registry under the same
   * target path). They land in a top-level `utils/` folder beside `lib/` — never
   * inside `components/tables/`. See block comment at the top of this file for the
   * full rationale; the matching CLI route lives in
   * `afnoui-cli/src/lib/helpers/installPaths.ts → resolveUtilsHelperPath`.
   */
  {
    sourcePath: "app/utils/cellJsRunner.ts",
    targetPath: "utils/cellJsRunner.ts",
    name: "cellJsRunner.ts",
    language: "typescript",
    description:
      "Sandboxed JS runner — used by both table cell click handlers and kanban card change/dialog snippets.",
  },
  {
    sourcePath: "app/utils/rowDialogTemplate.ts",
    targetPath: "utils/rowDialogTemplate.ts",
    name: "rowDialogTemplate.ts",
    language: "typescript",
    description:
      "Mustache-style template + sanitizer — used by row dialogs (table) and card dialogs (kanban).",
  },
  // ─── DnD library (no @dnd-kit dependency) ──────────────────────────────────
  {
    sourcePath: "app/components/ui/dnd/index.ts",
    targetPath: "lib/dnd/index.ts",
    name: "dnd/index.ts",
    language: "typescript",
    description: "Custom Pointer DnD — public surface (no @dnd-kit dependency).",
  },
  {
    sourcePath: "app/components/ui/dnd/DndContext.tsx",
    targetPath: "lib/dnd/DndContext.tsx",
    name: "dnd/DndContext.tsx",
    language: "tsx",
    description: "DnD provider with autoscroll, prefers-reduced-motion, RTL index resolution.",
  },
  {
    sourcePath: "app/components/ui/dnd/useDraggable.ts",
    targetPath: "lib/dnd/useDraggable.ts",
    name: "dnd/useDraggable.ts",
    language: "typescript",
    description: "Draggable hook with activation distance + custom React preview.",
  },
  {
    sourcePath: "app/components/ui/dnd/useDropZone.ts",
    targetPath: "lib/dnd/useDropZone.ts",
    name: "dnd/useDropZone.ts",
    language: "typescript",
    description: "DropZone hook with animated sibling 'make room' translation.",
  },
  {
    sourcePath: "app/components/ui/dnd/DropIndicator.tsx",
    targetPath: "lib/dnd/DropIndicator.tsx",
    name: "dnd/DropIndicator.tsx",
    language: "tsx",
    description: "Visual ghost-slot indicator at the computed insertion index.",
  },
  {
    sourcePath: "app/components/ui/dnd/types.ts",
    targetPath: "lib/dnd/types.ts",
    name: "dnd/types.ts",
    language: "typescript",
    description: "Shared DnD type contracts.",
  },
  {
    sourcePath: "app/components/ui/dnd/dnd.css",
    targetPath: "lib/dnd/dnd.css",
    name: "dnd/dnd.css",
    language: "css",
    description: "DnD overlay/indicator animations + cursor styles. @import once at app entry.",
  },
];

/**
 * Rewrite the self-referential `@/…` specifiers to match the installed layout.
 * Every other `@/…` alias (`@/lib/utils`, `@/components/ui/*`, `@/hooks/use-toast`)
 * is intentionally preserved — consumers keep those aliases in their `tsconfig.json`.
 */
function rewriteSharedFileImports(source: string): string {
  return (
    source
      // Kanban runtime types collapse to ./types within components/kanban/.
      .replace(/from\s+(["'])@\/kanban\/types\1/g, "from $1./types$1")
      // Sibling kanban modules are co-located.
      .replace(/from\s+(["'])@\/kanban\/KanbanCard\1/g, "from $1./KanbanCard$1")
      .replace(/from\s+(["'])@\/kanban\/KanbanCardDialog\1/g, "from $1./KanbanCardDialog$1")
      .replace(/from\s+(["'])@\/kanban\/KanbanAddCardDialog\1/g, "from $1./KanbanAddCardDialog$1")
      // DnD library — consumer keeps the @/lib/dnd alias.
      .replace(/from\s+(["'])@\/kanban\/dnd\1/g, "from $1@/lib/dnd$1")
      // Shared sandbox helpers ship to a sibling `utils/` folder (not under
      // `components/tables/`). Both kanban engine entry points (`KanbanBoard.tsx`
      // at `components/kanban/KanbanBoard.tsx` and `KanbanCardDialog.tsx` at
      // `components/kanban/KanbanCardDialog.tsx`) sit two levels deep, so the
      // relative path to `utils/<file>.ts` is `../../utils/<file>` — invariant
      // across project layouts (app/, src/app/, flat). Pre-rewriting here means
      // the CLI's `@/`-only import-rewriter never re-resolves these specifiers
      // through the `utils` *alias* (which points at the cn utility file).
      .replace(/from\s+(["'])@\/utils\/cellJsRunner\1/g, "from $1../../utils/cellJsRunner$1")
      .replace(/from\s+(["'])@\/utils\/rowDialogTemplate\1/g, "from $1../../utils/rowDialogTemplate$1")
  );
}

function readSourceFile(source: KanbanSharedSource): string {
  const abs = path.join(ROOT, source.sourcePath);
  if (!fs.existsSync(abs)) {
    throw new Error(
      `[build-kanban-registry] Missing source file: ${source.sourcePath} (expected at ${abs})`,
    );
  }
  const raw = fs.readFileSync(abs, "utf-8");
  // CSS files don't need import rewriting.
  return source.language === "css" ? raw : rewriteSharedFileImports(raw);
}

interface BuiltFile extends KanbanSharedSource {
  code: string;
}

function buildAllFiles(): BuiltFile[] {
  return KANBAN_SHARED_SOURCES.map((src) => ({ ...src, code: readSourceFile(src) }));
}

function generateJsonRegistry(files: BuiltFile[], generatedAt: string): void {
  const payload = {
    generatedAt,
    kanbanInstall: KANBAN_INSTALL,
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
    " * AUTO-GENERATED by scripts/build-kanban-registry.ts",
    " * DO NOT EDIT MANUALLY — run `npm run build:kanban-registry` to regenerate.",
    " */",
    "",
    "export interface KanbanRegistryFile {",
    "  name: string;",
    "  path: string;",
    "  code: string;",
    "  language: \"typescript\" | \"tsx\" | \"css\";",
    "  description: string;",
    "}",
    "",
    `export const kanbanRegistryGeneratedAt = ${JSON.stringify(generatedAt)};`,
    "",
    `export const kanbanInstall = ${JSON.stringify(KANBAN_INSTALL, null, 2)} as const;`,
    "",
    ...varDecls,
    "",
    "/** Always-shipped shared engine files (rewritten for the installed layout). */",
    "export const generatedSharedKanbanFiles: KanbanRegistryFile[] = [",
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
  console.log("📦 Building kanban registry…");
  const generatedAt = new Date().toISOString();
  const files = buildAllFiles();
  console.log(`   Reading ${files.length} shared kanban source files…`);
  generateJsonRegistry(files, generatedAt);
  generateTsRegistry(files, generatedAt);
  console.log("🎯 Kanban registry built.");
}

main();
