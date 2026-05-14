/**
 * Shared-engine files for the Kanban Builder.
 *
 * Thin barrel over `app/registry/kanbanRegistry.ts` — the actual source of each file
 * is read at build time by `scripts/build-kanban-registry.ts` (which regenerates
 * `app/registry/kanbanRegistryGenerated.ts`). This is the Next.js-safe equivalent of
 * a Vite `?raw` import: no drift, no copy/paste — the Export tab and the `/kanban`
 * page always see the live engine source.
 *
 * Mirrors `app/table-builder/utils/tableSharedFiles.ts`.
 */

import {
  SHARED_KANBAN_FILES as REGISTRY_SHARED_KANBAN_FILES,
  getSharedKanbanFiles,
  kanbanInstall,
  type SharedKanbanFile,
} from "@/registry/kanbanRegistry";

export type { SharedKanbanFile as SharedFile };

/**
 * Re-exported under the name historic call-sites use.
 *
 * Prefer `getSharedKanbanFiles(config)` from this module — it prunes the
 * helper files (`cellJsRunner.ts`, `rowDialogTemplate.ts`) that aren't
 * reachable from the active variant's config flags. This constant is the
 * un-pruned full bundle (kept for back-compat with any non-variant-aware
 * call sites).
 */
export const SHARED_KANBAN_FILES = REGISTRY_SHARED_KANBAN_FILES;

export { getSharedKanbanFiles };

/**
 * Runtime npm dependencies + UI components needed by the exported kanban.
 * Mirrors `KANBAN_DEPENDENCIES` from the legacy vite-style stub.
 */
export const KANBAN_DEPENDENCIES = {
  runtime: kanbanInstall.npmDependencies,
  dev: kanbanInstall.npmDevDependencies,
  uiComponents: kanbanInstall.uiComponents,
  notes: [
    `Requires shadcn/ui components: ${kanbanInstall.uiComponents.join(", ")}.`,
    "Bring `cn` from your `@/lib/utils` (clsx + tailwind-merge).",
    "DnD library is bundled — no @dnd-kit dependency.",
    "Import lib/dnd/dnd.css once at app entry (e.g. in your global stylesheet).",
  ],
} as const;
