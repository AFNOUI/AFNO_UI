/**
 * Design tokens and tuning constants for the builder header system.
 *
 * Anything a designer might want to nudge lives here rather than being spread
 * across component files.
 */

import type { BuilderBadgeTone, BuilderComplexity } from "./types";

/** Tone → Tailwind classes for `<BuilderBadge />`. */
export const BADGE_TONE_CLASSES: Record<BuilderBadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

/** Template complexity → badge tone. */
export const COMPLEXITY_TONES: Record<BuilderComplexity, BuilderBadgeTone> = {
  basic: "emerald",
  intermediate: "blue",
  advanced: "purple",
  expert: "amber",
};

/** Uniform control height for every toolbar control. */
export const TOOLBAR_CONTROL_HEIGHT = "h-9";

/** Default trigger width for `<BuilderTemplatePicker />`. */
export const TEMPLATE_PICKER_WIDTH = "w-full sm:w-[220px]";

/** Show the picker's search field once the catalogue exceeds this many entries. */
export const TEMPLATE_SEARCH_THRESHOLD = 8;

/** Undo depth. Older entries are dropped oldest-first. */
export const MAX_HISTORY = 80;
