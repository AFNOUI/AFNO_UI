/**
 * Shared contracts for the builder header system.
 *
 * Types only — no values, no JSX. Runtime helpers live in `utils.ts`, tokens in
 * `constants.ts`, stateful logic in `hooks.ts`. Importing this file therefore
 * costs nothing at runtime.
 */

/** Semantic colour tones available to `<BuilderBadge />`. */
export type BuilderBadgeTone =
  | "neutral"
  | "emerald"
  | "blue"
  | "purple"
  | "amber";

/** Complexity levels the builder template catalogues tag their entries with. */
export type BuilderComplexity = "basic" | "intermediate" | "advanced" | "expert";

/** A small pill rendered next to a template name (e.g. its complexity). */
export interface BuilderBadgeSpec {
  label: string;
  tone?: BuilderBadgeTone;
}

/** One selectable entry in `<BuilderTemplatePicker />`. */
export interface BuilderTemplateOption {
  /** Stable key passed back to `onSelect`. */
  value: string;
  /** Human-readable template name. */
  label: string;
  /** Optional pill shown after the label (complexity, category, …). */
  badge?: BuilderBadgeSpec;
  /** Optional secondary line, also used to widen fuzzy search. */
  description?: string;
}

/**
 * Minimum shape `toTemplateOptions()` needs from a builder's template
 * catalogue. Every builder's template type already satisfies it structurally.
 */
export interface BuilderTemplateLike {
  /** Falls back to the record key when a catalogue entry has no title. */
  title?: string;
  complexity?: string;
  description?: string;
}

/** Undo / redo wiring, shaped to match `useBuilderHistory()`'s `history` field. */
export interface BuilderHistoryState {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/** Internal past/present/future slice used by `useBuilderHistory()`. */
export interface BuilderHistorySlice<T> {
  past: T[];
  present: T;
  future: T[];
}

/** Full return value of `useBuilderHistory()`. */
export interface BuilderHistoryApi<T> {
  /** Current config. */
  state: T;
  /** Push a new config (value or updater) onto the undo stack. */
  set: (next: T | ((prev: T) => T)) => void;
  /** Replace the config and clear both stacks (template load, JSON import). */
  reset: (next: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Referentially-stable bundle to hand straight to `<BuilderHeader history={…} />`. */
  history: BuilderHistoryState;
}
