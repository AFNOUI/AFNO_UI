"use client";

/**
 * useDropZone — turn any element into a target for dropped draggables.
 *
 * Usage:
 *   const { zoneProps, isOver, hoverIndex } = useDropZone({
 *     id: column.id,
 *     data: { columnId: column.id },
 *     onDrop: ({ item, index }) => moveCard(item.data.cardId, column.id, index),
 *   });
 *   <div ref={zoneProps.ref}>…</div>
 *
 * Key behavior:
 *   - Registers the zone with the provider so the global pointermove handler
 *     can hit-test it (no per-zone listeners → no flicker storms).
 *   - Returns `hoverIndex` (computed midpoint index) when this zone is the
 *     active hover target, else null. Use it to render a single drop indicator
 *     at the right slot.
 *   - The zone callback fires AT MOST ONCE per drop and never on cancels.
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDndContext } from "./DndContext";
import type { DragData, DropResult, UseDropZoneOptions } from "./types";

export function useDropZone<TZone extends DragData = DragData, TItem extends DragData = DragData>(
  options: UseDropZoneOptions<TZone, TItem>,
) {
  const { id, data, accepts, onDrop, disabled = false, axis = "y", getItemIndex } = options;
  const { active, hover, animationsEnabled, registerZone } = useDndContext();
  const elementRef = useRef<HTMLElement | null>(null);

  // Latest callbacks/data without forcing re-registration on every render.
  const handlersRef = useRef({ accepts, onDrop, data, getItemIndex });
  useEffect(() => {
    handlersRef.current = { accepts, onDrop, data, getItemIndex };
  }, [accepts, onDrop, data, getItemIndex]);

  const ref = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  // Register / unregister whenever the actual DOM node or id changes — but
  // NOT on every onDrop change, since we read those from handlersRef.
  useEffect(() => {
    if (disabled) return;
    const node = elementRef.current;
    if (!node) return;

    const unregister = registerZone({
      id,
      element: node,
      get data() { return (handlersRef.current.data ?? {}) as DragData; },
      accepts: (drag) => {
        const fn = handlersRef.current.accepts;
        return fn ? fn(drag as never) : true;
      },
      onDrop: (result) => {
        handlersRef.current.onDrop(result as DropResult<TItem, TZone>);
      },
      getItemIndex: (drag) => handlersRef.current.getItemIndex?.(drag as never) ?? null,
      axis,
    });
    return unregister;
    // We intentionally re-register if `disabled` flips. The element ref is set
    // by `ref` callback before this effect runs (React commits refs first).
  }, [disabled, id, registerZone, axis]);

  const isOver = hover?.zoneId === id;
  const hoverIndex = isOver ? hover.index : null;

  const zoneProps = useMemo(() => ({
    ref,
    "data-dnd-zone": id,
    "data-dnd-over": isOver ? ("true" as const) : ("false" as const),
  }), [id, isOver, ref]);

  /**
   * Returns the inline style each rendered item in this zone should spread to
   * smoothly translate out of the way when a drag hovers over this zone, so
   * a real-sized gap opens at the insertion point — matching the dragged
   * card's exact dimensions, not a thin indicator bar.
   *
   *   - axis "y" → translateY by the dragged item's height (+ gap).
   *   - axis "x" → translateX (negated in RTL containers).
   *
   * Returns `{}` when the zone is not the hover target, when there is no
   * active drag, or when animations are disabled (reduce-motion).
   */
  const getItemSlotStyle = useCallback(
    (itemIndex: number): React.CSSProperties => {
      if (!isOver || hoverIndex == null || !active) return {};
      // The drag source collapses to height 0 (handled by the caller), so we
      // can treat every drop the same way: shift every sibling at-or-after
      // hoverIndex by exactly one slot. This eliminates the "two cards in the
      // same row" overlap that happened with sourceIndex-based shifting.
      if (itemIndex < hoverIndex) return {};
      const gap = 8;
      const transition = animationsEnabled
        ? "transform 200ms cubic-bezier(0.2, 0, 0, 1)"
        : "none";
      if (axis === "x") {
        const dx = active.width + gap;
        const isRtl = elementRef.current
          ? window.getComputedStyle(elementRef.current).direction === "rtl"
          : false;
        return {
          transform: `translate3d(${isRtl ? -dx : dx}px, 0, 0)`,
          transition,
          willChange: "transform",
        };
      }
      return {
        transform: `translate3d(0, ${active.height + gap}px, 0)`,
        transition,
        willChange: "transform",
      };
    },
    [active, animationsEnabled, axis, hover, hoverIndex, id, isOver],
  );

  /** Size of the "ghost slot" placeholder rendered at the insertion point. */
  const slotSize = useMemo(
    () => ({ width: active?.width ?? 0, height: active?.height ?? 0 }),
    [active?.width, active?.height],
  );

  return {
    zoneProps,
    isOver,
    hoverIndex,
    isDragging: !!active,
    getItemSlotStyle,
    slotSize,
    animationsEnabled,
  };
}