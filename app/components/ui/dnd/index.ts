/**
 * Custom Pointer DnD library — public surface.
 *
 * A lightweight, pointer-event–based drag-and-drop primitive. More advanced
 * than the browser's native HTML5 drag API in several ways:
 *
 *   - **No flicker.** A single React state update per drop-slot change.
 *   - **Custom overlay.** A real React node follows the cursor.
 *   - **Activation distance.** Plain clicks still fire (>5px to start drag).
 *   - **Touch + mouse + pen** via Pointer Events.
 *   - **Axis-aware autoscroll** (vertical, horizontal, or both).
 *   - **Axis-aware index resolution** for vertical and horizontal lists.
 *   - **Escape to cancel.**
 *   - **Type-safe payloads** via generics.
 *
 * Used by: kanban board, table-builder row reorder + column reorder,
 * page-builder canvas, and anywhere else in the codebase that needs DnD.
 * Replaces all `@dnd-kit/*` usage.
 */
export { DndProvider, useDndContext } from "./DndContext";
export { useDraggable } from "./useDraggable";
export { useDropZone } from "./useDropZone";
export { DropIndicator } from "./DropIndicator";
export type {
  DragData,
  DragSnapshot,
  DropResult,
  HoverState,
  UseDraggableOptions,
  UseDropZoneOptions,
  ZoneRegistration,
  DndContextValue,
} from "./types";
