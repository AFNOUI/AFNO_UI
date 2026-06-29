/**
 * Kanban runtime types — installed alongside the engine via `afnoui add kanban/<variant>`.
 *
 * IMPORTANT: This file ships to the consumer's project. It must be import-clean
 * (no `@/kanban-builder/...` references, no template data, no helpers). Templates
 * and editor metadata live in `app/kanban-builder/data/kanbanBuilderTemplates.ts`,
 * which re-exports these types so existing builder code keeps working.
 */
/* ----------------------------------------------------------------
 * Render-function card API (mirrors `CellRenderer` for tables).
 * ----------------------------------------------------------------
 * Two-level resolution at render time (built into `KanbanBoard`):
 *   1. card.render        — per-card override   (highest priority)
 *   2. config.renderCard  — board-wide reusable renderer
 *   3. built-in <KanbanCard /> default          (fallback)
 *
 * Return `undefined` from either renderer to fall through to the
 * next level — handy when a reusable renderer only customises *some*
 * cards (e.g. only `priority === "urgent"`).
 */

import { ReactNode } from "react";

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

export interface KanbanCardRenderContext {
  /** The full card object. */
  card: KanbanCardData;
  /** Fields the board is configured to surface (e.g. ["priority","tags"]). */
  visibleFields: KanbanCardField[];
  /** Whether the board is in compact mode. */
  compact: boolean;
  /** True while the card is being dragged. */
  isDragging: boolean;
}
export type CardRenderer = (ctx: KanbanCardRenderContext) => ReactNode | undefined;

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
  /**
   * Per-card render override (highest priority). Receives a typed
   * `KanbanCardRenderContext`. Overrides `config.renderCard` and the
   * built-in <KanbanCard /> for this card only.
   */
  render?: CardRenderer;
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
  /** Allow drag and drop (cards). */
  enableDnd: boolean;
  /** Allow reordering columns by dragging their headers (board + compact layouts). */
  enableColumnDnd?: boolean;
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
    /**
     * Typed JSX renderer for the dialog body. Takes precedence over the
     * mustache `dialogTemplate` + `dialogJs` path when set.
     *
     * Resolution order:
     *   cardClickAction.renderDialog → cardClickAction.dialogTemplate → default field-grid
     */
    renderDialog?: CardDialogRenderer;
  };
  /**
   * Sandboxed JS snippet executed whenever DnD changes a card's column/index.
   * Receives `row` (= the change event { card, fromColumnId, toColumnId,
   * fromIndex, toIndex, cards }) and `helpers` (toast/copy/open). Use this
   * to call your backend (e.g. `helpers.fetch?.('PATCH', ...)`).
   */
  onCardChangeJs?: string;
  /**
   * Sandboxed JS snippet executed whenever DnD reorders columns. Receives
   * `row` (= { columns, fromIndex, toIndex }). Use to PATCH /columns.
   */
  onColumnsChangeJs?: string;
  /**
   * Board-wide reusable card renderer. Every card renders through this
   * unless it defines its own `card.render`. Return `undefined` to fall
   * through to the built-in `<KanbanCard />`.
   *
   * Resolution order at render time:
   *   card.render  ->  config.renderCard  ->  built-in default
   */
  renderCard?: CardRenderer;
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

export interface KanbanTemplate {
  title: string;
  description: string;
  complexity: KanbanComplexity;
  config: KanbanBuilderConfig;
  cards: KanbanCardData[];
  /**
   * Optional renderer source strings — when present, the code generator emits
   * a `renderers.tsx` file alongside `config.ts` / `data.ts`, matching the
   * tree-builder pattern. Live preview uses `config.renderCard` / `card.render`
   * directly; `rendererSources` is only consumed by the code generator.
   */
  rendererSources?: KanbanRendererSources;
}

/** Source-string descriptors mirroring `TreeRendererSources`. */
export interface KanbanRendererSources {
  imports?: string;
  reusable?: string;
  perCard?: Record<string, string>;
  /** Source of `cardClickAction.renderDialog` — typed JSX dialog renderer. */
  dialog?: string;
}

/** Context for a typed card-dialog renderer. */
export interface CardDialogRenderContext {
  card: KanbanCardData;
  /** Programmatically close the dialog. */
  close: () => void;
}
export type CardDialogRenderer = (
  ctx: CardDialogRenderContext,
) => ReactNode | undefined;
