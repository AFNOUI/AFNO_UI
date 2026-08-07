/**
 * Presets and tuning for the builder responsive-preview system.
 */

import { Monitor, Smartphone, Tablet, Laptop } from "lucide-react";

import type { PreviewPreset } from "./types";

/**
 * The four widths worth checking a component at.
 *
 * Chosen to sit just inside the Tailwind breakpoints the library's own
 * components branch on, so each one lands in a different layout regime rather
 * than on a boundary: 375 < `sm`(640), 768 = `md`, 1280 = `xl`.
 */
export const PREVIEW_PRESETS: PreviewPreset[] = [
  {
    id: "phone",
    label: "Phone",
    short: "375",
    icon: Smartphone,
    width: 375,
    hint: "375px — below the sm breakpoint, where columns collapse and labels truncate",
  },
  {
    id: "tablet",
    label: "Tablet",
    short: "768",
    icon: Tablet,
    width: 768,
    hint: "768px — the md breakpoint, where two-column layouts first appear",
  },
  {
    id: "laptop",
    label: "Laptop",
    short: "1280",
    icon: Laptop,
    width: 1280,
    hint: "1280px — the xl breakpoint, a typical laptop viewport",
  },
  {
    id: "full",
    label: "Full",
    short: "Full",
    icon: Monitor,
    width: null,
    hint: "Fill the available space — how the builder page itself renders it",
  },
];

/**
 * Narrowest draggable width. Below this the preview stops telling you anything
 * useful: no shipped component is designed for it, so every one of them would
 * report a false problem.
 */
export const MIN_PREVIEW_WIDTH = 280;

/** Width snaps to a preset when dragged within this many pixels of it. */
export const PREVIEW_SNAP_PX = 12;

/** Pixels per arrow-key press on a focused resize handle. Shift multiplies. */
export const PREVIEW_KEY_STEP = 16;
export const PREVIEW_KEY_STEP_LARGE = 64;
