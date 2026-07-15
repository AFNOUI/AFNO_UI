/**
 * Tree registry facade.
 *
 * Wraps `treeRegistryGenerated.ts` (produced by `scripts/build-tree-registry.ts`)
 * with the shape the Export tab + `/trees` and `/tree-builder` pages consume.
 * Mirrors the role of `app/registry/kanbanRegistry.ts` for the kanban stack.
 *
 * The shared engine files live in the generated module — this file only adapts
 * the shape (adds the `src/` display prefix, normalises the language tag).
 * Unlike kanban there are no config-gated helper files to prune: TreeCanvas is
 * self-contained, so the engine bundle is always the full three files.
 */

import {
  generatedSharedTreeFiles,
  generatedOptionalTreeGroups,
  treeInstall,
  treeRegistryGeneratedAt,
  type TreeRegistryFile,
  type TreeOptionalGroup,
} from "./treeRegistryGenerated";

export interface SharedTreeFile {
  name: string;
  path: string;
  description: string;
  language: "tsx" | "ts" | "css";
  code: string;
}

const RE_EXPORT_LANGUAGE = {
  typescript: "ts" as const,
  ts: "ts" as const,
  tsx: "tsx" as const,
  css: "css" as const,
};

function toSharedFile(file: TreeRegistryFile): SharedTreeFile {
  return {
    name: file.name,
    path: `src/${file.path}`,
    description: file.description,
    language: RE_EXPORT_LANGUAGE[file.language],
    code: file.code,
  };
}

/** Always-shipped engine files — copy these once into any project. */
export const SHARED_TREE_FILES: SharedTreeFile[] = generatedSharedTreeFiles.map(toSharedFile);

/** Optional feature groups (e.g. the GraphToolbar) keyed by feature. */
export const OPTIONAL_TREE_GROUPS = generatedOptionalTreeGroups.map((g) => ({
  feature: g.feature,
  uiComponents: g.uiComponents,
  npmDependencies: g.npmDependencies,
  files: g.files.map(toSharedFile),
}));

export { treeInstall, treeRegistryGeneratedAt };
export type { TreeRegistryFile, TreeOptionalGroup };
