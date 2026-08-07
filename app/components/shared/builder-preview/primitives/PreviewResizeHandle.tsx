"use client";

import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

import { MIN_PREVIEW_WIDTH } from "../constants";

export interface PreviewResizeHandleProps {
  /** Which edge of the frame this handle sits on. */
  side: "start" | "end";
  /** Current preview width, for the ARIA value. */
  value: number | null;
  /** Widest width the container can honour, for the ARIA range. */
  max: number | null;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  className?: string;
}

/**
 * PRIMITIVE — a draggable edge of the preview frame.
 *
 * `role="separator"` with `tabIndex={0}` because dragging cannot be the only
 * way to reach a width: the handler this is wired to also takes arrow keys,
 * Home and End, so the control is operable without a pointer.
 *
 * The hit area is deliberately wider than the visible rule — a 1px target is
 * unusable, and the grip only becomes visible on hover or focus so it does not
 * compete with the component being previewed.
 */
export function PreviewResizeHandle({
  side,
  value,
  max,
  onPointerDown,
  onKeyDown,
  className,
}: PreviewResizeHandleProps) {
  return (
    <div
      role="separator"
      tabIndex={0}
      data-side={side}
      aria-orientation="vertical"
      aria-label={`Resize preview from the ${side === "start" ? "left" : "right"} edge`}
      aria-valuenow={value ?? max ?? undefined}
      aria-valuemin={MIN_PREVIEW_WIDTH}
      aria-valuemax={max ?? undefined}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cn(
        "group absolute inset-y-0 z-10 flex w-3 cursor-ew-resize touch-none items-center justify-center",
        "focus-visible:outline-none",
        side === "start" ? "-start-3" : "-end-3",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-10 w-3 items-center justify-center rounded-full opacity-0 transition-opacity",
          "bg-border/80 group-hover:opacity-100 group-focus-visible:opacity-100",
          "group-focus-visible:ring-2 group-focus-visible:ring-ring",
        )}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </span>
    </div>
  );
}
