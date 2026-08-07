/**
 * What the flow (tree) builder autosaves.
 *
 * The shared draft system is domain-blind, so the shape of a flow draft — and
 * the guard that decides whether a stored payload is still one — lives here,
 * next to the builder, exactly like `treeInsights.ts`.
 */

import type { TreeNode, TreeCanvasConfig } from "@/trees/types";

export interface TreeDraft {
  /** Which template variant is active. Restored first — see below. */
  variant: string;
  tree: TreeNode;
  /**
   * Only the user's overrides, not the merged config. Storing the merge would
   * freeze a copy of the template's defaults into the draft, so a later change
   * to that template would never reach a restored session.
   */
  configPatch: Partial<TreeCanvasConfig>;
  layout: TreeCanvasConfig["layout"];
}

/**
 * True when a stored payload is still a usable flow draft.
 *
 * Structural, not exhaustive: this guards against a payload written by a
 * different build of the app, not against hand-edited localStorage.
 */
export function isTreeDraft(value: unknown): value is TreeDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<TreeDraft>;
  if (typeof draft.variant !== "string") return false;
  if (!draft.tree || typeof draft.tree !== "object") return false;
  if (typeof (draft.tree as TreeNode).id !== "string") return false;
  return Boolean(draft.configPatch) && typeof draft.configPatch === "object";
}
