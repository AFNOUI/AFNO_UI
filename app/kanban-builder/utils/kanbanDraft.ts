/**
 * What the kanban builder autosaves.
 *
 * The shared draft system is domain-blind, so the shape of a kanban draft —
 * and the guard that decides whether a stored payload is still one — lives
 * here, next to the builder, exactly like `kanbanInsights.ts`.
 */

import type { KanbanRendererSources } from "@/kanban/types";
import type {
  KanbanCardData,
  KanbanBuilderConfig,
} from "@/kanban-builder/data/kanbanBuilderTemplates";

export interface KanbanDraft {
  config: KanbanBuilderConfig;
  cards: KanbanCardData[];
  /** Custom card renderers, as source strings. Survives the round-trip. */
  rendererSources?: KanbanRendererSources;
  /** Which template the board started from — restores the header picker too. */
  templateKey?: string;
}

/**
 * True when a stored payload is still a usable kanban draft.
 *
 * Structural, not exhaustive: this guards against a payload written by a
 * different build of the app, not against hand-edited localStorage. Anything
 * subtler than "columns is an array" is the JSON import dialog's job.
 */
export function isKanbanDraft(value: unknown): value is KanbanDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<KanbanDraft>;
  if (!draft.config || typeof draft.config !== "object") return false;
  if (!Array.isArray(draft.config.columns)) return false;
  return Array.isArray(draft.cards);
}
