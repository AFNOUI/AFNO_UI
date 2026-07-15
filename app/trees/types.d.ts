/**
 * Public types for the TreeCanvas engine.
 *
 * The tree is a recursive `TreeNode` structure. Layouts are computed purely
 * from this data — no external graph library is needed.
 */

import type { ReactNode } from "react";

export type TreeLayout =
  | "horizontal"   // root → leaves left-to-right (workflow / pipeline style, like the reference screenshot)
  | "vertical"     // root → leaves top-to-bottom (classic org chart)
  | "radial"       // root in centre, descendants on concentric rings
  | "mindmap"      // root in centre, branches alternate left/right
  | "org";         // boxed org-chart with sibling spread + thicker connectors

export type NodeShape = "rect" | "rounded" | "pill" | "diamond" | "circle";

/* ----------------------------------------------------------------
 * Render-function node API (shadcn DataTable cell-def style).
 * ----------------------------------------------------------------
 * Two-level resolution at render time:
 *   1. node.meta.render — per-node override   (highest priority)
 *   2. config.renderNode — flow-wide reusable renderer
 *   3. built-in default body — label + optional description
 */
export interface NodeRenderContext {
  node: TreeNode;
  childCount: number;
  depth: number;
  isRoot: boolean;
}
export type NodeRenderer = (ctx: NodeRenderContext) => ReactNode;

/** Per-node visual / behavioural metadata. Optional everywhere. */
export interface TreeNodeMeta {
  badge?: string;
  badgeColor?: string;        // tailwind / css color token (eg "primary")
  description?: string;
  icon?: string;              // lucide name; renderer maps strings → component
  color?: string;             // accent color for node frame
  shape?: NodeShape;
  /** Marks this node as locked — disables add/edit/remove on it. */
  locked?: boolean;
  /** Optional tags used by the GraphToolbar for chip filters. */
  tags?: string[];
  /** Sortable numeric / string key used by the toolbar's "custom" sort. */
  sortKey?: number | string;
  /** Per-node row dataset — exposed via the NodeDataTable dialog. */
  dataset?: import("@/components/ui/graph/types").NodeDataset;
  /** Whitelist of feature toggles enabled on this node (used by Flow Builder). */
  features?: string[];
  /** Max number of children this node may have. `null`/undefined = unlimited. */
  maxChildren?: number | null;
  /** Label rendered on the edge from this node's parent → this node (n8n / mindmap style). */
  edgeLabel?: string;
  /** What happens when this node is clicked in the Preview. */
  action?: TreeNodeAction;
  /** Free-position offset (px) applied on top of the auto layout. Set via Alt+drag. */
  positionOffset?: { dx: number; dy: number };
  /** Per-node permission overrides — only effective when the global config flag is true. */
  permissions?: { add?: boolean; edit?: boolean; delete?: boolean; drag?: boolean };
  /**
   * Per-node restriction on which drop modes are valid when other nodes are
   * dragged onto this one. Missing keys inherit from `TreeCanvasConfig.dragModes`
   * (which itself defaults to all three on).
   */
  dragModes?: { child?: boolean; before?: boolean; after?: boolean };
  /**
   * Per-instance whitelist of blueprint ids that may be added as children of
   * this node. Used together with `TreeCanvasConfig.nodeBlueprints`. When set
   * (even to an empty array), the add-child button opens a typed picker
   * instead of inserting a generic "New Step" node.
   */
  allowedChildren?: string[];
  /** This node's blueprint id (informational — surfaced in tooling). */
  blueprintId?: string;
  /** Per-node render function — full control over this node's body. */
  render?: NodeRenderer;
}

/**
 * A node blueprint — defines a reusable node "type" (trigger, action, etc.)
 * with a default label and meta. Referenced by id from `meta.allowedChildren`
 * to gate which child types can be added under each node.
 */
export interface NodeBlueprint {
  /** Default label given to new nodes of this blueprint. */
  label: string;
  /** Default meta applied to new nodes of this blueprint. */
  meta?: Partial<TreeNodeMeta>;
  /** Optional human description shown in the add-child picker. */
  description?: string;
}

export type TreeNodeAction =
  | { kind: "none" }
  | { kind: "dialog"; title?: string; body?: string }
  | { kind: "drawer"; title?: string; body?: string }
  | { kind: "panel"; title?: string; body?: string }
  | { kind: "route"; href: string; label?: string }
  | { kind: "table-dialog"; title?: string }
  | { kind: "table-panel"; title?: string };


export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  meta?: TreeNodeMeta;
}

/** Configuration that drives a TreeCanvas instance — lives next to data. */
export interface TreeCanvasConfig {
  title: string;
  subtitle?: string;
  layout: TreeLayout;
  /** Spacing between siblings (px). */
  siblingGap?: number;
  /** Spacing between depth levels (px). */
  levelGap?: number;
  /** Default node visual style. */
  nodeShape?: NodeShape;
  /** Show a small +/- button on each node (interactive editing). */
  editable?: boolean;
  /** Show the level label above each level (eg "PICK", "PACK"). */
  showLevelLabels?: boolean;
  /** Connector style. */
  connector?: "straight" | "stepped" | "curved" | "dashed";
  /** Enable pan + zoom on the canvas viewport. */
  panZoom?: boolean;
  /** Background pattern. */
  background?: "none" | "dots" | "grid" | "cross" | "diagonal" | "blueprint";
  /** Custom min height for the canvas (px). */
  minHeight?: number;
  /** Enable drag-and-drop reparenting / sibling re-ordering. */
  draggable?: boolean;
  /**
   * Flip the drop indicator axis: horizontal flows show top/bottom drop
   * zones, vertical flows show left/right. Independent of any other flag.
   */
  siblingDndAxisInverted?: boolean;
  /** Show ◀ ▶ / ▲ ▼ chevrons on each node so users can re-order without dragging. */
  showPositionControls?: boolean;
  /** When true, hides every interactive affordance (add / rename / remove / drag). */
  readOnly?: boolean;
  /** Direction — "rtl" mirrors horizontal layouts. Defaults to document.dir or "ltr". */
  dir?: "ltr" | "rtl";
  /** Enable free positioning via Alt+drag — persists `meta.positionOffset` on a node. */
  allowFreePosition?: boolean;
  /** Global permission gates. A node's `meta.permissions` can only further restrict. */
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowDrag?: boolean;
  /**
   * Global drop-mode gate. A node's `meta.dragModes` can further restrict per-node.
   * Defaults to all three on. Set any to `false` to forbid that drop mode flow-wide.
   */
  dragModes?: { child?: boolean; before?: boolean; after?: boolean };
  /** Show the GraphToolbar (search / sort / filter) above the canvas in Preview. */
  showToolbar?: boolean;
  /**
   * Flow-wide reusable node renderer (shadcn DataTable column-def style).
   * Every node uses this unless it sets its own `meta.render`. When neither
   * is set, the built-in default body (label + description) is used.
   */
  renderNode?: NodeRenderer;
  /**
   * Registry of node blueprints (= node "types"). When set, nodes whose
   * `meta.allowedChildren` references blueprint ids show a typed picker on
   * their add-child button instead of inserting a generic node. Cleaner than
   * declaring `allowedChildren` per-instance — define the rules once here,
   * reference them by id everywhere.
   */
  nodeBlueprints?: Record<string, NodeBlueprint>;
}

export type TreeMoveMode = "child" | "before" | "after";

/** Event payloads — mirrored as separate handlers on the public component. */
export interface TreeNodeAddEvent {
  parent: TreeNode;
  newNode: TreeNode;
  tree: TreeNode;
}
export interface TreeNodeUpdateEvent {
  node: TreeNode;
  prev: TreeNode;
  tree: TreeNode;
}
export interface TreeNodeRemoveEvent {
  node: TreeNode;
  parent: TreeNode | null;
  tree: TreeNode;
}

/** Fired when a node is dragged onto another node and dropped. */
export interface TreeNodeMoveEvent {
  node: TreeNode;
  /** Where the node lived before the move. */
  prev: { parentId: string | null; index: number };
  /** Where the node was dropped. */
  next: { parentId: string; index: number; mode: TreeMoveMode };
  tree: TreeNode;
}

export interface TreeCanvasHandlers {
  onNodeAdd?: (event: TreeNodeAddEvent) => void;
  onNodeUpdate?: (event: TreeNodeUpdateEvent) => void;
  onNodeRemove?: (event: TreeNodeRemoveEvent) => void;
  onNodeMove?: (event: TreeNodeMoveEvent) => void;
  /** Fired when a node body is clicked (no drag). Useful for opening detail panels. */
  onNodeClick?: (node: TreeNode) => void;
}
