/**
 * Contracts for the builder responsive-preview system.
 *
 * Types only — no values, no JSX. Runtime helpers live in `utils.ts`, tokens in
 * `constants.ts`, stateful logic in `hooks.ts`.
 */

import type { LucideIcon } from "lucide-react";

/** Stable ids for the width presets. */
export type PreviewPresetId = "phone" | "tablet" | "laptop" | "full";

/** One button in the preview toolbar. */
export interface PreviewPreset {
  id: PreviewPresetId;
  label: string;
  /** Short label used below the `sm` breakpoint, where names do not fit. */
  short: string;
  icon: LucideIcon;
  /** CSS pixels, or `null` for "fill the available space". */
  width: number | null;
  /** Tooltip copy — what this width is actually standing in for. */
  hint: string;
}

/** Return value of `useBuilderPreviewWidth()`. */
export interface BuilderPreviewApi {
  /** Constraint in CSS pixels, or `null` when unconstrained. */
  width: number | null;
  /**
   * Which preset button reads as active. `"full"` when unconstrained, and
   * `null` while the width is a dragged value that matches no preset.
   */
  presetId: PreviewPresetId | null;
  /** Width actually occupied on screen — the constraint, or the container. */
  effectiveWidth: number | null;
  /** Widest constraint the current container can honour. */
  maxWidth: number | null;
  /** True while an edge is being dragged, so the frame can suppress transitions. */
  isResizing: boolean;
  selectPreset: (id: PreviewPresetId) => void;
  /** Set an explicit width; clamped to the container. `null` means full. */
  setWidth: (width: number | null) => void;
  /** Attach to the element that defines the available space. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Wire to a resize handle's `onPointerDown`. */
  startResize: (event: React.PointerEvent<HTMLElement>) => void;
  /** Wire to a resize handle's `onKeyDown` — arrow keys, Home, End. */
  handleResizeKey: (event: React.KeyboardEvent<HTMLElement>) => void;
}
