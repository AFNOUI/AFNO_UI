/**
 * Builder header system — public API.
 *
 * Layers, lowest to highest:
 *   primitives/  — single-purpose visual pieces (icon tile, title, buttons…)
 *   controls/    — composed toolbar widgets (template picker, undo/redo…)
 *   BuilderHeader — the assembled header the four builder pages render
 *
 * Supporting files: `types.ts` (contracts), `constants.ts` (tokens),
 * `utils.ts` (pure helpers), `hooks.ts` (stateful logic).
 *
 * Import from this barrel — the layer folders are an implementation detail.
 */

// ── Header ────────────────────────────────────────────────────────────────
export { BuilderHeader, type BuilderHeaderProps } from "./BuilderHeader";

// ── Controls ──────────────────────────────────────────────────────────────
export { BuilderIdentity, type BuilderIdentityProps } from "./controls/BuilderIdentity";
export { BuilderToolbar, type BuilderToolbarProps } from "./controls/BuilderToolbar";
export {
  BuilderTemplatePicker,
  type BuilderTemplatePickerProps,
} from "./controls/BuilderTemplatePicker";
export {
  BuilderHistoryControls,
  type BuilderHistoryControlsProps,
} from "./controls/BuilderHistoryControls";
export { BuilderJsonTrigger } from "./controls/BuilderJsonTrigger";
export {
  BuilderJsonDialog,
  type BuilderJsonDialogProps,
} from "./controls/BuilderJsonDialog";

// ── Primitives ────────────────────────────────────────────────────────────
export { BuilderIconTile, type BuilderIconTileProps } from "./primitives/BuilderIconTile";
export { BuilderTitle, type BuilderTitleProps } from "./primitives/BuilderTitle";
export {
  BuilderDescription,
  type BuilderDescriptionProps,
} from "./primitives/BuilderDescription";
export { BuilderBadge, type BuilderBadgeProps } from "./primitives/BuilderBadge";
export { ToolbarTip, type ToolbarTipProps } from "./primitives/ToolbarTip";
export { ToolbarGroup, type ToolbarGroupProps } from "./primitives/ToolbarGroup";
export { ToolbarButton, type ToolbarButtonProps } from "./primitives/ToolbarButton";
export {
  ToolbarIconButton,
  type ToolbarIconButtonProps,
} from "./primitives/ToolbarIconButton";

// ── Logic & contracts ─────────────────────────────────────────────────────
export { useBuilderHistory, useTemplateOptions } from "./hooks";
export { complexityTone, toTemplateOptions, snapshot } from "./utils";
export { MAX_HISTORY, COMPLEXITY_TONES, BADGE_TONE_CLASSES } from "./constants";
export type {
  BuilderBadgeTone,
  BuilderBadgeSpec,
  BuilderComplexity,
  BuilderHistoryApi,
  BuilderHistoryState,
  BuilderHistorySlice,
  BuilderTemplateLike,
  BuilderTemplateOption,
} from "./types";
