/**
 * Table registry facade.
 *
 * Wraps `tableRegistryGenerated.ts` (produced by `scripts/build-tables-registry.ts`)
 * with the shape the Export tab + `/tables` page consume. Mirrors the role of
 * `app/registry/formRegistry.ts` for the forms stack.
 *
 * The "always-shipped" shared engine files live in the generated module — this
 * file adapts the shape and prunes engine helpers (`cellJsRunner.ts`,
 * `rowDialogTemplate.ts`) that aren't reachable from the active variant's
 * config flags. See `app/registry/kanbanRegistry.ts` for the same pattern.
 */

import type { TableBuilderConfig } from "@/tables/types/types";

import {
  generatedSharedTableFiles,
  tableInstall,
  tableRegistryGeneratedAt,
  type TableRegistryFile,
} from "./tableRegistryGenerated";

/**
 * A file (or informational note) rendered in the Export tab and on `/tables`.
 *
 * The shape matches what `TableExportTab.tsx` expects today and also lines up with
 * `GeneratedFile` from `tableCodeGenerator.ts` so the UI can render them interchangeably.
 */
export interface SharedTableFile {
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

function toSharedFile(file: TableRegistryFile): SharedTableFile {
  return {
    name: file.name,
    path: `src/${file.path}`,
    description: file.description,
    language: RE_EXPORT_LANGUAGE[file.language],
    code: file.code,
  };
}

/** Always-shipped engine files — copy these once into any project. */
export const SHARED_TABLE_FILES: SharedTableFile[] = generatedSharedTableFiles.map(toSharedFile);

// ── Variant feature-detection ──────────────────────────────────────────────

function variantUsesCellJs(config?: TableBuilderConfig): boolean {
  if (!config) return true;
  const row = config.rowClickAction;
  if (row && (row.type === "js" || row.dialogJs?.trim())) return true;
  for (const col of config.columns) {
    const a = col.clickAction;
    if (a && a.type === "js" && a.code?.trim()) return true;
  }
  return false;
}

function variantUsesRowDialogTemplate(config?: TableBuilderConfig): boolean {
  if (!config) return true;
  const row = config.rowClickAction;
  return Boolean(
    row?.dialogTemplate?.trim() ||
      row?.dialogTitle?.trim() ||
      row?.dialogDescription?.trim(),
  );
}

// ── Engine source rewriter ─────────────────────────────────────────────────

const CELL_JS_STUB =
  `// cellJsRunner not required for this variant — no JS click actions configured.\n` +
  `// Inline no-op stub matches the real signature so the engine still compiles when copied verbatim.\n` +
  `const runCellJs: (code: string, ctx: { row: Record<string, unknown>; value: unknown; el?: HTMLElement | null }) => boolean = () => false;`;

const ROW_DIALOG_STUB =
  `// rowDialogTemplate not required for this variant — no row-click dialog config (dialogTemplate / dialogTitle / dialogDescription).\n` +
  `// Inline no-op stubs match the real signatures so the engine still compiles when copied verbatim.\n` +
  `const renderRowDialogTemplate = (template: string): string => template;\n` +
  `const renderRowDialogText = (template: string): string => template;`;

const CELL_JS_IMPORT_RE =
  /^import\s*\{\s*runCellJs\s*\}\s*from\s*["'][^"']*cellJsRunner["'];?\s*$/m;

const ROW_DIALOG_IMPORT_RE =
  /^import\s*\{\s*renderRowDialogTemplate\s*,\s*renderRowDialogText\s*\}\s*from\s*["'][^"']*rowDialogTemplate["'];?\s*$/m;

function pruneEngineSource(
  file: SharedTableFile,
  opts: { usesCellJs: boolean; usesRowDialogTemplate: boolean },
): SharedTableFile {
  if (opts.usesCellJs && opts.usesRowDialogTemplate) return file;

  // Only the engine TSX file references these helpers at the top-level.
  if (file.name !== "TablePreview.tsx") return file;

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
export function getSharedTableFiles(
  config?: TableBuilderConfig,
): SharedTableFile[] {
  const usesCellJs = variantUsesCellJs(config);
  const usesRowDialogTemplate = variantUsesRowDialogTemplate(config);

  // Fast path — full bundle, no rewriting.
  if (usesCellJs && usesRowDialogTemplate) return SHARED_TABLE_FILES;

  const filtered = SHARED_TABLE_FILES.filter((f) => {
    if (!usesCellJs && f.name === "cellJsRunner.ts") return false;
    if (!usesRowDialogTemplate && f.name === "rowDialogTemplate.ts") return false;
    return true;
  });

  return filtered.map((f) =>
    pruneEngineSource(f, { usesCellJs, usesRowDialogTemplate }),
  );
}

export { tableInstall, tableRegistryGeneratedAt };
export type { TableRegistryFile };
