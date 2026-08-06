/**
 * Pure helpers for the builder header system. No React, no side effects.
 */

import { COMPLEXITY_TONES } from "./constants";
import type {
  BuilderBadgeTone,
  BuilderComplexity,
  BuilderTemplateLike,
  BuilderTemplateOption,
} from "./types";

/**
 * Maps a template's `complexity` string onto a badge tone.
 * Replaces the `complexityColors` record that used to be copy-pasted into the
 * table and kanban builder pages.
 */
export function complexityTone(complexity?: string): BuilderBadgeTone {
  return COMPLEXITY_TONES[complexity as BuilderComplexity] ?? "neutral";
}

/**
 * Turns a builder's `Record<key, Template>` catalogue into picker options.
 *
 * All four builders store templates as a keyed record whose values carry a
 * `title` and (usually) a `complexity`, so one adapter serves every page.
 */
export function toTemplateOptions<T extends BuilderTemplateLike>(
  templates: Record<string, T>,
): BuilderTemplateOption[] {
  return Object.entries(templates).map(([value, template]) => ({
    value,
    label: template.title ?? value,
    description: template.description,
    badge: template.complexity
      ? { label: template.complexity, tone: complexityTone(template.complexity) }
      : undefined,
  }));
}

/**
 * Deep snapshot for undo stacks. `JSON` round-tripping is faster than
 * `structuredClone` for the plain config trees the builders use; the fallback
 * handles any value that is not JSON-serializable (a future config shape that
 * adds a Map/Set/Date).
 */
export function snapshot<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return structuredClone(value);
  }
}
