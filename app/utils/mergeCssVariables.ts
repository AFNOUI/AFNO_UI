import type { CSSVariable } from "@/types/cssVariable";

/**
 * Merges persisted theme variables with the canonical default list (from globals.css).
 * Ensures new tokens appear in Export even when localStorage predates them.
 */
export function mergeCssVariablesWithDefaults(stored: CSSVariable[], defaults: CSSVariable[]): CSSVariable[] {
  const byName = new Map(stored.map((v) => [v.name, v]));
  const merged = defaults.map((d) => {
    const s = byName.get(d.name);
    return s ? { ...d, ...s } : d;
  });
  const defaultNames = new Set(defaults.map((d) => d.name));
  const extras = stored.filter((s) => !defaultNames.has(s.name));
  return [...merged, ...extras];
}
