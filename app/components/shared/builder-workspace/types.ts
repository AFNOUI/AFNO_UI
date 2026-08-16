/**
 * Contracts for the builder workspace — many saved builds per builder, written
 * only when the user asks.
 *
 * Nothing here autosaves. `update()` and `saveAs()` are the only calls that
 * write a payload, which is what makes an unsaved build genuinely unsaved and
 * a saved one genuinely stable.
 *
 * Domain-blind throughout: this layer never learns what a column, a card or a
 * node is — each builder hands over a plain-JSON snapshot and receives that
 * same value back when a build is opened.
 */

/** Which builder a workspace belongs to. One index per id. */
export type BuilderWorkspaceId = "form" | "table" | "kanban" | "tree";

/**
 * Which build a document *is* — a template key, a variant key, whatever the
 * builder switches between. Opaque here: the workspace only ever compares two
 * of them, and stays as domain-blind as the rest of this layer.
 */
export type WorkspaceIdentity = string | number | null | undefined;

/** Why `onRestore` fired: the page reopening, or a click in the saved list. */
export type WorkspaceRestoreSource = "mount" | "user";

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
     * Which build this document holds, as the builder reported it at save
     * time. Switching to a different one releases the document rather than
     * leaving it open to be overwritten by a stray Update.
     *
     * `undefined` means "written before this was recorded" — those documents
     * are adopted by the next save rather than orphaned.
     */
    identity?: string | null;
    /**
     * True for the document currently open. Exactly one is, and it is the one
     * reopened on the next visit; saving under a new name moves the flag.
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

export interface UseBuilderWorkspaceOptions<T> {
    /** Storage namespace. One per builder. */
    id: BuilderWorkspaceId;
    /**
     * Builds the snapshot to persist. Must be JSON-serializable. Called only
     * when `deps` change — the table builder's snapshot can hold 1,000 rows,
     * and rebuilding those per keystroke is the lag this seam prevents.
     */
    snapshot: () => T;
    /** What the snapshot is derived from. Same seam as `useBuilderInsights()`. */
    deps: readonly unknown[];
    /**
     * Default name for a newly-created document — usually the active template's
     * title, so a workspace reads "Sprint Board", not "Untitled 3".
     */
    label?: string;
    /**
     * Which build is on screen — normally the selected template or variant key.
     * When it changes, the open document is released, because loading a
     * different template is starting over rather than editing what you opened.
     * Your work stays on screen; it just has to be saved somewhere explicitly.
     */
    identity?: WorkspaceIdentity;
    /**
     * Applies a restored snapshot. Only the page knows how to spread it back.
     *
     * `source` separates the two reasons this fires: `"mount"` is the builder
     * reopening the build you were last in, which is the expected way a page
     * loads and wants no announcement; `"user"` is a click in the saved list,
     * which does.
     */
    onRestore: (value: T, source: WorkspaceRestoreSource) => void;
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
    docs: WorkspaceDocMeta[];
    /** The build being edited, or `null` when the work belongs to no document. */
    activeDocId: string | null;
    /** That build's name, so captions and confirms can say what they mean. */
    activeName: string | null;
    /** When the open build was last written. */
    savedAt: number | null;
    /**
     * The build on screen no longer matches what is stored — the whole reason
     * the header says "Unsaved changes" and opening another build asks first.
     */
    dirty: boolean;
    /** The last save was refused (quota, or a payload past the size cap). */
    error: boolean;
    /** Storage is unavailable (private mode, blocked third-party storage). */
    unavailable: boolean;
    /** At `WORKSPACE_MAX_DOCS`; saving a new build needs a deletion first. */
    atCapacity: boolean;
    /** Open a saved build, replacing whatever is on screen. */
    restore: (docId: string) => void;
    /** Write the current work into the open build. No-op when none is open. */
    update: () => void;
    /** Save the current work as a new build under `name`. */
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
