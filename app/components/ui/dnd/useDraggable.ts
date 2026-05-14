"use client";

/**
 * useDraggable — turn any element into a draggable handle.
 *
 * Usage:
 *   const { dragProps, isDragging } = useDraggable({
 *     id: card.id,
 *     data: { cardId: card.id, fromColumnId: col.id },
 *     preview: () => <KanbanCard card={card} />,
 *   });
 *   <div {...dragProps} data-dnd-item="true">…</div>
 *
 * Key behavior:
 *   - Activation distance: drag starts only after pointer moves > N px,
 *     so plain clicks still fire (good for "open card" handlers).
 *   - Pointer Events: works on touch + mouse + pen with no extra code.
 *   - We do NOT call setPointerCapture on the source — the pointer must
 *     stay free to hit-test drop zones underneath.
 *   - Sets `data-dnd-item="true"` so zones can find items, and
 *     `data-dragging="true"` on the source while active so the indexer
 *     skips it.
 */
import { useCallback, useMemo, useRef } from "react";
import { useDndContext } from "./DndContext";
import type { DragData, UseDraggableOptions } from "./types";

export function useDraggable<T extends DragData = DragData>(options: UseDraggableOptions<T>) {
  const { id, data, activationDistance = 5, disabled = false, preview } = options;
  const { beginDrag, active } = useDndContext();
  const startRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  // The source element is captured from the PointerEvent target on PointerDown.
  const elementRef = useRef<HTMLElement | null>(null);

  const isDragging = active?.id === id;

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (disabled) return;
    // Only primary pointer (left mouse / single touch / pen tip).
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Snapshot the source element on PointerDown so we can pass its size to
    // the provider when the activation distance is crossed.
    elementRef.current = event.currentTarget;
    startRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };

    const handleMove = (e: PointerEvent) => {
      const start = startRef.current;
      if (!start || start.pointerId !== e.pointerId) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (dx * dx + dy * dy < activationDistance * activationDistance) return;

      // Threshold crossed — promote to a real drag.
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      startRef.current = null;
      const rect = elementRef.current?.getBoundingClientRect();
      beginDrag(
        {
          id,
          data,
          preview,
          width: rect?.width ?? 0,
          height: rect?.height ?? 0,
          offsetX: rect ? start.x - rect.left : 0,
          offsetY: rect ? start.y - rect.top : 0,
          sourceLeft: rect?.left,
          sourceTop: rect?.top,
          sourceRight: rect?.right,
          sourceBottom: rect?.bottom,
        },
        e,
      );
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      startRef.current = null;
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  }, [activationDistance, beginDrag, data, disabled, id, preview]);

  const dragProps = useMemo(() => ({
    onPointerDown,
    "data-dnd-item": "true" as const,
    "data-dragging": isDragging ? ("true" as const) : ("false" as const),
    // Prevent the browser from also starting a native HTML5 drag (image / link
    // drags) which would conflict with our pointer-based logic.
    draggable: false,
    style: {
      touchAction: "none" as const, // disable scroll gestures while interacting
      userSelect: "none" as const,
      WebkitUserSelect: "none" as const,
    },
  }), [isDragging, onPointerDown]);

  return { dragProps, isDragging };
}
