/**
 * Mustache-style template renderer for the user-defined row dialog.
 *
 * Supports:
 *   {{row.field}}            → row[field] (HTML-escaped)
 *   {{{row.field}}}          → row[field] (raw — for trusted nested HTML)
 *   {{value}}                → cell value (HTML-escaped)
 *   {{#if row.field}}…{{/if}}        → conditional block
 *   {{#each row.tags}}…{{/each}}     → loops over array; inner uses {{this}}
 *
 * After interpolation the result is sanitized to remove <script> tags and
 * inline event handlers (on*=…) so a careless template can't introduce XSS
 * even if the row data is user-controlled. The result is meant to be used
 * with `dangerouslySetInnerHTML`.
 */

function escapeHtml(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolvePath(scope: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".").map((p) => p.trim()).filter(Boolean);
  let current: unknown = scope;
  for (const part of parts) {
    if (current == null) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function isTruthy(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === "object") return Object.keys(v).length > 0;
  return Boolean(v);
}

/** Strip <script> blocks, inline `on*=` handlers, and `javascript:` URLs. */
function sanitize(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src|action)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src|action)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'");
}

interface Scope {
  row: Record<string, unknown>;
  value: unknown;
  this?: unknown;
}

function renderInternal(template: string, scope: Scope): string {
  // Each loops first.
  let out = template.replace(
    /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_m, path: string, body: string) => {
      const list = resolvePath(scope as unknown as Record<string, unknown>, path);
      if (!Array.isArray(list)) return "";
      return list
        .map((item) => renderInternal(body, { ...scope, this: item }))
        .join("");
    },
  );

  // If blocks.
  out = out.replace(
    /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_m, path: string, body: string) => {
      const v = resolvePath(scope as unknown as Record<string, unknown>, path);
      return isTruthy(v) ? renderInternal(body, scope) : "";
    },
  );

  // Triple-stache (raw).
  out = out.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_m, path: string) => {
    const v = resolvePath(scope as unknown as Record<string, unknown>, path);
    return v == null ? "" : String(v);
  });

  // Double-stache (escaped).
  out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => {
    const v = resolvePath(scope as unknown as Record<string, unknown>, path);
    return escapeHtml(v);
  });

  return out;
}

export function renderRowDialogTemplate(
  template: string,
  ctx: { row: Record<string, unknown>; value: unknown },
): string {
  const interpolated = renderInternal(template, { row: ctx.row, value: ctx.value });
  return sanitize(interpolated);
}

/** Render a plain-text mustache string (used for dialog title/description). */
export function renderRowDialogText(
  template: string,
  ctx: { row: Record<string, unknown>; value: unknown },
): string {
  const out = template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => {
    const v = resolvePath({ row: ctx.row, value: ctx.value }, path);
    return v == null ? "" : String(v);
  });
  return out;
}
