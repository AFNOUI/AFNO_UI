/**
 * Builder draft storage — the single-slot autosave that predates the workspace.
 *
 * `builder-workspace/` superseded all of it: builds are a list now, and they
 * are written when the user saves rather than on a debounce. What remains here
 * is the part still in use — the legacy reader, so a pre-workspace draft can be
 * migrated once, and the relative-time formatter the workspace shares.
 */

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
  BuilderDraftEnvelope,
} from "./types";
