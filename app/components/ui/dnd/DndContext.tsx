/**
 * Custom Pointer DnD — Context Provider (shared library).
 *
 * Promoted from `src/components/kanban/dnd` so it can power any builder
 * (kanban, table rows, page-builder canvas, column reordering, …).
 *
 * Improvements over the kanban-only version:
 *   - **Axis-aware autoscroll.** A zone may declare `axis: "x"|"y"|"both"`.
 *     The provider scrolls the nearest scrollable ancestor on the matching
 *     axis when the pointer hugs an edge.
 *   - **Axis-aware index resolver.** When `axis: "x"` we compare X midpoints
 *     instead of Y, so horizontal lists (kanban columns, table column reorder)
 *     compute the correct insertion index.
 *   - Same single-render-per-slot-change flicker-killer as before.
 *   - Same Escape-to-cancel and pointer-event coverage.
 */
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import type {
  HoverState,
  DragSnapshot,
  DndContextValue,
  ZoneRegistration,
} from "./types";

const DndCtx = createContext<DndContextValue | null>(null);

const AUTOSCROLL_EDGE = 56;
const AUTOSCROLL_MAX_SPEED = 18;

function findScrollableAncestor(
  el: HTMLElement | null,
  axis: "x" | "y" | "both",
): HTMLElement | Window {
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const scrollableY =
      (overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight;
    const scrollableX =
      (overflowX === "auto" ||
        overflowX === "scroll" ||
        overflowX === "overlay") &&
      node.scrollWidth > node.clientWidth;
    if (axis === "y" && scrollableY) return node;
    if (axis === "x" && scrollableX) return node;
    if (axis === "both" && (scrollableX || scrollableY)) return node;
    node = node.parentElement;
  }
  return window;
}

function getScrollRect(target: HTMLElement | Window): DOMRect {
  if (target === window) {
    return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  }
  return (target as HTMLElement).getBoundingClientRect();
}

function scrollBy(target: HTMLElement | Window, dx: number, dy: number) {
  if (target === window) window.scrollBy(dx, dy);
  else {
    (target as HTMLElement).scrollTop += dy;
    (target as HTMLElement).scrollLeft += dx;
  }
}

function getDragCenter(snap: DragSnapshot) {
  return {
    x: snap.clientX - snap.offsetX + snap.width / 2,
    y: snap.clientY - snap.offsetY + snap.height / 2,
  };
}

function isPointInsideRect(x: number, y: number, rect: DOMRect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function isPointInsideSourceBounds(x: number, y: number, snap: DragSnapshot) {
  return (
    snap.sourceLeft != null &&
    snap.sourceRight != null &&
    snap.sourceTop != null &&
    snap.sourceBottom != null &&
    x >= snap.sourceLeft &&
    x <= snap.sourceRight &&
    y >= snap.sourceTop &&
    y <= snap.sourceBottom
  );
}

/**
 * Returns the index of a sibling item (excluding the dragged one) whose
 * bounding rect contains the given point, or null if the point is in a
 * gap / outside any sibling.
 */
function findSiblingIndexAt(
  zoneEl: HTMLElement,
  x: number,
  y: number,
): { visibleIndex: number; rect: DOMRect } | null {
  const items = zoneEl.querySelectorAll<HTMLElement>('[data-dnd-item="true"]');
  let visibleIndex = 0;
  for (let i = 0; i < items.length; i += 1) {
    const el = items[i];
    if (el.dataset.dragging === "true") continue;
    const rect = el.getBoundingClientRect();
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      return { visibleIndex, rect };
    }
    visibleIndex += 1;
  }
  return null;
}

/**
 * Compute the insertion index inside `zoneEl` based on pointer position.
 * `axis === "x"` → compare X midpoints. Otherwise → Y midpoints.
 * Excludes the currently-dragging item via `data-dragging="true"`.
 * For `axis === "x"` in RTL containers, the comparison is inverted so the
 * computed index matches the visual order (rightmost item = index 0 in RTL).
 */
function resolveDropIndex(
  zoneEl: HTMLElement,
  clientX: number,
  clientY: number,
  axis: "x" | "y" | "grid",
): number {
  const items = zoneEl.querySelectorAll<HTMLElement>('[data-dnd-item="true"]');
  const isRtl =
    (axis === "x" || axis === "grid") &&
    window.getComputedStyle(zoneEl).direction === "rtl";
  let count = 0;

  if (axis === "grid") {
    // Group items into visual rows by Y midpoint, then resolve by X within row.
    const visible: { el: HTMLElement; rect: DOMRect }[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const el = items[i];
      if (el.dataset.dragging === "true") continue;
      visible.push({ el, rect: el.getBoundingClientRect() });
    }
    if (visible.length === 0) return 0;

    const style = window.getComputedStyle(zoneEl);
    const columns = style.display.includes("grid")
      ? style.gridTemplateColumns.split(" ").filter(Boolean).length
      : 0;
    if (columns > 1) {
      const zoneRect = zoneEl.getBoundingClientRect();
      const columnGap = Number.parseFloat(style.columnGap) || 0;
      const rowGap = Number.parseFloat(style.rowGap) || 0;
      const cellWidth = (zoneRect.width - columnGap * (columns - 1)) / columns;
      const rowHeight = Math.max(...visible.map((item) => item.rect.height));
      const xInZone = Math.max(
        0,
        Math.min(clientX - zoneRect.left, zoneRect.width - 1),
      );
      const yInZone = Math.max(0, clientY - zoneRect.top);
      const trackWidth = cellWidth + columnGap;
      const rowStep = rowHeight + rowGap;
      const visualCol = Math.max(
        0,
        Math.min(columns - 1, Math.floor(xInZone / trackWidth)),
      );
      const col = isRtl ? columns - 1 - visualCol : visualCol;
      const row = Math.max(0, Math.floor(yInZone / rowStep));
      const rawIndex = row * columns + col;
      if (rawIndex >= visible.length) return visible.length;
      const cellStart = visualCol * trackWidth;
      const localX = xInZone - cellStart;
      const afterCellMidpoint = isRtl
        ? localX < cellWidth / 2
        : localX > cellWidth / 2;
      return Math.max(
        0,
        Math.min(visible.length, rawIndex + (afterCellMidpoint ? 1 : 0)),
      );
    }

    // Find the row the pointer is in (or before).
    for (let i = 0; i < visible.length; i += 1) {
      const { rect } = visible[i];
      const rowTop = rect.top;
      const rowBottom = rect.bottom;
      // Pointer above this item's row → insert here
      if (clientY < rowTop) return i;
      if (clientY <= rowBottom) {
        // Same row — pick by X midpoint
        const midX = rect.left + rect.width / 2;
        const before = isRtl ? clientX > midX : clientX < midX;
        if (before) return i;
      }
    }
    return visible.length;
  }

  for (let i = 0; i < items.length; i += 1) {
    const el = items[i];
    if (el.dataset.dragging === "true") continue;
    const rect = el.getBoundingClientRect();
    if (axis === "x") {
      const mid = rect.left + rect.width / 2;
      if (isRtl) {
        if (clientX > mid) return count;
      } else {
        if (clientX < mid) return count;
      }
    } else {
      if (clientY < rect.top + rect.height / 2) return count;
    }
    count += 1;
  }
  return count;
}

interface ProviderProps {
  children: ReactNode;
  onDragStart?: (snap: DragSnapshot) => void;
  onDragEnd?: (snap: DragSnapshot, dropped: boolean) => void;
  /**
   * Disable the smooth "make room" sibling translation animations.
   * Defaults to false. The provider also auto-disables animations when the
   * OS reports `prefers-reduced-motion: reduce`, regardless of this prop.
   */
  reduceMotion?: boolean;
}

export function DndProvider({
  children,
  onDragStart,
  onDragEnd,
  reduceMotion = false,
}: ProviderProps) {
  const zonesRef = useRef<Map<string, ZoneRegistration>>(new Map());
  const [active, setActive] = useState<DragSnapshot | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [overlay, setOverlay] = useState<{
    x: number;
    y: number;
    node: ReactNode;
  } | null>(null);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReducedMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const animationsEnabled = !reduceMotion && !systemReducedMotion;

  const activeRef = useRef<DragSnapshot | null>(null);
  const hoverRef = useRef<HoverState | null>(null);
  const dropZoneCacheRef = useRef<{
    zone: ZoneRegistration;
    rect: DOMRect;
  } | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  const registerZone = useCallback((registration: ZoneRegistration) => {
    zonesRef.current.set(registration.id, registration);
    return () => {
      zonesRef.current.delete(registration.id);
    };
  }, []);

  const findZoneAt = useCallback(
    (clientX: number, clientY: number, snap: DragSnapshot) => {
      let result: { zone: ZoneRegistration; rect: DOMRect } | null = null;
      for (const zone of zonesRef.current.values()) {
        if (zone.accepts && !zone.accepts(snap)) continue;
        const rect = zone.element.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          if (
            !result ||
            rect.width * rect.height < result.rect.width * result.rect.height
          ) {
            result = { zone, rect };
          }
        }
      }
      return result;
    },
    [],
  );

  // Auto-scroll while dragging near edges of the nearest scrollable ancestor of
  // the active drop-zone. Axis-aware so horizontal lists scroll horizontally.
  useEffect(() => {
    if (!active) return;
    let rafId = 0;
    let lastX = active.clientX;
    let lastY = active.clientY;

    const tick = () => {
      const cache = dropZoneCacheRef.current;
      const axis = (cache?.zone.axis ?? "y") as "x" | "y" | "both";
      const targetEl = cache
        ? findScrollableAncestor(cache.zone.element, axis)
        : window;
      const rect = getScrollRect(targetEl);

      let dx = 0;
      let dy = 0;
      if (axis === "y" || axis === "both") {
        const distFromTop = lastY - rect.top;
        const distFromBottom = rect.bottom - lastY;
        if (distFromTop < AUTOSCROLL_EDGE && distFromTop > 0) {
          dy =
            -((AUTOSCROLL_EDGE - distFromTop) / AUTOSCROLL_EDGE) *
            AUTOSCROLL_MAX_SPEED;
        } else if (distFromBottom < AUTOSCROLL_EDGE && distFromBottom > 0) {
          dy =
            ((AUTOSCROLL_EDGE - distFromBottom) / AUTOSCROLL_EDGE) *
            AUTOSCROLL_MAX_SPEED;
        }
      }
      if (axis === "x" || axis === "both") {
        const distFromLeft = lastX - rect.left;
        const distFromRight = rect.right - lastX;
        if (distFromLeft < AUTOSCROLL_EDGE && distFromLeft > 0) {
          dx =
            -((AUTOSCROLL_EDGE - distFromLeft) / AUTOSCROLL_EDGE) *
            AUTOSCROLL_MAX_SPEED;
        } else if (distFromRight < AUTOSCROLL_EDGE && distFromRight > 0) {
          dx =
            ((AUTOSCROLL_EDGE - distFromRight) / AUTOSCROLL_EDGE) *
            AUTOSCROLL_MAX_SPEED;
        }
      }
      if (dx !== 0 || dy !== 0) scrollBy(targetEl, dx, dy);
      rafId = requestAnimationFrame(tick);
    };

    const trackPos = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
    };
    window.addEventListener("pointermove", trackPos, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", trackPos);
      cancelAnimationFrame(rafId);
    };
  }, [active]);

  const beginDrag = useCallback<DndContextValue["beginDrag"]>(
    (payload, pointerEvent) => {
      const snap: DragSnapshot = {
        id: payload.id,
        data: payload.data,
        clientX: pointerEvent.clientX,
        clientY: pointerEvent.clientY,
        width: payload.width,
        height: payload.height,
        offsetX: payload.offsetX,
        offsetY: payload.offsetY,
        sourceLeft: payload.sourceLeft,
        sourceTop: payload.sourceTop,
        sourceRight: payload.sourceRight,
        sourceBottom: payload.sourceBottom,
      };
      setActive(snap);
      setOverlay({
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
        node: payload.preview ? payload.preview() : null,
      });
      if (typeof document !== "undefined") {
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }
      onDragStart?.(snap);

      let dropped = false;

      const handleMove = (event: PointerEvent) => {
        const next: DragSnapshot = {
          ...snap,
          clientX: event.clientX,
          clientY: event.clientY,
        };
        activeRef.current = next;
        setOverlay((prev) =>
          prev ? { ...prev, x: event.clientX, y: event.clientY } : prev,
        );

        const found = findZoneAt(event.clientX, event.clientY, next);
        dropZoneCacheRef.current = found;

        if (!found) {
          if (hoverRef.current !== null) {
            hoverRef.current = null;
            setHover(null);
          }
          return;
        }

        const zoneAxis = found.zone.axis;
        const axis = (
          zoneAxis === "x" ? "x" : zoneAxis === "grid" ? "grid" : "y"
        ) as "x" | "y" | "grid";
        const sourceIndex = found.zone.getItemIndex?.(next) ?? undefined;
        const center = getDragCenter(next);
        const prevHover = hoverRef.current;
        const sameZoneHover =
          prevHover && prevHover.zoneId === found.zone.id ? prevHover : null;

        let index: number;
        if (sourceIndex != null && sourceIndex >= 0) {
          // Sibling-based hit test: only update index when the cursor center is
          // actually inside another sibling. When in a gap, KEEP the previous
          // hover index to eliminate flicker as items reflow around the slot.
          const sibling = findSiblingIndexAt(
            found.zone.element,
            center.x,
            center.y,
          );
          if (sibling) {
            const horizontal = axis === "x" || axis === "grid";
            const mid = horizontal
              ? sibling.rect.left + sibling.rect.width / 2
              : sibling.rect.top + sibling.rect.height / 2;
            const coord = horizontal ? center.x : center.y;
            const after = coord > mid;
            index = sibling.visibleIndex + (after ? 1 : 0);
          } else if (sameZoneHover) {
            // Stay put in gaps — prevents flicker back to source position.
            index = sameZoneHover.index;
          } else {
            index = sourceIndex;
          }
        } else {
          index = resolveDropIndex(
            found.zone.element,
            center.x,
            center.y,
            axis,
          );
        }
        const nextHover: HoverState = {
          zoneId: found.zone.id,
          index,
          sourceIndex,
        };
        if (
          !prevHover ||
          prevHover.zoneId !== nextHover.zoneId ||
          prevHover.index !== nextHover.index ||
          prevHover.sourceIndex !== nextHover.sourceIndex
        ) {
          hoverRef.current = nextHover;
          setHover(nextHover);
        }
      };

      const cleanup = () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("pointercancel", handleCancel);
        window.removeEventListener("keydown", handleKey);
        activeRef.current = null;
        hoverRef.current = null;
        dropZoneCacheRef.current = null;
        setActive(null);
        setHover(null);
        setOverlay(null);
        if (typeof document !== "undefined") {
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        }
        onDragEnd?.(snap, dropped);
      };

      const handleUp = (event: PointerEvent) => {
        const cache = dropZoneCacheRef.current;
        const finalSnap = {
          ...(activeRef.current ?? snap),
          clientX: event.clientX,
          clientY: event.clientY,
        };
        if (cache) {
          // Trust the last visible hover index — that is exactly what the user
          // saw as the drop target. Recomputing here can land back on the source
          // because items have already shifted to make room for the drop slot.
          const lastHover = hoverRef.current;
          let index: number;
          if (lastHover && lastHover.zoneId === cache.zone.id) {
            index = lastHover.index;
          } else {
            const cAxis = cache.zone.axis;
            const axis = (
              cAxis === "x" ? "x" : cAxis === "grid" ? "grid" : "y"
            ) as "x" | "y" | "grid";
            const center = getDragCenter(finalSnap);
            index = resolveDropIndex(
              cache.zone.element,
              center.x,
              center.y,
              axis,
            );
          }
          try {
            cache.zone.onDrop({
              item: finalSnap,
              zoneId: cache.zone.id,
              zoneData: cache.zone.data,
              index,
              clientX: event.clientX,
              clientY: event.clientY,
            });
            dropped = true;
          } catch (err) {
            console.error("[dnd] onDrop handler threw:", err);
          }
        }
        cleanup();
      };

      const handleCancel = () => cleanup();
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") cleanup();
      };

      window.addEventListener("pointermove", handleMove, { passive: true });
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointercancel", handleCancel);
      window.addEventListener("keydown", handleKey);
    },
    [findZoneAt, onDragEnd, onDragStart],
  );

  const value = useMemo<DndContextValue>(
    () => ({
      active,
      hover,
      animationsEnabled,
      registerZone,
      beginDrag,
    }),
    [active, hover, animationsEnabled, registerZone, beginDrag],
  );

  return (
    <DndCtx.Provider value={value}>
      {children}
      {overlay &&
        typeof document !== "undefined" &&
        createPortal(
          (() => {
            const offX = active?.offsetX ?? 0;
            const offY = active?.offsetY ?? 0;
            const w = active?.width ?? 0;
            const h = active?.height ?? 0;
            const vw = typeof window !== "undefined" ? window.innerWidth : 0;
            const vh = typeof window !== "undefined" ? window.innerHeight : 0;
            const rawLeft = overlay.x - offX;
            const rawTop = overlay.y - offY;
            // Soft on-screen clamp: keep a small handle of the preview visible
            // rather than trying to fit the entire rectangle inside the
            // viewport. The old behavior (`left ≤ vw - w - 4`) broke wide
            // previews — e.g. a `flex-1` sortable row in the trash demo —
            // because as soon as `w` approached the viewport width, the
            // upper bound collapsed and the preview "stuck" mid-screen while
            // the cursor moved on. We now anchor on the cursor: it can drift
            // up to `MIN_VISIBLE` pixels past the preview's far edge, but no
            // further. That lets oversized previews slide partly off-screen
            // (so they keep tracking the pointer) without ever vanishing.
            const MIN_VISIBLE = 24;
            const minLeft = MIN_VISIBLE - Math.max(w, MIN_VISIBLE);
            const maxLeft = vw - MIN_VISIBLE;
            const minTop = MIN_VISIBLE - Math.max(h, MIN_VISIBLE);
            const maxTop = vh - MIN_VISIBLE;
            const left = Math.max(minLeft, Math.min(rawLeft, maxLeft));
            const top = Math.max(minTop, Math.min(rawTop, maxTop));
            return (
              <div
                style={{
                  position: "fixed",
                  left,
                  top,
                  pointerEvents: "none",
                  zIndex: 9999,
                  transform: "translateZ(0)",
                  opacity: 0.95,
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.18))",
                }}
                aria-hidden="true"
              >
                {overlay.node}
              </div>
            );
          })(),
          document.body,
        )}
    </DndCtx.Provider>
  );
}

export function useDndContext(): DndContextValue {
  const ctx = useContext(DndCtx);
  if (!ctx) {
    throw new Error("Custom DnD hooks must be used inside <DndProvider>.");
  }
  return ctx;
}
