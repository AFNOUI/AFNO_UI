/**
 * Pure row-action → `TableRequest` translation.
 *
 * ENGINE-OWNED and intentionally un-editable: the token grammar (`:id`,
 * `:{field}`, `{{value}}`, `{{rowId}}`, `{{row.field}}`) is part of the table
 * builder's contract, not a per-project preference. Sending the resulting
 * request is the variant's job — see `../transport/types.ts`.
 *
 * No HTTP client may be imported here — see AI_AGENT_RULES § R-53.
 */
import type { TableApiConfig, TableRowActionConfig } from "../types";
import type { TableRequest } from "./types";

function interpolatePath(path: string, row: Record<string, unknown>): string {
  return path
    .replace(/:id\b/g, String(row.id))
    .replace(/:(\w+)/g, (_, k: string) => String(row[k] ?? ""));
}

function buildQuery(query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return "";
  return "?" + new URLSearchParams(query).toString();
}

function interpolateBody(
  template: string,
  row: Record<string, unknown>,
  value: unknown,
): string {
  return template
    .replace(/{{value}}/g, JSON.stringify(value))
    .replace(/{{rowId}}/g, JSON.stringify(row.id))
    .replace(/{{row\.(\w+)}}/g, (_, k: string) => JSON.stringify(row[k]));
}

/** Method + interpolated path, used as the human-readable action label. */
export function rowActionLabel(
  action: TableRowActionConfig,
  row: Record<string, unknown>,
): string {
  return `${action.method} ${interpolatePath(action.path, row)}`;
}

function buildRequest(
  action: TableRowActionConfig,
  api: TableApiConfig,
  row: Record<string, unknown>,
  value: unknown,
  defaultBody: Record<string, unknown>,
): TableRequest {
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
      : JSON.stringify(defaultBody);
  }

  return {
    url,
    method: action.method,
    headers,
    body,
    label: `${action.method} ${path}`,
  };
}

/**
 * Request for an interactive cell change (switch / dropdown / radio / rating).
 * Defaults the body to `{ [columnKey]: value }`.
 */
export function buildRowActionRequest(
  action: TableRowActionConfig,
  api: TableApiConfig,
  row: Record<string, unknown>,
  value: unknown,
): TableRequest {
  return buildRequest(action, api, row, value, { [action.columnKey]: value });
}

/**
 * Request for a button-trigger row action (action-column buttons). No `value`
 * is involved, so `{{value}}` interpolates to `null` and the body defaults to
 * `{ id: row.id }`.
 */
export function buildRowActionButtonRequest(
  action: TableRowActionConfig,
  api: TableApiConfig,
  row: Record<string, unknown>,
): TableRequest {
  return buildRequest(action, api, row, null, { id: row.id });
}
