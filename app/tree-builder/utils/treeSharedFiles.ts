/**
 * Shared-engine files for the Tree Builder.
 *
 * Thin barrel over `app/registry/treeRegistry.ts` — the actual source of each
 * file is read at build time by `scripts/build-tree-registry.ts` (which
 * regenerates `app/registry/treeRegistryGenerated.ts`). This is the Next.js-safe
 * equivalent of a Vite `?raw` import: no drift, no copy/paste — the Export tab
 * and the `/trees` + `/tree-builder` pages always see the live engine source.
 *
 * Mirrors `app/kanban-builder/utils/kanbanSharedFiles.ts`.
 */

import {
  treeInstall,
  SHARED_TREE_FILES as REGISTRY_SHARED_TREE_FILES,
  OPTIONAL_TREE_GROUPS,
} from "@/registry/treeRegistry";

export interface SharedTreeFile {
  name: string;
  path: string;
  code: string;
  description: string;
  language: "tsx" | "ts";
}

/** Always-shipped engine files (TreeCanvas + layout + types), copy once. */
export const SHARED_TREE_FILES: SharedTreeFile[] = REGISTRY_SHARED_TREE_FILES.map((f) => ({
  name: f.name,
  path: f.path,
  code: f.code,
  description: f.description,
  // The engine bundle is only ever .tsx / .ts — CSS never appears here.
  language: f.language === "css" ? "ts" : f.language,
}));

/**
 * The `toolbar` optional group (GraphToolbar + useGraphFilter + the graph
 * barrel). Ships by default alongside `SHARED_TREE_FILES` for every variant
 * (see `treeVariantFeatures` in `../utils/variantBundle.ts`) so the Export
 * tab and the `/trees` gallery source view show it without requiring the CLI.
 */
export const OPTIONAL_TREE_FILES: SharedTreeFile[] =
  OPTIONAL_TREE_GROUPS.find((g) => g.feature === "toolbar")?.files.map((f) => ({
    name: f.name,
    path: f.path,
    code: f.code,
    description: f.description,
    language: f.language === "css" ? "ts" : f.language,
  })) ?? [];

/**
 * Runtime npm dependencies + UI components needed by the exported tree.
 * Mirrors the shape the legacy vite-style stub exposed (`runtime` + `notes`).
 */
export const TREE_DEPENDENCIES = {
  dev: treeInstall.npmDevDependencies,
  runtime: treeInstall.npmDependencies,
  uiComponents: treeInstall.uiComponents,
  notes: [
    `Requires shadcn/ui components: ${treeInstall.uiComponents.join(", ")}.`,
    "Bring `cn` from your `@/lib/utils` (clsx + tailwind-merge).",
    "Zero graph-library dependency — TreeCanvas computes layouts + drag itself.",
    "The GraphToolbar (search / sort / filter) installs only for variants with `showToolbar: true`.",
  ],
};
