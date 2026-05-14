/**
 * Compatibility shim — the real DnD library lives at `src/lib/dnd`.
 * Kept so existing kanban imports keep resolving without churn.
 */
export {
  DndProvider,
  useDropZone,
  useDraggable,
  useDndContext,
  DropIndicator,
} from "@/components/ui/dnd";
export type {
  DragData,
  DropResult,
  HoverState,
  DragSnapshot,
  DndContextValue,
  ZoneRegistration,
  UseDropZoneOptions,
  UseDraggableOptions,
} from "@/components/ui/dnd";
