/**
 * src/lib/graph — shared utilities for tree + flow canvases.
 *
 * Provides a search/sort/filter toolbar, a per-node dataset table, and the
 * underlying filter hook. Used by /tree-builder, /flow and /flow-builder.
 */
export {
  defaultGraphFilter,
  type NodeDataset,
  type GraphSortDir,
  type GraphPredicate,
  type GraphFilterState,
  type NodeDatasetColumn,
} from "./types";
export { GraphToolbar } from "./GraphToolbar";
export { useGraphFilter } from "./useGraphFilter";
export type { FilterableNode, FilterResult } from "./useGraphFilter";
