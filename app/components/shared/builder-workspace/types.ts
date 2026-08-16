/**
 * Contracts for the builder workspace — many saved documents per builder.
 *
 * `builder-draft/` persists exactly one autosaved snapshot per builder: enough
 * to survive a refresh, but it means the second thing you build overwrites the
 * first. The workspace keeps a *list*: every build you save stays until you
 * delete it, the newest is offered back when you return, and the rest are one
 * click away.
 *
 * Same domain-blind seam as the draft system. This layer never learns what a
 * column, a card or a node is — each builder hands over a plain-JSON snapshot
 * and receives that same value back on restore.
 */

/** Which builder a workspace belongs to. One index per id. */
export type BuilderWorkspaceId = "form" | "table" | "kanban" | "tree";

/** Autosave lifecycle, mirroring `BuilderDraftStatus`. */
export type BuilderWorkspaceStatus = "idle" | "pending" | "saved" | "error";

/**
 * What the index holds for each document. Deliberately payload-free: listing a
 * workspace of 25 documents must not parse 25 snapshots, some of which carry a
 * thousand table rows.
 */
export interface WorkspaceDocMeta {
    id: string;
    /** User-facing name. Defaults to the builder's template label. */
    name: string;
    /** `Date.now()` of the last write. */
    savedAt: number;
    createdAt: number;
    /** Serialized size, so the panel can show it and the cap can be enforced. */
    bytes: number;
    /**
     * True for the document autosave is currently writing to. Exactly one
     * document is active; saving under a new name moves the flag.
     */
    active?: boolean;
}

/** The stored index. One localStorage entry per builder. */
export interface WorkspaceIndex {
    version: number;
    docs: WorkspaceDocMeta[];
}

/** A stored document's payload, kept under its own key. */
export interface WorkspaceDocEnvelope<T> {
    version: number;
    savedAt: number;
    value: T;
}

/** The document offered back when you return in a new session. */
export interface WorkspaceOffer {
    docId: string;
    name: string;
    savedAt: number;
}

export interface UseBuilderWorkspaceOptions<T> {
    /** Storage namespace. One per builder. */
    id: BuilderWorkspaceId;
    /**
     * Builds the snapshot to persist. Must be JSON-serializable. Called only
     * when `deps` change — the table builder's snapshot can hold 1,000 rows,
     * and stringifying those per keystroke is the lag autosave should prevent.
     */
    snapshot: () => T;
    /** What the snapshot is derived from. Same seam as `useBuilderInsights()`. */
    deps: readonly unknown[];
    /**
     * Default name for a newly-created document — usually the active template's
     * title, so a workspace reads "Sprint Board", not "Untitled 3".
     */
    label?: string;
    /** Applies a restored snapshot. Only the page knows how to spread it back. */
    onRestore: (value: T) => void;
    /** Reject payloads written by an older build rather than restoring them. */
    validate?: (value: unknown) => value is T;
    disabled?: boolean;
}

/**
 * The non-generic slice the header chrome needs. Carries no payload, for the
 * same reason `BuilderDraftHeaderState` does not: the header renders a caption
 * and buttons, and handing it a snapshot would invite it to inspect one.
 */
export interface BuilderWorkspaceHeaderState {
    status: BuilderWorkspaceStatus;
    savedAt: number | null;
    docs: WorkspaceDocMeta[];
    activeDocId: string | null;
    offer: WorkspaceOffer | null;
    /** Storage is unavailable (private mode, blocked third-party storage). */
    unavailable: boolean;
    restore: (docId: string) => void;
    dismissOffer: () => void;
    saveAs: (name: string) => void;
    rename: (docId: string, name: string) => void;
    remove: (docId: string) => void;
    duplicate: (docId: string) => void;
}

export interface BuilderWorkspaceApi<T> extends BuilderWorkspaceHeaderState {
    /** Delete every document for this builder. */
    clearAll: () => void;
    /** Referentially-stable bundle for `<BuilderHeader workspace={…} />`. */
    header: BuilderWorkspaceHeaderState;
    /** Present so a caller can narrow the generic; never read by the chrome. */
    readonly __value?: T;
}
