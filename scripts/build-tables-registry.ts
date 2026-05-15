#!/usr/bin/env node

/**
 * Build Tables Registry (CLI `tables.json` + TypeScript mirror for the app).
 *
 * The table export pipeline ships four always-included "shared engine" files to the
 * end user's project:
 *
 *   components/tables/TablePreview.tsx   (engine)
 *   components/tables/useTablePreview.ts (derivations hook)
 *   components/tables/types.ts           (config + column types)
 *   components/ui/table.tsx              (shadcn primitives)
 *   components/dnd/*                     (custom pointer DnD — bundled, no @dnd-kit)
 *
 * This script reads them from their canonical source locations, rewrites the two
 * self-referential `@/table-builder/...` import specifiers to paths that make sense
 * inside the installed `components/tables/` folder, and emits:
 *
 *   - app/registry/tableRegistryGenerated.ts   (template-literal mirror; consumed by
 *                                               app/registry/tableRegistry.ts)
 *   - public/registry/tables.json              (CLI-consumable; same as forms.json)
 *
 * Keep the logic intentionally small — the table engine is only four files. When new
 * shared files are introduced, add them to TABLE_SHARED_SOURCES below.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUTPUT_DIR = path.join(ROOT, "public", "registry");
const JSON_OUTPUT_FILE = path.join(JSON_OUTPUT_DIR, "tables.json");
const TS_OUTPUT_FILE = path.join(ROOT, "app", "registry", "tableRegistryGenerated.ts");

type Lang = "typescript" | "tsx" | "css";

interface TableSharedSource {
  /** Repo-relative source path (e.g. `app/table-builder/TablePreview.tsx`). */
  sourcePath: string;
  /** Destination path inside the consumer project (e.g. `components/tables/TablePreview.tsx`). */
  targetPath: string;
  /** Display name used in registry entries and the Export tab. */
  name: string;
  language: Lang;
  description: string;
}

/**
 * Registry install metadata. Mirrors the `stackInstall` block from forms.json so the CLI
 * can install the same ecosystem with a single `afnoui add tables/<variant>` invocation.
 *
 * NOTE: Row DnD is implemented with the bundled `components/dnd` library (same as Kanban) —
 * there is no `@dnd-kit/*` dependency. `@tanstack/react-virtual` is required when
 * virtualization is enabled; it is imported from `TablePreview.tsx`, so it stays in
 * `npmDependencies`. `optionalPeers` is kept for schema back-compat.
 */
const TABLE_INSTALL = {
  npmDependencies: [
    "react",
    "lucide-react",
    "clsx",
    "tailwind-merge",
    "class-variance-authority",
    "@tanstack/react-virtual",
  ],
  npmDevDependencies: [] as string[],
  uiComponents: [
    "table",
    "button",
    "badge",
    "input",
    "select",
    "switch",
    "checkbox",
    "progress",
    "avatar",
    "card",
    "skeleton",
    "scroll-area",
    "tabs",
    "dropdown-menu",
    "radio-group",
    "collapsible",
    "dialog",
    "use-toast",
  ],
  /**
   * Kept for registry-shape back-compat. All engine peers are now unconditional and
   * already included in `npmDependencies`; leave these arrays empty so older CLI
   * builds that still read them produce no duplicates.
   */
  optionalPeers: {
    enableDnD: [] as string[],
    enableVirtualization: [] as string[],
  },
} as const;

const TABLE_SHARED_SOURCES: TableSharedSource[] = [
  {
    sourcePath: "app/table-builder/TablePreview.tsx",
    targetPath: "components/tables/TablePreview.tsx",
    name: "TablePreview.tsx",
    language: "tsx",
    description:
      "The table engine — renders headers, rows, footer, pagination, expand, group, pin.",
  },
  {
    sourcePath: "app/table-builder/hooks/useTablePreview.ts",
    targetPath: "components/tables/useTablePreview.ts",
    name: "useTablePreview.ts",
    language: "typescript",
    description:
      "All client-side state + derivations (search/sort/filter/group/select/expand/resize).",
  },
  {
    sourcePath: "app/tables/types/types.ts",
    targetPath: "components/tables/types.ts",
    name: "types.ts",
    language: "typescript",
    description: "TableBuilderConfig + TableColumnConfig + AggregationType.",
  },
  {
    sourcePath: "app/utils/cellJsRunner.ts",
    targetPath: "utils/cellJsRunner.ts",
    name: "cellJsRunner.ts",
    language: "typescript",
    description:
      "Sandboxed per-cell JS handler runner used by columns whose clickAction.type === \"js\". Also reused by the kanban dialog runner.",
  },
  {
    sourcePath: "app/utils/rowDialogTemplate.ts",
    targetPath: "utils/rowDialogTemplate.ts",
    name: "rowDialogTemplate.ts",
    language: "typescript",
    description:
      "Mustache-style template + sanitizer used by row dialogs (table) and card dialogs (kanban).",
  },
  {
    sourcePath: "app/components/ui/table.tsx",
    targetPath: "components/ui/table.tsx",
    name: "table.tsx",
    language: "tsx",
    description: "shadcn/ui Table primitives.",
  },
  {
    sourcePath: "app/components/shared/VariantJsonConfigPanel.tsx",
    targetPath: "components/shared/VariantJsonConfigPanel.tsx",
    name: "VariantJsonConfigPanel.tsx",
    language: "tsx",
    description:
      "Collapsible JSON config viewer rendered next to TablePreview (shared with form/kanban builder previews).",
  },
  // ─── Custom DnD (TablePreview imports from here — NOT @dnd-kit) ─────────────
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
    description: "DnD provider with autoscroll, prefers-reduced-motion, RTL index resolution.",
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
    description: "DnD overlay/indicator animations + cursor styles. @import once at app entry.",
  },
];

/**
 * Rewrite the two self-referential `@/table-builder/...` specifiers to match the
 * flat `components/tables/` layout the user ends up with after install.
 *
 * Every other `@/…` alias (`@/lib/utils`, `@/hooks/use-toast`, `@/components/ui/*`) is
 * intentionally preserved — consumers keep those aliases in their own `tsconfig.json`.
 */
function rewriteSharedFileImports(source: string): string {
  return (
    source
      .replace(
        /from\s+(["'])@\/table-builder\/hooks\/useTablePreview\1/g,
        "from $1./useTablePreview$1",
      )
      // Types are re-exported through `tableBuilderTemplates` in-app, but the installed
      // equivalent is just `./types` (copy of `app/tables/types/types.ts`).
      .replace(
        /from\s+(["'])@\/table-builder\/data\/tableBuilderTemplates\1/g,
        "from $1./types$1",
      )
      // cellJsRunner / rowDialogTemplate live in `app/utils/` in this monorepo
      // and ship to a sibling `utils/` folder in the consumer project (NOT under
      // `components/tables/`). From `components/tables/TablePreview.tsx` to
      // `utils/<file>.ts` the relative path is `../../utils/<file>` — invariant
      // across project layouts (app-dir, src-rooted, flat) because both files
      // share the same install base. Pre-rewriting in the build script means the
      // CLI's import-rewriter never touches these specifiers (it only matches
      // `@/...` patterns), so we don't accidentally re-resolve through the
      // `utils` alias (which points at `lib/utils.ts`, the cn utility file).
      .replace(
        /from\s+(["'])@\/utils\/cellJsRunner\1/g,
        "from $1../../utils/cellJsRunner$1",
      )
      .replace(
        /from\s+(["'])@\/utils\/rowDialogTemplate\1/g,
        "from $1../../utils/rowDialogTemplate$1",
      )
      // Legacy alias kept for back-compat with older tagged sources.
      .replace(
        /from\s+(["'])@\/table-builder\/utils\/cellJsRunner\1/g,
        "from $1../../utils/cellJsRunner$1",
      )
      // Table engine lives at `components/tables/`; DnD ships to `components/dnd/`.
      .replace(
        /from\s+(["'])@\/components\/ui\/dnd\1/g,
        "from $1../dnd$1",
      )
  );
}

function readSourceFile(source: TableSharedSource): string {
  const abs = path.join(ROOT, source.sourcePath);
  if (!fs.existsSync(abs)) {
    throw new Error(
      `[build-tables-registry] Missing source file: ${source.sourcePath} (expected at ${abs})`,
    );
  }
  const raw = fs.readFileSync(abs, "utf-8");
  if (source.language === "css") return raw;
  return rewriteSharedFileImports(raw);
}

interface BuiltFile extends TableSharedSource {
  code: string;
}

function buildAllFiles(): BuiltFile[] {
  return TABLE_SHARED_SOURCES.map((src) => ({ ...src, code: readSourceFile(src) }));
}

function generateJsonRegistry(files: BuiltFile[], generatedAt: string): void {
  const payload = {
    generatedAt,
    tableInstall: TABLE_INSTALL,
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
    .replace(/\.tsx?$/i, "")
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
    " * AUTO-GENERATED by scripts/build-tables-registry.ts",
    " * DO NOT EDIT MANUALLY — run `npm run build:tables-registry` to regenerate.",
    " */",
    "",
    "export interface TableRegistryFile {",
    "  name: string;",
    "  path: string;",
    "  code: string;",
    "  language: \"typescript\" | \"tsx\" | \"css\";",
    "  description: string;",
    "}",
    "",
    `export const tableRegistryGeneratedAt = ${JSON.stringify(generatedAt)};`,
    "",
    `export const tableInstall = ${JSON.stringify(TABLE_INSTALL, null, 2)} as const;`,
    "",
    ...varDecls,
    "",
    "/** Always-shipped shared engine files (rewritten for the installed layout). */",
    "export const generatedSharedTableFiles: TableRegistryFile[] = [",
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
  console.log("📦 Building tables registry…");
  const generatedAt = new Date().toISOString();
  const files = buildAllFiles();
  console.log(`   Reading ${files.length} shared table source files…`);
  generateJsonRegistry(files, generatedAt);
  generateTsRegistry(files, generatedAt);
  console.log("🎯 Tables registry built.");
}

main();
