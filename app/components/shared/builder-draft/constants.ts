/**
 * Tuning constants for legacy draft storage.
 *
 * Only the values the *reader* needs survive — the workspace owns writing, and
 * carries its own size cap and debounce.
 */

/** localStorage key prefix. One slot per builder id. */
export const DRAFT_KEY_PREFIX = "afnoui:builder-draft:";

/**
 * Bump to retire every stored draft at once. Do this whenever a builder's
 * persisted shape changes incompatibly — an old payload that no longer
 * type-checks would restore a broken build, which is worse than losing it.
 */
export const DRAFT_SCHEMA_VERSION = 1;

/** How often the "saved 2m ago" caption recomputes its relative time. */
export const DRAFT_TICK_MS = 30_000;

/**
 * Drafts older than this are not offered on load. A week-old draft is not
 * "your last session" — restoring it would be a surprise, not a rescue.
 */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

