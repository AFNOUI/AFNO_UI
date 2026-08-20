/**
 * Tuning for the builder workspace.
 *
 * Deliberately separate from `builder-draft/constants.ts`: the two systems
 * store different things under different keys, and sharing a schema version
 * would mean a change to one silently retiring the other's data.
 */

/**
 * Idle time before the "unsaved changes" caption is *verified*. It appears
 * immediately on an edit; this delay only governs the serialize-and-compare
 * that can take it back down again, because undoing to the saved state must
 * stop reading as unsaved and a thousand-row table must not be stringified per
 * keystroke to notice.
 *
 * Nothing is written on this timer. Saving is a button.
 */
export const WORKSPACE_DIRTY_DEBOUNCE_MS = 800;

/** Namespace for every workspace key. */
export const WORKSPACE_KEY_PREFIX = "afnoui:builder-workspace:";

/**
 * Bump to retire every stored workspace at once. Do this whenever a builder's
 * persisted shape changes incompatibly — restoring a payload that no longer
 * type-checks produces a broken build, which is worse than losing it.
 */
export const WORKSPACE_SCHEMA_VERSION = 1;

/** How often relative timestamps ("saved 2m ago") recompute. */
export const WORKSPACE_TICK_MS = 30_000;

/**
 * Refuse to write payloads past this size. localStorage caps near 5 MB per
 * origin and four builders share it, so one runaway table must not evict
 * everything else.
 */
export const WORKSPACE_MAX_BYTES = 1_000_000;

/**
 * Cap on saved documents per builder. When it is reached the panel says so and
 * asks you to delete one — the alternative is silently evicting the oldest,
 * which is a fine policy for a cache and a terrible one for someone's work.
 */
export const WORKSPACE_MAX_DOCS = 25;

/** Fallback name when a builder supplies no template label. */
export const WORKSPACE_UNTITLED = "Untitled";
