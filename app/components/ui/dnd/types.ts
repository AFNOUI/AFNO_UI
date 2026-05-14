/**
 * Type contracts for the custom Pointer DnD library.
 *
 * The library is **pointer-event based** (not HTML5 native drag) so it:
 *   - never shows the OS ghost preview (no flicker)
 *   - works identically on touch & mouse via PointerEvents
 *   - lets us render a fully styled React overlay at the cursor
 *   - can autoscroll containers and cancel via Escape
 */

/** Anything the consumer wants to attach to a draggable. Stays type-safe via generics. */
export type DragData = Record<string, unknown>;

/** Snapshot of an active drag — passed to drop handlers. */
export interface DragSnapshot<T extends DragData = DragData> {
  /** Stable id of the dragged item. */
  id: string;
  /** Caller-supplied metadata (e.g. {cardId, fromColumnId, fromLane}). */
  data: T;
  /** Current pointer client coords. */
  clientX: number;
  clientY: number;
  /**
   * Bounding-box size of the dragged source element captured at drag start.
   * Used by drop zones to translate sibling items by the matching dimension
   * so a real "make room" gap opens, not just a thin indicator bar.
   */
  width: number;
  height: number;
  /** Pointer offset inside the source element at drag start. Keeps overlay under the cursor. */
  offsetX: number;
  offsetY: number;
  /** Source element bounds captured at drag start, used to avoid premature same-zone reflow. */
  sourceLeft?: number;
  sourceTop?: number;
  sourceRight?: number;
  sourceBottom?: number;
}

/** What a drop zone receives on a successful drop. */
export interface DropResult<TItem extends DragData = DragData, TZone extends DragData = DragData> {
  item: DragSnapshot<TItem>;
  zoneId: string;
  zoneData: TZone;
  /** Insertion index inside the zone (0..n) computed from pointer Y midpoints. */
  index: number;
  /** Pointer position at drop. */
  clientX: number;
  clientY: number;
}

/** Internal hover descriptor — shared via context so zones can render a single indicator. */
export interface HoverState {
  zoneId: string;
  index: number;
  /** Where the active item currently sits if it belongs to this same zone. */
  sourceIndex?: number;
}

/** Element registration for a drop zone (registered via useDropZone). */
export interface ZoneRegistration<TZone extends DragData = DragData> {
  id: string;
  data: TZone;
  element: HTMLElement;
  /** Should this zone accept the current drag? Defaults to true. */
  accepts?: (drag: DragSnapshot) => boolean;
  onDrop: (result: DropResult) => void;
  /** Return the active draggable's current index in this zone, or null if it is not from this zone. */
  getItemIndex?: (drag: DragSnapshot) => number | null;
  /**
   * Layout axis for index-resolution and edge autoscroll.
   *   "y"    — vertical list (default; index from Y midpoints)
   *   "x"    — horizontal list (index from X midpoints, X-axis autoscroll)
   *   "both" — autoscroll on either axis (kanban board scroll containers)
   *   "grid" — wrapping grid; index resolved row-then-column (Y, then X)
   */
  axis?: "x" | "y" | "both" | "grid";
}

export interface DndContextValue {
  /** Active drag snapshot, or null when idle. */
  active: DragSnapshot | null;
  /** Where the cursor is currently hovering (zone + computed insertion index). */
  hover: HoverState | null;
  /** Animations are honored by the lib. False when user opts out OR when the
   *  OS reports `prefers-reduced-motion: reduce`. */
  animationsEnabled: boolean;
  /** Register / unregister a drop zone. */
  registerZone: (registration: ZoneRegistration) => () => void;
  /** Begin a drag from a draggable. */
  beginDrag: (
    payload: {
      id: string;
      data: DragData;
      preview?: () => React.ReactNode;
      /** Size of the source element. Used to open a real-sized gap. */
      width: number;
      height: number;
      /** Pointer offset inside the source element. */
      offsetX: number;
      offsetY: number;
      sourceLeft?: number;
      sourceTop?: number;
      sourceRight?: number;
      sourceBottom?: number;
    },
    pointerEvent: PointerEvent,
  ) => void;
}

/** Options for useDraggable. */
export interface UseDraggableOptions<T extends DragData = DragData> {
  id: string;
  data: T;
  /** Pixels the pointer must move before a drag actually starts (default 5). */
  activationDistance?: number;
  /** Disable the draggable entirely. */
  disabled?: boolean;
  /** Optional custom React preview rendered inside the overlay. */
  preview?: () => React.ReactNode;
}

/** Options for useDropZone. */
export interface UseDropZoneOptions<TZone extends DragData = DragData, TItem extends DragData = DragData> {
  id: string;
  data?: TZone;
  accepts?: (drag: DragSnapshot<TItem>) => boolean;
  onDrop: (result: DropResult<TItem, TZone>) => void;
  /** Disable the zone entirely. */
  disabled?: boolean;
  /** Layout axis. Defaults to "y" (vertical list). */
  axis?: "x" | "y" | "both" | "grid";
  /** Return active draggable's current index in this zone; enables same-column make-room animation. */
  getItemIndex?: (drag: DragSnapshot<TItem>) => number | null;
}
