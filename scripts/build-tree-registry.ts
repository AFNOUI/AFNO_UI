#!/usr/bin/env node

/**
 * Build Tree Registry — mirror of `build-kanban-registry.ts`.
 *
 * The tree export pipeline ships these "shared engine" files to the user:
 *
 *   components/tree/TreeCanvas.tsx   (config-driven, zero-dependency renderer)
 *   components/tree/layout.ts        (pure layout algorithms)
 *   components/tree/types.ts         (TreeCanvasConfig + TreeNode + event shapes)
 *
 * The GraphToolbar (search / sort / filter bar) is an OPTIONAL group: it only
 * ships for variants whose config sets `showToolbar: true`. TreeCanvas itself
 * never imports it, so it is not part of the always-installed engine — it lives
 * under `optionalShared` keyed by the `toolbar` feature and the CLI installs it
 * only when a requested variant declares that feature.
 *
 * Outputs:
 *   - app/registry/treeRegistryGenerated.ts  (template-literal mirror; consumed by
 *                                              app/registry/treeRegistry.ts)
 *   - public/registry/tree.json              (CLI-consumable; same shape as kanban.json
 *                                              plus an `optionalShared` array)
 *
 * Unlike the kanban engine, every tree engine file uses relative (`./types`,
 * `./layout`) or preserved (`@/lib/utils`, `@/components/ui/*`) imports, so no
 * self-reference rewriting is required. We keep a defensive `@/trees/*` → `./`
 * rewrite in case a future edit reintroduces the alias.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUTPUT_DIR = path.join(ROOT, "public", "registry");
const JSON_OUTPUT_FILE = path.join(JSON_OUTPUT_DIR, "tree.json");
const TS_OUTPUT_FILE = path.join(ROOT, "app", "registry", "treeRegistryGenerated.ts");

type Lang = "typescript" | "tsx" | "css";

interface TreeSharedSource {
  /** Repo-relative source path (e.g. `app/trees/TreeCanvas.tsx`). */
  sourcePath: string;
  /** Destination path inside the consumer project (e.g. `components/tree/TreeCanvas.tsx`). */
  targetPath: string;
  /** Display name used in registry entries and the Export tab. */
  name: string;
  language: Lang;
  description: string;
}

interface TreeOptionalGroup {
  /** Feature key a variant opts into (via `config.showToolbar` → `"toolbar"`). */
  feature: string;
  /** Extra shadcn/ui components this group needs on top of the engine's. */
  uiComponents: string[];
  /** Extra npm deps this group needs on top of the engine's. */
  npmDependencies: string[];
  sources: TreeSharedSource[];
}

/**
 * Registry install metadata. Mirrors the `kanbanInstall` block from `kanban.json`
 * so the CLI installs the same ecosystem with a single `afnoui add tree/<variant>`.
 *
 * TreeCanvas has zero graph-library dependency — it computes its own layouts and
 * implements its own native pointer drag (no @dnd-kit, no shared DnD lib).
 */
const TREE_INSTALL = {
  npmDependencies: [
    "react",
    "react-dom",
    "lucide-react",
    "clsx",
    "tailwind-merge",
  ],
  npmDevDependencies: [] as string[],
  // TreeCanvas itself needs no shadcn primitive; `badge` is included because the
  // built-in / template node renderers use it.
  uiComponents: [
    "badge",
  ],
} as const;

const TREE_SHARED_SOURCES: TreeSharedSource[] = [
  {
    sourcePath: "app/trees/TreeCanvas.tsx",
    targetPath: "components/tree/TreeCanvas.tsx",
    name: "TreeCanvas.tsx",
    language: "tsx",
    description:
      "Config-driven tree renderer — horizontal / vertical / radial / mindmap / org layouts, pan/zoom, inline editing, native pointer drag. Zero external deps.",
  },
  {
    // Named `treeLayout.ts` (not `layout.ts`): under the lab's App Router,
    // `app/trees/layout.ts` would be treated as the `/trees` route layout.
    sourcePath: "app/trees/treeLayout.ts",
    targetPath: "components/tree/treeLayout.ts",
    name: "treeLayout.ts",
    language: "typescript",
    description: "Pure layout algorithms (horizontal, vertical, radial, mindmap, org).",
  },
  {
    // NOTE: source is a `.d.ts` in the lab; it ships as `types.ts` (type-only, no runtime).
    sourcePath: "app/trees/types.d.ts",
    targetPath: "components/tree/types.ts",
    name: "types.ts",
    language: "typescript",
    description: "Public types: TreeNode, TreeCanvasConfig, NodeRenderer, event payloads.",
  },
  {
    // Always shipped: the engine's `types.ts` references `NodeDataset` from here,
    // so it must be present even when the (optional) GraphToolbar UI is not.
    sourcePath: "app/components/ui/graph/types.ts",
    targetPath: "components/graph/types.ts",
    name: "graph/types.ts",
    language: "typescript",
    description: "GraphFilterState + GraphPredicate + NodeDataset contracts (shared with the toolbar).",
  },
];

const TREE_OPTIONAL_GROUPS: TreeOptionalGroup[] = [
  {
    feature: "toolbar",
    uiComponents: ["input", "button", "select"],
    npmDependencies: [],
    sources: [
      {
        sourcePath: "app/components/ui/graph/index.ts",
        targetPath: "components/graph/index.ts",
        name: "graph/index.ts",
        language: "typescript",
        description: "Public surface for the search / sort / filter toolbar.",
      },
      {
        sourcePath: "app/components/ui/graph/GraphToolbar.tsx",
        targetPath: "components/graph/GraphToolbar.tsx",
        name: "graph/GraphToolbar.tsx",
        language: "tsx",
        description: "Search / sort / filter bar that overlays a TreeCanvas (config.showToolbar).",
      },
      {
        sourcePath: "app/components/ui/graph/useGraphFilter.ts",
        targetPath: "components/graph/useGraphFilter.ts",
        name: "graph/useGraphFilter.ts",
        language: "typescript",
        description: "Hook that applies the toolbar's search/sort/filter to a tree.",
      },
    ],
  },
];

/**
 * Defensive self-reference rewrite. Tree engine files already use relative or
 * preserved imports, so this is currently a no-op — kept so a future edit that
 * reintroduces `@/trees/*` still collapses to co-located `./` specifiers.
 */
function rewriteSharedFileImports(source: string): string {
  return source
    .replace(/from\s+(["'])@\/trees\/types\1/g, "from $1./types$1")
    .replace(/from\s+(["'])@\/trees\/treeLayout\1/g, "from $1./treeLayout$1")
    .replace(/from\s+(["'])@\/trees\/TreeCanvas\1/g, "from $1./TreeCanvas$1")
    // The engine's types.ts references NodeDataset via an inline `import("@/components/ui/graph/types")`.
    // Point it at the shipped graph location (`components/graph`), where graph/types.ts installs.
    .replace(/@\/components\/ui\/graph/g, "@/components/graph");
}

function readSourceFile(source: TreeSharedSource): string {
  const abs = path.join(ROOT, source.sourcePath);
  if (!fs.existsSync(abs)) {
    throw new Error(
      `[build-tree-registry] Missing source file: ${source.sourcePath} (expected at ${abs})`,
    );
  }
  const raw = fs.readFileSync(abs, "utf-8");
  return source.language === "css" ? raw : rewriteSharedFileImports(raw);
}

interface BuiltFile extends TreeSharedSource {
  code: string;
}

function buildFiles(sources: TreeSharedSource[]): BuiltFile[] {
  return sources.map((src) => ({ ...src, code: readSourceFile(src) }));
}

interface BuiltOptionalGroup {
  feature: string;
  uiComponents: string[];
  npmDependencies: string[];
  files: BuiltFile[];
}

function buildOptionalGroups(): BuiltOptionalGroup[] {
  return TREE_OPTIONAL_GROUPS.map((g) => ({
    feature: g.feature,
    uiComponents: g.uiComponents,
    npmDependencies: g.npmDependencies,
    files: buildFiles(g.sources),
  }));
}

function fileToEntry(f: BuiltFile) {
  return {
    name: f.name,
    path: f.targetPath,
    code: f.code,
    language: f.language,
    description: f.description,
  };
}

function generateJsonRegistry(
  shared: BuiltFile[],
  optionalGroups: BuiltOptionalGroup[],
  generatedAt: string,
): void {
  const payload = {
    generatedAt,
    treeInstall: TREE_INSTALL,
    shared: shared.map(fileToEntry),
    optionalShared: optionalGroups.map((g) => ({
      feature: g.feature,
      uiComponents: g.uiComponents,
      npmDependencies: g.npmDependencies,
      files: g.files.map(fileToEntry),
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

function emitRows(files: BuiltFile[], varDecls: string[]): string[] {
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
  return rows;
}

function generateTsRegistry(
  shared: BuiltFile[],
  optionalGroups: BuiltOptionalGroup[],
  generatedAt: string,
): void {
  const varDecls: string[] = [];
  const sharedRows = emitRows(shared, varDecls);

  const optionalGroupBlocks = optionalGroups.map((g) => {
    const rows = emitRows(g.files, varDecls);
    return [
      `  {`,
      `    feature: ${JSON.stringify(g.feature)},`,
      `    uiComponents: ${JSON.stringify(g.uiComponents)},`,
      `    npmDependencies: ${JSON.stringify(g.npmDependencies)},`,
      `    files: [`,
      ...rows.map((r) => r.replace(/^/gm, "  ")),
      `    ],`,
      `  },`,
    ].join("\n");
  });

  const lines = [
    "/**",
    " * AUTO-GENERATED by scripts/build-tree-registry.ts",
    " * DO NOT EDIT MANUALLY — run `npm run build:tree-registry` to regenerate.",
    " */",
    "",
    "export interface TreeRegistryFile {",
    "  name: string;",
    "  path: string;",
    "  code: string;",
    '  language: "typescript" | "tsx" | "css";',
    "  description: string;",
    "}",
    "",
    "export interface TreeOptionalGroup {",
    "  feature: string;",
    "  uiComponents: string[];",
    "  npmDependencies: string[];",
    "  files: TreeRegistryFile[];",
    "}",
    "",
    `export const treeRegistryGeneratedAt = ${JSON.stringify(generatedAt)};`,
    "",
    `export const treeInstall = ${JSON.stringify(TREE_INSTALL, null, 2)} as const;`,
    "",
    ...varDecls,
    "",
    "/** Always-shipped shared engine files. */",
    "export const generatedSharedTreeFiles: TreeRegistryFile[] = [",
    ...sharedRows,
    "];",
    "",
    "/** Optional feature groups (e.g. the GraphToolbar) — installed only when a variant opts in. */",
    "export const generatedOptionalTreeGroups: TreeOptionalGroup[] = [",
    ...optionalGroupBlocks,
    "];",
    "",
  ];

  fs.mkdirSync(path.dirname(TS_OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(TS_OUTPUT_FILE, lines.join("\n"), "utf-8");
  const sizeKB = (fs.statSync(TS_OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(`✅ TypeScript registry: ${path.relative(ROOT, TS_OUTPUT_FILE)} (${sizeKB} KB)`);
}

function main(): void {
  console.log("📦 Building tree registry…");
  const generatedAt = new Date().toISOString();
  const shared = buildFiles(TREE_SHARED_SOURCES);
  const optionalGroups = buildOptionalGroups();
  const optionalCount = optionalGroups.reduce((n, g) => n + g.files.length, 0);
  console.log(
    `   Reading ${shared.length} shared + ${optionalCount} optional tree source files…`,
  );
  generateJsonRegistry(shared, optionalGroups, generatedAt);
  generateTsRegistry(shared, optionalGroups, generatedAt);
  console.log("🎯 Tree registry built.");
}

main();
