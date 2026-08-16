/**
 * Contracts for legacy draft storage.
 *
 * `builder-workspace/` superseded this system entirely — it keeps a *list* of
 * saved builds and writes them only when the user saves. What remains is the
 * reader used once per project to migrate a pre-workspace draft.
 *
 * Still deliberately domain-blind: it never learns what a column, a card or a
 * node is. Each builder stored a plain-JSON snapshot of whatever *its* working
 * state happened to be, and gets that same value back.
 */

/** Which builder a draft belongs to. One localStorage slot per id. */
export type BuilderDraftId = "form" | "table" | "kanban" | "tree";

/**
 * What was persisted.
 *
 * `version` is checked on read: bumping `DRAFT_SCHEMA_VERSION` retires every
 * stored draft at once, which is what we want when a builder's state shape
 * changes in a way old payloads cannot satisfy.
 */
export interface BuilderDraftEnvelope<T> {
    version: number;
    /** `Date.now()` at write time. */
    savedAt: number;
    /** Human label, e.g. the template's title. Becomes the document's name. */
    label?: string;
    /** The builder's own snapshot — opaque to this layer. */
    value: T;
}

/** A draft found in storage, ready to be migrated into the workspace. */
export interface BuilderDraftOffer<T> {
    savedAt: number;
    label?: string;
    value: T;
}
