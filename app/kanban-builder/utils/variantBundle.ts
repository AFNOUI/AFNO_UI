/**
 * Variant-bundle builder for kanban variants (CLI-facing). Mirrors
 * `app/table-builder/utils/variantBundle.ts` for the table pipeline:
 *
 * - Calls `generateKanbanFiles(config, cards, componentNameOverride)` to get the
 *   per-variant files (`<Component>.tsx`, `config.ts`, `data.ts`,
 *   `useCardChange.ts`).
 * - Rewrites the absolute `@/components/kanban/*` import specifiers to stable
 *   relative paths so the generated bundle does not depend on the user's
 *   `tsconfig.json` `paths` alias being configured exactly the same way as ours.
 *   Mirrors how the table variant bundle pre-rewrites its engine imports.
 * - Flattens paths from `src/boards/<Component>/...` to `kanban/<slug>/...`
 *   (resolved by the CLI's `kanbanVariants` alias, e.g. `app/kanban/<slug>/`).
 *
 * The shared engine files (`KanbanBoard.tsx`, `KanbanCard.tsx`, …, the DnD
 * library, and the shared sandbox helpers under `utils/`) ship via
 * `public/registry/kanban.json` and are installed separately by the CLI's
 * `ensureKanbanSystemForVariantSlugs` — we deliberately do NOT bundle them
 * here.
 */

import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban/types";

import { generateKanbanFiles, type GeneratedFile } from "./kanbanCodeGenerator";

export interface KanbanVariantFile {
  /** Destination path inside the consumer project. */
  path: string;
  /** Raw file contents (with imports already rewritten for the install layout). */
  content: string;
}

/** `kanban-personal-tasks` → `PersonalTasksBoard`, `kanban-bug-tracker` → `BugTrackerBoard`. */
export function variantPageComponentName(variantSlug: string): string {
  const withoutPrefix = variantSlug.replace(/^kanban-/, "");
  const parts = withoutPrefix.split(/[-_/]/).filter(Boolean);
  const pascal = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  return `${pascal || "Kanban"}Board`;
}

/**
 * Rewrite imports so generated variant files reference the shared engine under
 * `components/kanban/` from inside `app/kanban/<slug>/...` (a `tableVariants`-style
 * layout). The variant bundle lives 2 levels deeper than the engine root, so
 * `../../components/kanban/<file>` is the stable relative path on every
 * supported project layout (`app/`, `src/app/`, flat).
 *
 * We pre-rewrite here instead of letting the CLI's alias-import-rewriter do it
 * because variant files skip the rewriter (`writeRegistryOutputFile` excludes
 * chart/table/kanban variants), which keeps variant bundles self-contained and
 * decoupled from the user's tsconfig `paths` shape.
 */
function rewriteVariantBundleImports(source: string): string {
  return source.replace(
    /from\s+(["'])@\/components\/kanban\/([^"']+)\1/g,
    "from $1../../components/kanban/$2$1",
  );
}

/** Strip the `src/` prefix the codegen adds (Vite-ism) so paths match the CLI install layout. */
function stripSrcPrefix(p: string): string {
  return p.replace(/^src\//, "");
}

/**
 * Build per-variant files for the CLI's `kanban/<slug>` bundle. The returned
 * paths are relative to the consumer project root (e.g.
 * `kanban/<slug>/<Component>.tsx` → `app/kanban/<slug>/...` after install).
 */
export function buildKanbanVariantFiles(
  config: KanbanBuilderConfig,
  cards: KanbanCardData[],
  variantSlug: string,
): KanbanVariantFile[] {
  const componentName = variantPageComponentName(variantSlug);
  const generated: GeneratedFile[] = generateKanbanFiles(
    config,
    cards,
    componentName,
  );

  return generated.map((file) => {
    // `src/boards/<Component>/<file>` → `kanban/<slug>/<file>`.
    const flat = stripSrcPrefix(file.path);
    // Drop the per-component subfolder the codegen adds (`boards/<Component>/`)
    // and replace with the variant slug folder. Preserves the basename.
    const baseName = flat.split("/").pop() ?? flat;
    const nested = `kanban/${variantSlug}/${baseName}`;

    const content = rewriteVariantBundleImports(file.code);
    return { path: nested, content };
  });
}
