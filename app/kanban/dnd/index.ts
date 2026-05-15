/**
 * Compatibility shim — the real DnD library lives at `app/components/ui/dnd`
 * (in-repo) and ships to consumers under `components/dnd/*`. Kept so existing
 * kanban imports keep resolving without churn.
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
