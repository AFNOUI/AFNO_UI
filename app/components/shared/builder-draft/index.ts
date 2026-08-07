/**
 * Builder draft (autosave) system — public API.
 *
 * Same layering as `builder-header/` and `builder-insights/`:
 *   primitives/  — the "saved 2m ago" caption
 *   controls/    — the "Restore last session" strip
 *
 * There is no assembled component at the folder root on purpose: both surfaces
 * are placed by `<BuilderHeader draft={…} />`, so the header keeps owning
 * *where* builder chrome lands, exactly as it does for undo/redo.
 *
 * Supporting files: `types.ts` (contracts), `constants.ts` (tuning),
 * `utils.ts` (storage + formatting), `hooks.ts` (the autosave engine).
 *
 * Each builder supplies its own snapshot — `config + cards` for kanban,
 * `config + sampleData + rendererSources` for the table, `tree + variant` for
 * the flow builder, a bare `config` for the form — so the shared layer never
 * learns what any of those are.
 */

// ── Controls ──────────────────────────────────────────────────────────────
export {
  BuilderDraftPrompt,
  type BuilderDraftPromptProps,
} from "./controls/BuilderDraftPrompt";

// ── Primitives ────────────────────────────────────────────────────────────
export {
  DraftSavedIndicator,
  type DraftSavedIndicatorProps,
} from "./primitives/DraftSavedIndicator";

// ── Logic & contracts ─────────────────────────────────────────────────────
export { useBuilderDraft } from "./hooks";
export {
  draftKey,
  readDraft,
  writeDraft,
  clearDraft,
  serializeDraft,
  formatSavedAgo,
} from "./utils";
export {
  DRAFT_KEY_PREFIX,
  DRAFT_MAX_AGE_MS,
  DRAFT_MAX_BYTES,
  DRAFT_DEBOUNCE_MS,
  DRAFT_SCHEMA_VERSION,
} from "./constants";
export type {
  BuilderDraftId,
  BuilderDraftApi,
  BuilderDraftOffer,
  BuilderDraftStatus,
  BuilderDraftEnvelope,
  BuilderDraftHeaderState,
  UseBuilderDraftOptions,
} from "./types";
