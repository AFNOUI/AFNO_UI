/**
 * Builder draft storage — the single-slot autosave that predates the workspace.
 *
 * `builder-workspace/` superseded the hook and the restore strip: it keeps a
 * *list* of saved builds rather than one slot. What remains here is the part
 * still in use — the legacy reader (so a pre-workspace draft can be migrated
 * once), the relative-time formatter both systems share, and the
 * "Saved 2m ago" caption the header renders.
 */

// ── Primitives ────────────────────────────────────────────────────────────
export {
  DraftSavedIndicator,
  type DraftSavedIndicatorProps,
} from "./primitives/DraftSavedIndicator";

// ── Storage & formatting ──────────────────────────────────────────────────
export { draftKey, readDraft, clearDraft, formatSavedAgo } from "./utils";
export {
  DRAFT_TICK_MS,
  DRAFT_KEY_PREFIX,
  DRAFT_MAX_AGE_MS,
  DRAFT_SCHEMA_VERSION,
} from "./constants";
export type {
  BuilderDraftId,
  BuilderDraftOffer,
  BuilderDraftStatus,
  BuilderDraftEnvelope,
} from "./types";
