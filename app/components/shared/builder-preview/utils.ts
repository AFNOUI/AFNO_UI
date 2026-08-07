/**
 * Pure helpers for the builder responsive-preview system. No React.
 */

import {
  PREVIEW_PRESETS,
  PREVIEW_SNAP_PX,
  MIN_PREVIEW_WIDTH,
} from "./constants";
import type { PreviewPreset, PreviewPresetId } from "./types";

/** Look up a preset by id. */
export function findPreset(id: PreviewPresetId): PreviewPreset | undefined {
  return PREVIEW_PRESETS.find((p) => p.id === id);
}

/**
 * Constrain a dragged width to something the container can actually show.
 *
 * A width wider than the container is not a preview of anything — the frame
 * would simply fill the space and the readout would lie about it.
 */
export function clampPreviewWidth(width: number, containerWidth: number | null): number {
  const max = containerWidth === null ? width : Math.max(MIN_PREVIEW_WIDTH, containerWidth);
  return Math.round(Math.min(Math.max(width, MIN_PREVIEW_WIDTH), max));
}

/**
 * Snap a dragged width onto a nearby preset.
 *
 * Hitting exactly 768 by hand is not realistic, and "almost the tablet
 * breakpoint" is the one width where a layout bug hides.
 */
export function snapPreviewWidth(width: number): number {
  for (const preset of PREVIEW_PRESETS) {
    if (preset.width !== null && Math.abs(width - preset.width) <= PREVIEW_SNAP_PX) {
      return preset.width;
    }
  }
  return width;
}

/**
 * Which preset button should read as active.
 *
 * `null` for a dragged width that matches none — the toolbar then shows no
 * selection, which is honest: the user is at a custom width.
 */
export function matchPreset(
  width: number | null,
  containerWidth: number | null,
): PreviewPresetId | null {
  if (width === null) return "full";
  // Checked before the exact match: a constraint wider than the container
  // renders identically to "full", so reporting it as "Laptop" would highlight
  // a button that is not describing what is on screen.
  if (containerWidth !== null && width > containerWidth) return "full";
  const exact = PREVIEW_PRESETS.find((p) => p.width === width);
  if (exact) return exact.id;
  return null;
}

/**
 * Presets the current container can actually honour, plus "Full".
 *
 * On a phone, a "1280" button would do nothing when pressed — the clamp would
 * immediately fold it back to the container width. Hiding it is better than
 * shipping a control that visibly ignores you.
 */
export function availablePresets(containerWidth: number | null): PreviewPreset[] {
  if (containerWidth === null) return PREVIEW_PRESETS;
  return PREVIEW_PRESETS.filter(
    (p) => p.width === null || p.width <= containerWidth,
  );
}
