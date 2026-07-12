/**
 * Network layer for row-action API calls. Kept dependency-free (no React, no
 * UI imports) so the same helpers can be reused from tests, server-side
 * code, or alternative renderers.
 *
 * All token interpolation (`:id`, `:{field}`, `{{value}}`, `{{rowId}}`,
 * `{{row.field}}`) lives here — components and hooks call the high-level
 * `runRowActionRequest` / `runRowActionButton` functions.
 */
import type { TableApiConfig, TableRowActionConfig } from "./types";

function interpolatePath(path: string, row: Record<string, unknown>): string {
  return path
    .replace(/:id\b/g, String(row.id))
    .replace(/:(\w+)/g, (_, k: string) => String(row[k] ?? ""));
}

function buildQuery(query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return "";
  return "?" + new URLSearchParams(query).toString();
}

function interpolateBody(template: string, row: Record<string, unknown>, value: unknown): string {
  return template
    .replace(/{{value}}/g, JSON.stringify(value))
    .replace(/{{rowId}}/g, JSON.stringify(row.id))
    .replace(/{{row\.(\w+)}}/g, (_, k: string) => JSON.stringify(row[k]));
}

export interface RowActionResult {
  ok: boolean;
  status: number;
  error?: Error;
  /** Method + interpolated path — handy for toast messages. */
  label: string;
}

/**
 * Fire the configured request for an interactive cell change
 * (switch / dropdown / radio / rating). Returns a result object — callers
 * decide whether to rollback / surface a toast.
 */
export async function runRowActionRequest(
  action: TableRowActionConfig,
  api: TableApiConfig,
  row: Record<string, unknown>,
  value: unknown,
): Promise<RowActionResult> {
  const path = interpolatePath(action.path, row);
  const url = `${api.baseUrl}${path}${buildQuery(action.query)}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(api.headers ?? {}),
  };
  let body: string | undefined;
  if (action.method !== "GET" && action.method !== "DELETE") {
    body = action.body
      ? interpolateBody(action.body, row, value)
      : JSON.stringify({ [action.columnKey]: value });
  }
  const label = `${action.method} ${path}`;
  try {
    const res = await fetch(url, { method: action.method, headers, body });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, status: res.status, label };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e : new Error("network error"),
      label,
    };
  }
}

/**
 * Fire a button-trigger row action (action column buttons). Same semantics
 * as `runRowActionRequest`, but no `value` is involved — body interpolation
 * skips `{{value}}` and defaults to `{ id: row.id }`.
 */
export async function runRowActionButton(
  action: TableRowActionConfig,
  api: TableApiConfig,
  row: Record<string, unknown>,
): Promise<RowActionResult> {
  const path = interpolatePath(action.path, row);
  const url = `${api.baseUrl}${path}${buildQuery(action.query)}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(api.headers ?? {}),
  };
  let body: string | undefined;
  if (action.method !== "GET" && action.method !== "DELETE") {
    body = action.body
      ? interpolateBody(action.body, row, null)
      : JSON.stringify({ id: row.id });
  }
  const label = `${action.method} ${path}`;
  try {
    const res = await fetch(url, { method: action.method, headers, body });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, status: res.status, label };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e : new Error("network error"),
      label,
    };
  }
}
