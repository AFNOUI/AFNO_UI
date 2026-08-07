/**
 * Contracts for the builder draft (autosave) system.
 *
 * Types only — no values, no JSX. Runtime helpers live in `utils.ts`, tokens in
 * `constants.ts`, stateful logic in `hooks.ts`.
 *
 * The shared layer is deliberately domain-blind: it never learns what a column,
 * a card or a node is. Each builder hands it a plain-JSON snapshot of whatever
 * *its* working state happens to be — `config + cards` for kanban,
 * `config + sampleData + rendererSources` for the table, `tree + variant` for
 * the flow builder, a bare `config` for the form — and receives that same value
 * back on restore. Same seam as `get*Insights()`.
 */

/** Which builder a draft belongs to. One localStorage slot per id. */
export type BuilderDraftId = "form" | "table" | "kanban" | "tree";

/** Lifecycle of the autosave indicator. */
export type BuilderDraftStatus =
  /** Nothing worth saving yet — the user has not touched the build. */
  | "idle"
  /** Edits are pending; the debounce window has not elapsed. */
  | "pending"
  /** A write landed in localStorage. */
  | "saved"
  /** The write threw (quota exceeded, private-mode Safari, …). */
  | "error";

/**
 * What actually gets persisted.
 *
 * `version` is checked on read: bumping `DRAFT_SCHEMA_VERSION` retires every
 * stored draft at once, which is what we want when a builder's state shape
 * changes in a way old payloads cannot satisfy.
 */
export interface BuilderDraftEnvelope<T> {
  version: number;
  /** `Date.now()` at write time. */
  savedAt: number;
  /** Human label for the restore prompt, e.g. the current template's title. */
  label?: string;
  /** The builder's own snapshot — opaque to this layer. */
  value: T;
}

/** A draft found in storage and offered back to the user. */
export interface BuilderDraftOffer<T> {
  savedAt: number;
  label?: string;
  value: T;
}

export interface UseBuilderDraftOptions<T> {
  /** Storage slot. One per builder. */
  id: BuilderDraftId;
  /**
   * Builds the snapshot to persist. Must be JSON-serializable — anything that
   * is not survives neither the write nor the read, so keep functions and class
   * instances out of it (`rendererSources` are strings, which is fine).
   *
   * Called only when `deps` change, never on every render: the table builder's
   * snapshot can hold 1,000 rows, and stringifying those on each keystroke is
   * exactly the lag autosave is supposed to prevent.
   */
  snapshot: () => T;
  /**
   * What the snapshot is derived from. Same seam as `useBuilderInsights()` —
   * the shared layer stays domain-blind and each builder declares its own
   * state shape.
   */
  deps: readonly unknown[];
  /**
   * Short label stored with the draft and shown in the restore prompt
   * ("Sprint Board"). Usually the active template's title.
   */
  label?: string;
  /**
   * Applies a restored snapshot. Only this callback knows how to spread a
   * payload back over the builder's own state — which is precisely the
   * knowledge the shared layer refuses to hold.
   */
  onRestore: (value: T) => void;
  /**
   * Guard against restoring a payload written by an older build of the app.
   * Return `false` and the stored draft is dropped rather than offered.
   */
  validate?: (value: unknown) => value is T;
  /** Disable autosave entirely (used by tests and by SSR-only renders). */
  disabled?: boolean;
}

/**
 * The non-generic slice `<BuilderHeader draft={…} />` needs.
 *
 * Deliberately carries no payload: the header renders a caption and two
 * buttons, and giving it the snapshot would invite it to inspect one. Mirrors
 * `BuilderHistoryState`, which is the same trick for undo/redo.
 */
export interface BuilderDraftHeaderState {
  status: BuilderDraftStatus;
  /** `Date.now()` of the last successful write, or `null`. */
  savedAt: number | null;
  /** Metadata for the restore prompt; `null` when there is nothing to offer. */
  offer: { savedAt: number; label?: string } | null;
  restore: () => void;
  dismiss: () => void;
}

/** What `useBuilderDraft()` hands back. */
export interface BuilderDraftApi<T> {
  status: BuilderDraftStatus;
  /** `Date.now()` of the last successful write, or `null`. */
  savedAt: number | null;
  /**
   * A draft from a previous session, waiting for the user to accept or dismiss
   * it. `null` once either happens, and `null` when there was none.
   */
  offer: BuilderDraftOffer<T> | null;
  /** Apply `offer` via `onRestore`, then stop advertising it. */
  restore: () => void;
  /** Reject `offer` and delete the stored draft. */
  dismiss: () => void;
  /** Delete the stored draft and stop advertising a save (used on reset). */
  clear: () => void;
  /** Referentially-stable bundle to hand straight to `<BuilderHeader draft={…} />`. */
  header: BuilderDraftHeaderState;
}
