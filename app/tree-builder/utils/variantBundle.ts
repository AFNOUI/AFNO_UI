/**
 * Variant-bundle builder for tree variants (CLI-facing). Mirrors
 * `app/kanban-builder/utils/variantBundle.ts` for the kanban pipeline:
 *
 * - Calls `generateTreeFiles(config, tree, rendererSources, componentName)` to
 *   get the per-variant files (`<Component>.tsx`, `config.ts`, `data.ts`,
 *   `handlers.ts`, and optionally `renderers.tsx`).
 * - Rewrites the absolute `@/components/tree/*` (and `@/components/graph`)
 *   import specifiers to stable relative paths so the generated bundle does not
 *   depend on the user's `tsconfig.json` `paths` alias matching ours.
 * - Flattens paths from `src/components/tree-instances/...` to `tree/<slug>/...`
 *   (resolved by the CLI's `treeVariants` alias, e.g. `app/tree/<slug>/`).
 *
 * The shared engine files (`TreeCanvas.tsx`, `layout.ts`, `types.ts`) ship via
 * `public/registry/tree.json` and are installed separately by the CLI's
 * `ensureTreeSystemForVariantSlugs` — we deliberately do NOT bundle them here.
 * The GraphToolbar ships as the `toolbar` optional group in `tree.json`, pulled
 * in by the CLI only for variants that declare the `toolbar` feature.
 */

import type { TreeCanvasConfig, TreeNode } from "@/trees/types";

import { generateTreeFiles } from "./treeCodeGenerator";
import type { TreeRendererSources } from "../data/treeBuilderTemplates";

export interface TreeVariantFile {
  /** Destination path inside the consumer project (e.g. `tree/<slug>/OrgChartTree.tsx`). */
  path: string;
  /** Raw file contents (with imports already rewritten for the install layout). */
  content: string;
}

/** `tree-org-chart` → `OrgChartTree`, `tree-fulfilment` → `FulfilmentTree`. */
export function variantTreeComponentName(variantSlug: string): string {
  const withoutPrefix = variantSlug.replace(/^tree-/, "");
  const parts = withoutPrefix.split(/[-_/]/).filter(Boolean);
  const pascal = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  return `${pascal || "My"}Tree`;
}

/**
 * The `toolbar` optional group (GraphToolbar) ships by default for every tree
 * variant — including ones authored later through the tree-builder — unless a
 * variant explicitly opts out with `showToolbar: false`.
 */
export function treeVariantFeatures(config: TreeCanvasConfig): string[] {
  return config.showToolbar !== false ? ["toolbar"] : [];
}

/**
 * Rewrite imports so generated variant files reference the shared engine under
 * `components/tree/` (and `components/graph/`) from inside `app/tree/<slug>/...`.
 * The variant bundle lives 2 levels deeper than the engine root, so
 * `../../components/<dir>/<file>` is the stable relative path on every supported
 * project layout (`app/`, `src/app/`, flat).
 *
 * We pre-rewrite here instead of letting the CLI's alias-import-rewriter do it
 * because variant files skip that rewriter (it excludes chart/table/kanban/tree
 * variants), which keeps variant bundles self-contained and decoupled from the
 * user's tsconfig `paths` shape.
 */
function rewriteVariantBundleImports(source: string): string {
  return source
    .replace(
      /from\s+(["'])@\/components\/tree\/([^"']+)\1/g,
      "from $1../../components/tree/$2$1",
    )
    .replace(
      /from\s+(["'])@\/components\/graph(\/[^"']+)?\1/g,
      (_m, q, rest = "") => `from ${q}../../components/graph${rest}${q}`,
    );
}

/** Strip the `src/` prefix the codegen adds (Vite-ism) so paths match the CLI install layout. */
function stripSrcPrefix(p: string): string {
  return p.replace(/^src\//, "");
}

/**
 * Build per-variant files for the CLI's `tree/<slug>` bundle. The returned paths
 * are relative to the consumer project root (e.g. `tree/<slug>/<Component>.tsx`
 * → `app/tree/<slug>/...` after install).
 */
export function buildTreeVariantFiles(
  config: TreeCanvasConfig,
  tree: TreeNode,
  variantSlug: string,
  rendererSources?: TreeRendererSources,
): TreeVariantFile[] {
  const componentName = variantTreeComponentName(variantSlug);
  const generated = generateTreeFiles(config, tree, rendererSources, componentName);

  return generated.map((file) => {
    // `src/components/tree-instances/<file>` → `tree/<slug>/<file>`.
    const flat = stripSrcPrefix(file.path);
    const baseName = flat.split("/").pop() ?? flat;
    const nested = `tree/${variantSlug}/${baseName}`;

    const content = rewriteVariantBundleImports(file.code);
    return { path: nested, content };
  });
}
