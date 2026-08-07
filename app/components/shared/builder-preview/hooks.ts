"use client";

/**
 * Stateful logic for the builder responsive-preview system.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  MIN_PREVIEW_WIDTH,
  PREVIEW_KEY_STEP,
  PREVIEW_KEY_STEP_LARGE,
} from "./constants";
import { clampPreviewWidth, findPreset, matchPreset, snapPreviewWidth } from "./utils";
import type { BuilderPreviewApi, PreviewPresetId } from "./types";

export interface UseBuilderPreviewWidthOptions {
  /** Preset the frame boots at. Defaults to `"full"`. */
  defaultPreset?: PreviewPresetId;
}

/**
 * Owns the preview width: preset selection, edge dragging and the container
 * measurement both of those clamp against.
 *
 * The width is intentionally *not* persisted. It describes what the user is
 * checking right now, not how they want the builder configured — reopening a
 * builder pinned to 375px because of one check last Tuesday would read as a
 * bug, not as a restored preference.
 */
export function useBuilderPreviewWidth({
  defaultPreset = "full",
}: UseBuilderPreviewWidthOptions = {}): BuilderPreviewApi {
  const [width, setWidthState] = useState<number | null>(
    () => findPreset(defaultPreset)?.width ?? null,
  );
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── Measure the available space ─────────────────────────────────────────
  // Needed for more than cosmetics: the clamp, the "which presets fit" filter
  // and the "is this really full width?" check all read it. A window resize
  // listener would miss the sidebar collapsing, so observe the element.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    setContainerWidth(node.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const setWidth = useCallback((next: number | null) => {
    setWidthState(next === null ? null : Math.max(MIN_PREVIEW_WIDTH, Math.round(next)));
  }, []);

  const selectPreset = useCallback((id: PreviewPresetId) => {
    setWidthState(findPreset(id)?.width ?? null);
  }, []);

  // ── Edge dragging ───────────────────────────────────────────────────────
  // The starting width and the clamp bound are captured when the drag begins
  // rather than read live, so a `width` change mid-drag (our own `setWidthState`
  // calls, every pointermove) cannot shift the origin the delta is measured
  // from. That also keeps both handlers out of ref-during-render territory.
  const startResize = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // Left button / primary touch only — a right-click drag is not a resize.
      if (event.button !== 0) return;
      event.preventDefault();

      // Measured here rather than taken from state: a drag started in the same
      // frame as a layout change would otherwise clamp against a stale bound.
      const available = containerRef.current?.getBoundingClientRect().width ?? containerWidth;
      // Dragging from "full" starts at whatever full currently measures, so the
      // frame does not jump before it moves.
      const startWidth = width ?? available ?? MIN_PREVIEW_WIDTH;
      const sign = event.currentTarget.dataset.side === "start" ? -1 : 1;
      const startX = event.clientX;

      setIsResizing(true);

      const onMove = (move: PointerEvent) => {
        // Doubled: the frame is centred, so both edges travel and the pointer
        // must stay under the edge it grabbed.
        const delta = (move.clientX - startX) * sign * 2;
        setWidthState(snapPreviewWidth(clampPreviewWidth(startWidth + delta, available)));
      };

      const onEnd = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };

      // On `window`, not the handle: a fast drag outruns a 12px-wide element,
      // and releasing outside it must still end the drag.
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    },
    [width, containerWidth],
  );

  const handleResizeKey = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const available = containerWidth;
      const current = width ?? available ?? MIN_PREVIEW_WIDTH;
      const step = event.shiftKey ? PREVIEW_KEY_STEP_LARGE : PREVIEW_KEY_STEP;

      let next: number | null = null;
      if (event.key === "ArrowLeft") next = current - step;
      else if (event.key === "ArrowRight") next = current + step;
      else if (event.key === "Home") next = MIN_PREVIEW_WIDTH;
      else if (event.key === "End") next = available;
      else return;

      event.preventDefault();
      setWidthState(next === null ? null : clampPreviewWidth(next, available));
    },
    [width, containerWidth],
  );

  const presetId = matchPreset(width, containerWidth);
  const effectiveWidth =
    width === null
      ? containerWidth === null
        ? null
        : Math.round(containerWidth)
      : containerWidth === null
        ? width
        : Math.round(Math.min(width, containerWidth));

  return useMemo(
    () => ({
      width,
      presetId,
      effectiveWidth,
      maxWidth: containerWidth === null ? null : Math.round(containerWidth),
      isResizing,
      selectPreset,
      setWidth,
      containerRef,
      startResize,
      handleResizeKey,
    }),
    [
      width,
      presetId,
      effectiveWidth,
      containerWidth,
      isResizing,
      selectPreset,
      setWidth,
      startResize,
      handleResizeKey,
    ],
  );
}
