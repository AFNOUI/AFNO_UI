/**
 * Shared types for the graph lib — used by FlowCanvas, FlowBuilder and the
 * search/sort/filter toolbar that overlays both /tree-builder and /flow.
 */

export type GraphSortDir = "asc" | "desc";

export interface GraphFilterState {
  search: string;
  /** Sort siblings of every parent by this metric. */
  sort: { field: "label" | "depth" | "children" | "custom" | "none"; dir: GraphSortDir };
  /** Active tag filters — a node passes if it has at least one. */
  tags: string[];
  /** Predicate name keyed by `predicates` map passed in by the consumer. */
  predicate?: string;
  /** Hide non-matches entirely instead of dimming. */
  mode: "dim" | "hide";
}

export const defaultGraphFilter: GraphFilterState = {
  search: "",
  sort: { field: "none", dir: "asc" },
  tags: [],
  predicate: undefined,
  mode: "dim",
};

/** Generic dataset attached to a node (e.g. enrolled students). */
export interface NodeDatasetColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "badge";
}

export interface NodeDataset {
  title?: string;
  columns: NodeDatasetColumn[];
  rows: Record<string, unknown>[];
}

/** A single named predicate the toolbar exposes (e.g. "Top 5 scorers"). */
export interface GraphPredicate<T = unknown> {
  id: string;
  label: string;
  description?: string;
  /** Returns true if the node should be kept. */
  test: (ctx: { label: string; tags: string[]; depth: number; meta: T }) => boolean;
}
