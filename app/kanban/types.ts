/**
 * Kanban runtime types — installed alongside the engine via `afnoui add kanban/<variant>`.
 *
 * IMPORTANT: This file ships to the consumer's project. It must be import-clean
 * (no `@/kanban-builder/...` references, no template data, no helpers). Templates
 * and editor metadata live in `app/kanban-builder/data/kanbanBuilderTemplates.ts`,
 * which re-exports these types so existing builder code keeps working.
 */

export type KanbanComplexity = "basic" | "intermediate" | "advanced" | "expert";

export type KanbanCardField =
  | "tags"
  | "priority"
  | "assignee"
  | "dueDate"
  | "comments"
  | "attachments"
  | "description"
  | "progress"
  | "estimate";

export interface KanbanColumnConfig {
  id: string;
  title: string;
  /** Optional WIP limit. Visual warning when exceeded. */
  wipLimit?: number;
  /** Tailwind/semantic color token for the column accent. */
  color?: string;
}

export interface KanbanCardData {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  tags?: string[];
  assignee?: string;
  dueDate?: string;
  comments?: number;
  attachments?: number;
  progress?: number;
  estimate?: string;
  /** Optional swimlane key (used when groupBy is enabled). */
  swimlane?: string;
}

export interface KanbanBuilderConfig {
  title: string;
  subtitle?: string;
  /**
   * Visual layout:
   *   "board"    — classic vertical columns (kanban)
   *   "compact"  — equal-size card grid
   *   "swimlane" — columns × lanes matrix grouped by an attribute
   *   "timeline" — horizontal time-bucket columns (e.g. weeks/sprints)
   *   "calendar" — month-style calendar grid (cards bucketed by dueDate)
   */
  layout: "board" | "compact" | "swimlane" | "timeline" | "calendar";
  columns: KanbanColumnConfig[];
  /** Which optional fields to render on cards. */
  visibleFields: KanbanCardField[];
  /** Allow drag and drop. */
  enableDnd: boolean;
  /** Show "+ Add card" button per column. */
  enableAddCard: boolean;
  /** Show column WIP limits + warnings. */
  enableWipLimits: boolean;
  /** When layout=swimlane, group cards by this key. */
  swimlaneKey?: "assignee" | "priority" | "swimlane";
  /** Show a header strip with column-level totals. */
  showColumnTotals: boolean;
  /** Compact card variant (less padding, no description). */
  compactCards: boolean;
  /** Reading direction. Affects column ordering, scrolling, and DnD math. */
  direction?: "ltr" | "rtl";
  /** Disable smooth sibling-translation animations during drag. */
  reduceMotion?: boolean;
  /**
   * When true, every column is constrained to a fixed max-height with
   * vertical overflow scroll. The DnD provider will auto-scroll the column
   * while dragging near its top/bottom edge, so users can place a card at
   * the very bottom of a long list.
   */
  scrollableColumns?: boolean;
  /** Max-height (in px) for scrollable columns. Defaults to 520. */
  columnMaxHeightPx?: number;
  /** Per-column infinite scroll/load-more support. */
  infiniteScroll?: {
    enabled: boolean;
    thresholdPx?: number;
    cursorByColumn?: Record<string, string | undefined>;
    hasMoreByColumn?: Record<string, boolean>;
  };
  /**
   * Generic card click dialog. When set, clicking a card opens a dialog
   * rendered from `dialogTemplate` (HTML/Tailwind w/ {{card.field}} mustache
   * substitution). Optional `dialogJs` runs after mount, sandboxed.
   */
  cardClickAction?: {
    dialogTemplate?: string;
    dialogJs?: string;
    dialogTitle?: string;
    dialogDescription?: string;
    dialogWidthClass?: string;
  };
  /**
   * Sandboxed JS snippet executed whenever DnD changes a card's column/index.
   * Receives `row` (= the change event { card, fromColumnId, toColumnId,
   * fromIndex, toIndex, cards }) and `helpers` (toast/copy/open).
   */
  onCardChangeJs?: string;
}

/** Emitted by KanbanBoard whenever DnD reorders or moves a card. */
export interface KanbanCardChangeEvent {
  card: KanbanCardData;
  fromColumnId: string;
  toColumnId: string;
  fromIndex: number;
  toIndex: number;
  /** Snapshot of the cards array AFTER the change. */
  cards: KanbanCardData[];
}

export interface KanbanLoadMoreEvent {
  columnId: string;
  lane?: string;
  cursor?: string;
}
