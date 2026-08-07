/**
 * Builder responsive-preview system — public API.
 *
 * Same layering as `builder-header/` and `builder-insights/`:
 *   primitives/  — width button, resize handle
 *   controls/    — the width toolbar
 *   BuilderPreviewFrame — the assembled canvas each builder wraps its preview in
 *
 * Supporting files: `types.ts` (contracts), `constants.ts` (presets + tuning),
 * `utils.ts` (clamp / snap / match), `hooks.ts` (width state and dragging).
 *
 * Used by the form, table and kanban builders. The flow builder opts out —
 * `<TreeCanvas />` has its own pan/zoom viewport.
 */

// ── Frame ─────────────────────────────────────────────────────────────────
export {
  BuilderPreviewFrame,
  type BuilderPreviewFrameProps,
} from "./BuilderPreviewFrame";

// ── Controls ──────────────────────────────────────────────────────────────
export {
  BuilderPreviewToolbar,
  type BuilderPreviewToolbarProps,
} from "./controls/BuilderPreviewToolbar";

// ── Primitives ────────────────────────────────────────────────────────────
export {
  PreviewWidthButton,
  type PreviewWidthButtonProps,
} from "./primitives/PreviewWidthButton";
export {
  PreviewResizeHandle,
  type PreviewResizeHandleProps,
} from "./primitives/PreviewResizeHandle";

// ── Logic & contracts ─────────────────────────────────────────────────────
export {
  useBuilderPreviewWidth,
  type UseBuilderPreviewWidthOptions,
} from "./hooks";
export {
  findPreset,
  matchPreset,
  snapPreviewWidth,
  availablePresets,
  clampPreviewWidth,
} from "./utils";
export {
  PREVIEW_PRESETS,
  PREVIEW_SNAP_PX,
  PREVIEW_KEY_STEP,
  MIN_PREVIEW_WIDTH,
} from "./constants";
export type {
  PreviewPreset,
  PreviewPresetId,
  BuilderPreviewApi,
} from "./types";
