"use client";

import { cn } from "@/lib/utils";

import { PreviewWidthButton } from "../primitives/PreviewWidthButton";
import { availablePresets } from "../utils";
import type { BuilderPreviewApi } from "../types";

export interface BuilderPreviewToolbarProps {
  preview: BuilderPreviewApi;
  /** Extra controls for the right-hand side (a form builder's library picker). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * CONTROL — the width switcher above a preview canvas.
 *
 * Presets on the left, live width readout on the right, caller-supplied extras
 * after it. Fixing that order here is the same bargain the builder header
 * makes: pages choose what to add, never where it lands.
 */
export function BuilderPreviewToolbar({
  preview,
  children,
  className,
}: BuilderPreviewToolbarProps) {
  const { presetId, effectiveWidth, maxWidth, selectPreset } = preview;
  const presets = availablePresets(maxWidth);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <div
        role="group"
        aria-label="Preview width"
        className="inline-flex items-center gap-0.5 rounded-(--radius) border border-border bg-muted/40 p-0.5"
      >
        {presets.map((preset) => (
          <PreviewWidthButton
            key={preset.id}
            preset={preset}
            active={presetId === preset.id}
            onSelect={selectPreset}
          />
        ))}
      </div>

      {/* Muted caption, not a control — it reports, it does not accept input.
          `aria-live` because dragging an edge changes it with no other cue for
          a screen-reader user. */}
      {effectiveWidth !== null ? (
        <span
          aria-live="polite"
          className="text-xs tabular-nums text-muted-foreground"
        >
          {effectiveWidth}px
          {presetId === null ? " · custom" : ""}
        </span>
      ) : null}

      {children ? <div className="ms-auto flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
