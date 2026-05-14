/**
 * Variant-bundle builder for table variants (CLI-facing).
 *
 * Mirrors `app/form-builder/utils/codegen/variantBundle.ts` for the forms pipeline:
 * takes a `TableBuilderConfig` + `DataMode` + variant slug, calls `generateAllFiles`,
 * and rewrites the output into `tables/<slug>/` (resolved to `tableVariants` in the
 * consumer project, e.g. `app/tables/<slug>/`) — same pattern as form/chart variants.
 *
 * The shared engine files (`TablePreview.tsx`, `useTablePreview.ts`, `types.ts`,
 * `ui/table.tsx`) are NOT part of this bundle — they ship via
 * `public/registry/tables.json` and are installed separately by the CLI.
 */

import type { TableBuilderConfig } from "@/tables/types/types";

import { generateAllFiles, type DataMode } from "./tableCodeGenerator";

export interface TableVariantFile {
  /** Destination path inside the consumer project. */
  path: string;
  /** Raw file contents (with imports already rewritten for the install layout). */
  content: string;
}

/** `tables-users` → `UsersTable`, `tables-admin-reports` → `AdminReportsTable`. */
export function variantPageComponentName(variantSlug: string): string {
  const withoutPrefix = variantSlug.replace(/^tables-/, "");
  const parts = withoutPrefix.split(/[-_/]/).filter(Boolean);
  const pascal = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  return `${pascal || "Data"}Table`;
}

/**
 * Rewrite imports so generated variant files reference the shared engine under
 * `components/tables` when the variant is installed under `tableVariants` (e.g. `app/tables/<slug>/`).
 *
 * `generateAllFiles` emits paths like `src/components/tables/DataTable.tsx` and uses
 * relative imports (`./TablePreview`, `./tableConfig`, `./types`, `./useTableData`).
 */
function rewriteVariantBundleImports(source: string): string {
  return source
    .replace(/from\s+(["'])\.\/TablePreview\1/g, "from $1../../components/tables/TablePreview$1")
    .replace(/from\s+(["'])\.\/types\1/g, "from $1../../components/tables/types$1");
}

/** Strip the `src/` prefix the codegen adds (Vite-ism) so paths match the CLI install layout. */
function stripSrcPrefix(p: string): string {
  return p.replace(/^src\//, "");
}

/**
 * Build per-variant files for the CLI's `tables/<slug>` bundle. The returned paths are
 * relative to the consumer project root (e.g. `tables/<slug>/DataTable.tsx` → `app/tables/...` after install).
 */
export function buildTableVariantFiles(
  config: TableBuilderConfig,
  dataMode: DataMode,
  variantSlug: string,
): TableVariantFile[] {
  const generated = generateAllFiles(config, dataMode);
  const componentName = variantPageComponentName(variantSlug);

  return generated.map((file) => {
    // Example: `src/components/tables/DataTable.tsx` → `tables/<slug>/DataTable.tsx`.
    const flat = stripSrcPrefix(file.path);
    const nested = flat.replace(/^components\/tables\//, `tables/${variantSlug}/`);

    let content = rewriteVariantBundleImports(file.code);
    if (file.name === "DataTable.tsx") {
      content = content.replace(
        /export default function DataTable\b/,
        `export default function ${componentName}`,
      );
    }

    return { path: nested, content };
  });
}
