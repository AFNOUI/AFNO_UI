/**
 * What the form builder autosaves.
 *
 * The shared draft system is domain-blind, so the shape of a form draft — and
 * the guard that decides whether a stored payload is still one — lives here,
 * next to the builder, exactly like `formInsights.ts`.
 */

import type { FormConfig } from "@/forms/react-hook-form";
import type { FormLayoutType } from "@/form-builder/LayoutPicker";

export interface FormDraft {
  config: FormConfig;
  /**
   * Restored so the layout picker agrees with what is on screen. It is
   * builder-only chrome — `createLayoutConfig()` bakes the choice into
   * `config`, and nothing downstream reads it back.
   */
  layout: FormLayoutType;
  /** Which template the form started from — restores the header picker too. */
  templateKey?: string;
}

/**
 * True when a stored payload is still a usable form draft.
 *
 * Structural, not exhaustive: this guards against a payload written by a
 * different build of the app, not against hand-edited localStorage.
 */
export function isFormDraft(value: unknown): value is FormDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<FormDraft>;
  if (!draft.config || typeof draft.config !== "object") return false;
  // Every code path in the builder keeps at least one section, so an absent or
  // non-array `sections` means the payload predates the current shape.
  return Array.isArray(draft.config.sections);
}
