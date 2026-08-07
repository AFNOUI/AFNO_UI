/**
 * Pure helpers for the builder template-diff system. No React.
 *
 * The walker is deliberately shallow and array-blind — see `diffConfigs()`.
 * Everything here operates on the plain-JSON config trees the builders hold, so
 * it needs no knowledge of what a column, a field or a card is.
 */

import { DIFF_MAX_DEPTH, DIFF_VALUE_MAX_CHARS } from "./constants";
import type { BuilderDiffEntry, BuilderDiffKind, BuilderDiffOptions } from "./types";

/** True for a plain object — not null, not an array. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep equality via JSON, which is all these configs ever contain. */
function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function matchesPath(path: string, patterns: string[] | undefined): boolean {
  if (!patterns?.length) return false;
  return patterns.some((p) => path === p || path.startsWith(`${p}.`));
}

/** Read a dotted path. Returns `undefined` for any missing segment. */
export function getAtPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isPlainObject(acc)) return undefined;
    return acc[key];
  }, source);
}

/**
 * Immutably write a dotted path, cloning only the objects along it.
 *
 * Structural sharing matters here: the undo stack keeps every previous config,
 * and deep-cloning a 40-column table to change one boolean would make resetting
 * a setting cost more than editing one.
 */
export function setAtPath<T>(source: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  if (!head) return source;

  const base: Record<string, unknown> = isPlainObject(source) ? { ...source } : {};
  base[head] = rest.length === 0 ? value : setAtPath(base[head] ?? {}, rest.join("."), value);
  return base as T;
}

/** Immutably remove a dotted path. Missing intermediates are a no-op. */
export function deleteAtPath<T>(source: T, path: string): T {
  const [head, ...rest] = path.split(".");
  if (!head || !isPlainObject(source)) return source;

  const base: Record<string, unknown> = { ...source };
  if (rest.length === 0) delete base[head];
  else if (isPlainObject(base[head])) base[head] = deleteAtPath(base[head], rest.join("."));
  return base as T;
}

/**
 * `"pagination.pageSize"` → `"Pagination · Page size"`.
 *
 * Config keys are camelCase by convention across all four builders, so one
 * splitter serves every one of them.
 */
export function humanizePath(path: string): string {
  return path
    .split(".")
    .map((segment) => {
      const spaced = segment
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .trim();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
    })
    .join(" · ");
}

/**
 * A short, readable stand-in for a config value.
 *
 * Collections collapse to a count rather than a dump: the point of a diff row
 * is "the columns are not the template's any more", and forty serialized
 * column objects communicate that no better than "8 items" does.
 */
export function formatDiffValue(value: unknown): string {
  if (value === undefined || value === null) return "not set";
  if (typeof value === "boolean") return value ? "On" : "Off";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (value === "") return "empty";
    return value.length > DIFF_VALUE_MAX_CHARS
      ? `${value.slice(0, DIFF_VALUE_MAX_CHARS - 1)}…`
      : value;
  }
  if (Array.isArray(value)) {
    return value.length === 1 ? "1 item" : `${value.length} items`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).length;
    return keys === 1 ? "1 setting" : `${keys} settings`;
  }
  return String(value);
}

function classify(current: unknown, template: unknown): BuilderDiffKind {
  if (current === undefined || current === null) return "removed";
  if (template === undefined || template === null) return "added";
  return "changed";
}

/**
 * Compare a working config against the template it started from.
 *
 * Three rules keep the output something a person can read:
 *
 * 1. **Arrays are leaves.** A reordered column list is one difference, not
 *    forty. Resetting it restores the template's whole array, which is the only
 *    reset that leaves a coherent config behind.
 * 2. **`atomic` paths are leaves too**, for object subtrees that are really one
 *    user-facing concept.
 * 3. **The walk stops at `maxDepth`.** Anything deeper is reported as one
 *    value — a config nested four levels down is not a "setting" the user
 *    recognises by path anyway.
 *
 * Keys are collected from both sides, so a setting the template defines and the
 * user cleared is reported as `removed` rather than silently ignored.
 */
export function diffConfigs(
  current: unknown,
  template: unknown,
  options: BuilderDiffOptions = {},
): BuilderDiffEntry[] {
  const { ignore, atomic, maxDepth = DIFF_MAX_DEPTH } = options;
  const entries: BuilderDiffEntry[] = [];

  const walk = (a: unknown, b: unknown, path: string, depth: number) => {
    if (path && matchesPath(path, ignore)) return;

    const descend =
      depth < maxDepth &&
      isPlainObject(a) &&
      isPlainObject(b) &&
      !(path && matchesPath(path, atomic));

    if (descend) {
      const keys = new Set([
        ...Object.keys(a as Record<string, unknown>),
        ...Object.keys(b as Record<string, unknown>),
      ]);
      for (const key of keys) {
        const next = path ? `${path}.${key}` : key;
        walk(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
          next,
          depth + 1,
        );
      }
      return;
    }

    // The root is never itself an entry — "the config changed" is not a row.
    if (!path) return;
    if (sameValue(a, b)) return;

    entries.push({
      path,
      label: humanizePath(path),
      kind: classify(a, b),
      current: a,
      template: b,
      currentLabel: formatDiffValue(a),
      templateLabel: formatDiffValue(b),
    });
  };

  walk(current, template, "", 0);
  entries.sort((x, y) => x.label.localeCompare(y.label));
  return entries;
}

/**
 * Put one setting back the way the template had it.
 *
 * A setting the template never defined is *deleted* rather than set to
 * `undefined`: leaving the key present with an undefined value would survive
 * into the exported JSON and read as a deliberate choice.
 */
export function resetDiffEntry<T>(config: T, entry: BuilderDiffEntry): T {
  if (entry.template === undefined) return deleteAtPath(config, entry.path);
  return setAtPath(config, entry.path, entry.template);
}

/** Put every listed setting back. Used by "Reset all". */
export function resetAllDiffEntries<T>(config: T, entries: BuilderDiffEntry[]): T {
  return entries.reduce<T>((acc, entry) => resetDiffEntry(acc, entry), config);
}
