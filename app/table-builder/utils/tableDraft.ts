/**
 * What the table builder autosaves.
 *
 * The shared draft system is domain-blind, so the shape of a table draft —
 * and the guard that decides whether a stored payload is still one — lives
 * here, next to the builder, exactly like `tableInsights.ts`.
 */

import type { TableBuilderConfig } from "@/table-builder/data/tableBuilderTemplates";
import type { TableRendererSources } from "@/table-builder/utils/tableCodeGenerator";

export interface TableDraft {
  config: TableBuilderConfig;
  /**
   * The rows on screen. Note that "Generate 1k rows" can push this past
   * `DRAFT_MAX_BYTES`, in which case the write is skipped and the header
   * reports "Not saved" — deliberate: a 5 MB write on every keystroke is worse
   * than no autosave, and stress rows are regenerable in one click.
   */
  sampleData: Record<string, unknown>[];
  /** Custom cell renderers, as source strings. Survives the round-trip. */
  rendererSources?: TableRendererSources;
  /** Which template the table started from — restores the header picker too. */
  templateKey?: string;
}

/**
 * True when a stored payload is still a usable table draft.
 *
 * Structural, not exhaustive: this guards against a payload written by a
 * different build of the app, not against hand-edited localStorage.
 */
export function isTableDraft(value: unknown): value is TableDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<TableDraft>;
  if (!draft.config || typeof draft.config !== "object") return false;
  if (!Array.isArray(draft.config.columns)) return false;
  return Array.isArray(draft.sampleData);
}
