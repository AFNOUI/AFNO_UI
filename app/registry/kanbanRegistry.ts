/**
 * Kanban registry facade.
 *
 * Wraps `kanbanRegistryGenerated.ts` (produced by `scripts/build-kanban-registry.ts`)
 * with the shape the Export tab + `/kanban` page consume. Mirrors the role of
 * `app/registry/tableRegistry.ts` for the table stack.
 *
 * The shared engine files live in the generated module — this file only adapts
 * the shape so the Export tab can render generated + shared files
 * interchangeably and prunes engine helpers that the active variant config
 * doesn't use.
 *
 * ── Conditional helpers ─────────────────────────────────────────────────────
 * `cellJsRunner.ts` and `rowDialogTemplate.ts` are imported at the top of the
 * engine, but every call site is gated behind config flags
 * (`onCardChangeJs`, `cardClickAction.dialogJs`, `cardClickAction.dialogTemplate`,
 * `cardClickAction.dialogTitle`, `cardClickAction.dialogDescription`). When a
 * variant's config doesn't enable any of those, the helpers are dead code and
 * shouldn't appear in the per-variant file list. We swap the engine imports
 * for tiny inline no-op stubs so the displayed engine source still compiles
 * if someone copies it verbatim — the gated branches are simply unreachable
 * for that variant.
 */

import type { KanbanBuilderConfig } from "@/kanban/types";

import {
  generatedSharedKanbanFiles,
  kanbanInstall,
  kanbanRegistryGeneratedAt,
  type KanbanRegistryFile,
} from "./kanbanRegistryGenerated";

export interface SharedKanbanFile {
  name: string;
  path: string;
  description: string;
  language: "tsx" | "ts" | "css";
  code: string;
}

const RE_EXPORT_LANGUAGE = {
  typescript: "ts" as const,
  tsx: "tsx" as const,
  css: "css" as const,
};

function toSharedFile(file: KanbanRegistryFile): SharedKanbanFile {
  return {
    name: file.name,
    path: `src/${file.path}`,
    description: file.description,
    language: RE_EXPORT_LANGUAGE[file.language],
    code: file.code,
  };
}

/** Always-shipped engine files — copy these once into any project. */
export const SHARED_KANBAN_FILES: SharedKanbanFile[] = generatedSharedKanbanFiles.map(toSharedFile);

// ── Variant feature-detection ──────────────────────────────────────────────

function variantUsesCellJs(config?: KanbanBuilderConfig): boolean {
  if (!config) return true;
  return Boolean(
    config.onCardChangeJs?.trim() || config.cardClickAction?.dialogJs?.trim(),
  );
}

function variantUsesRowDialogTemplate(config?: KanbanBuilderConfig): boolean {
  if (!config) return true;
  const a = config.cardClickAction;
  return Boolean(
    a?.dialogTemplate?.trim() ||
      a?.dialogTitle?.trim() ||
      a?.dialogDescription?.trim(),
  );
}

// ── Engine source rewriter ─────────────────────────────────────────────────
//
// Replaces the relative `../tables/cellJsRunner` and `../tables/rowDialogTemplate`
// imports inside the engine source with inline no-op stubs that match the
// helper signatures. Used only when the active variant doesn't exercise the
// gated branches — keeps the engine self-contained and the displayed file
// count honest.

const CELL_JS_STUB =
  `// cellJsRunner not required for this variant — gated config flags (onCardChangeJs, dialogJs) are unset.\n` +
  `// Inline no-op stub matches the real signature so the engine still compiles when copied verbatim.\n` +
  `const runCellJs: (code: string, ctx: { row: Record<string, unknown>; value: unknown; el?: HTMLElement | null }) => boolean = () => false;`;

const ROW_DIALOG_STUB =
  `// rowDialogTemplate not required for this variant — no card-click dialog config (dialogTemplate / dialogTitle / dialogDescription).\n` +
  `// Inline no-op stubs match the real signatures so the engine still compiles when copied verbatim.\n` +
  `const renderRowDialogTemplate = (template: string): string => template;\n` +
  `const renderRowDialogText = (template: string): string => template;`;

const CELL_JS_IMPORT_RE =
  /^import\s*\{\s*runCellJs\s*\}\s*from\s*["'][^"']*cellJsRunner["'];?\s*$/m;

const ROW_DIALOG_IMPORT_RE =
  /^import\s*\{\s*renderRowDialogTemplate\s*,\s*renderRowDialogText\s*\}\s*from\s*["'][^"']*rowDialogTemplate["'];?\s*$/m;

function pruneEngineSource(
  file: SharedKanbanFile,
  opts: { usesCellJs: boolean; usesRowDialogTemplate: boolean },
): SharedKanbanFile {
  if (opts.usesCellJs && opts.usesRowDialogTemplate) return file;

  // Only the engine TSX files reference these helpers at the top-level.
  const isEngine =
    file.name === "KanbanBoard.tsx" ||
    file.name === "KanbanCard.tsx" ||
    file.name === "KanbanCardDialog.tsx" ||
    file.name === "KanbanAddCardDialog.tsx";
  if (!isEngine) return file;

  let code = file.code;
  let mutated = false;

  if (!opts.usesCellJs && CELL_JS_IMPORT_RE.test(code)) {
    code = code.replace(CELL_JS_IMPORT_RE, CELL_JS_STUB);
    mutated = true;
  }

  if (!opts.usesRowDialogTemplate && ROW_DIALOG_IMPORT_RE.test(code)) {
    code = code.replace(ROW_DIALOG_IMPORT_RE, ROW_DIALOG_STUB);
    mutated = true;
  }

  return mutated ? { ...file, code } : file;
}

/**
 * Variant-aware list of engine files. Pass the active variant config to prune
 * helpers that aren't reachable from its config flags. Without a config we
 * return the full engine bundle (back-compat with callers that haven't been
 * variant-aware'd yet).
 */
export function getSharedKanbanFiles(
  config?: KanbanBuilderConfig,
): SharedKanbanFile[] {
  const usesCellJs = variantUsesCellJs(config);
  const usesRowDialogTemplate = variantUsesRowDialogTemplate(config);

  // Fast path — full bundle, no rewriting.
  if (usesCellJs && usesRowDialogTemplate) return SHARED_KANBAN_FILES;

  const filtered = SHARED_KANBAN_FILES.filter((f) => {
    if (!usesCellJs && f.name === "cellJsRunner.ts") return false;
    if (!usesRowDialogTemplate && f.name === "rowDialogTemplate.ts") return false;
    return true;
  });

  return filtered.map((f) =>
    pruneEngineSource(f, { usesCellJs, usesRowDialogTemplate }),
  );
}

export { kanbanInstall, kanbanRegistryGeneratedAt };
export type { KanbanRegistryFile };
