/**
 * Tuning constants for the builder draft (autosave) system.
 */

/** localStorage key prefix. One slot per builder id. */
export const DRAFT_KEY_PREFIX = "afnoui:builder-draft:";

/**
 * Bump to retire every stored draft at once. Do this whenever a builder's
 * persisted shape changes incompatibly — an old payload that no longer
 * type-checks would restore a broken build, which is worse than losing it.
 */
export const DRAFT_SCHEMA_VERSION = 1;

/**
 * Idle time before a write. Long enough that typing a column label is one
 * write rather than fifteen, short enough that an accidental refresh a second
 * after the last keystroke still finds the edit.
 */
export const DRAFT_DEBOUNCE_MS = 800;

/** How often the "saved 2m ago" caption recomputes its relative time. */
export const DRAFT_TICK_MS = 30_000;

/**
 * Drafts older than this are not offered on load. A week-old draft is not
 * "your last session" — restoring it would be a surprise, not a rescue.
 */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Refuse to write payloads past this size. localStorage caps around 5 MB per
 * origin and four builders share it; a 1,000-row stress table serializes well
 * past that, and a failed write on every keystroke is worse than no autosave.
 */
export const DRAFT_MAX_BYTES = 1_000_000;
