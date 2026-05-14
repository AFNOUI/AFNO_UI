/**
 * Shared-engine files for the Data Table Builder.
 *
 * Thin barrel over `app/registry/tableRegistry.ts` — the actual source of each file is
 * read at build time by `scripts/build-tables-registry.ts` (which regenerates
 * `app/registry/tableRegistryGenerated.ts`). Consumers stay import-compatible with
 * their existing `@/table-builder/utils/tableSharedFiles` specifier.
 *
 * This is the Next.js-safe equivalent of a Vite `?raw` import: no drift, no copy/paste
 * — the Export tab and `/tables` page always see the live engine source.
 *
 * Prefer `getSharedTableFiles(config)` over the raw `SHARED_TABLE_FILES` constant —
 * it prunes engine helpers (cellJsRunner / rowDialogTemplate) the active variant
 * doesn't reach and rewrites the engine imports into inline no-op stubs so the
 * displayed source still compiles. The constant is kept for back-compat with
 * non-variant-aware call sites.
 */

export {
  SHARED_TABLE_FILES,
  getSharedTableFiles,
} from "@/registry/tableRegistry";
export type { SharedTableFile as SharedFile } from "@/registry/tableRegistry";
