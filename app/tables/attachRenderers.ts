/**
 * Single source of truth for wiring per-column renderers onto a table config.
 *
 * Resolution order applied at render time by the engine:
 *   column.renderCell  →  config.renderCell  →  built-in default
 *
 * O(n) single pass, no shallow-clone churn when a column has no override.
 */
import type { CellRenderer, TableColumnConfig } from "./types";

/** Map keyed by column id. */
export type CellRendererMap = Readonly<Record<string, CellRenderer | undefined>>;

export function attachCellRenderers(
  columns: readonly TableColumnConfig[],
  renderers: CellRendererMap,
): TableColumnConfig[] {
  const out: TableColumnConfig[] = new Array(columns.length);

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const renderer = renderers[col.id];
    out[i] = renderer ? { ...col, renderCell: renderer } : col;
  }

  return out;
}
