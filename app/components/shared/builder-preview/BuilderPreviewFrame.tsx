"use client";

import { cn } from "@/lib/utils";

import { MIN_PREVIEW_WIDTH } from "./constants";
import { useBuilderPreviewWidth } from "./hooks";
import { PreviewResizeHandle } from "./primitives/PreviewResizeHandle";
import { BuilderPreviewToolbar } from "./controls/BuilderPreviewToolbar";
import type { PreviewPresetId } from "./types";

export interface BuilderPreviewFrameProps {
  children: React.ReactNode;
  /** Width the frame boots at. Defaults to `"full"`. */
  defaultPreset?: PreviewPresetId;
  /** Extra toolbar controls, placed after the width readout. */
  toolbar?: React.ReactNode;
  className?: string;
}

/**
 * FRAME — the responsive preview canvas shared by the form, table and kanban
 * builders.
 *
 * Constrains its children to a chosen width so a build can be checked at phone,
 * tablet and laptop sizes without resizing the browser — which, on a builder
 * page with a 340px settings sidebar, would not reproduce the target width
 * anyway.
 *
 * It constrains rather than scales: no `transform`, no iframe. The preview is
 * the real component at a real width, so its media queries and container
 * queries resolve exactly as they will in the consumer's project. A scaled
 * screenshot would look right and test nothing.
 *
 * The flow builder deliberately does not use this — `<TreeCanvas />` owns its
 * own pan/zoom viewport, and nesting one viewport inside another would give the
 * user two competing ways to change the same thing.
 */
export function BuilderPreviewFrame({
  children,
  defaultPreset = "full",
  toolbar,
  className,
}: BuilderPreviewFrameProps) {
  const preview = useBuilderPreviewWidth({ defaultPreset });
  const { width, maxWidth, isResizing, containerRef, startResize, handleResizeKey } = preview;

  // Dragging needs somewhere to drag *to*. On a phone the container is already
  // near the minimum, so the handles would be decorative — and they would eat
  // 24px of the little horizontal space there is.
  const canResize = maxWidth !== null && maxWidth > MIN_PREVIEW_WIDTH + 80;

  return (
    <div className={cn("space-y-3", className)}>
      <BuilderPreviewToolbar preview={preview}>{toolbar}</BuilderPreviewToolbar>

      {/* Horizontal padding reserves the gutter the handles hang in, so they
          are never clipped by the surrounding card. */}
      <div ref={containerRef} className="px-3">
        <div
          className={cn(
            "relative mx-auto w-full",
            // Suppressed mid-drag: a 200ms ease on max-width makes the frame
            // lag the pointer, which reads as jank rather than as smoothing.
            !isResizing && "transition-[max-width] duration-200 ease-out",
          )}
          style={{ maxWidth: width === null ? undefined : `${width}px` }}
        >
          {canResize ? (
            <>
              <PreviewResizeHandle
                side="start"
                value={width}
                max={maxWidth}
                onPointerDown={startResize}
                onKeyDown={handleResizeKey}
              />
              <PreviewResizeHandle
                side="end"
                value={width}
                max={maxWidth}
                onPointerDown={startResize}
                onKeyDown={handleResizeKey}
              />
            </>
          ) : null}

          {/* `min-w-0` so a wide child (a table, a board) scrolls inside the
              frame instead of forcing the frame past its constraint. */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
