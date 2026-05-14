import type { AxiosRequestConfig } from "axios";

import type { AsyncApiConfig } from "../types/types";

/** Placeholder replaced with the serialized watched field value (dependent API). */
export const DEPENDENCY_VALUE_TOKEN = "{value}";

/** Serialize a watched form value for URL/body substitution (arrays → comma-separated). */
export function serializeWatchValue(watch: unknown): string {
  if (watch === undefined || watch === null) return "";
  if (Array.isArray(watch)) return watch.map(String).join(",");
  return String(watch);
}

export function substituteDependencyToken(input: string, replacement: string): string {
  if (!input.includes(DEPENDENCY_VALUE_TOKEN)) return input;
  return input.split(DEPENDENCY_VALUE_TOKEN).join(replacement);
}

/**
 * REST-style path segments: `/:id`, `/:value` (before `?` or end of path).
 * Replaced with `encodeURIComponent` of the watched value so country/city URLs stay valid.
 * Use after `{value}` substitution, or instead of `{value}` in the path segment.
 */
export function substitutePathParamPlaceholders(url: string, replacement: string): string {
  const raw = String(replacement ?? "");
  if (!raw || (!url.includes("/:id") && !url.includes("/:value"))) return url;
  const enc = encodeURIComponent(raw);
  const qIdx = url.indexOf("?");
  const path = qIdx === -1 ? url : url.slice(0, qIdx);
  const rest = qIdx === -1 ? "" : url.slice(qIdx);
  const newPath = path
    .replace(/\/:id(?=\/|\?|$)/g, `/${enc}`)
    .replace(/\/:value(?=\/|\?|$)/g, `/${enc}`);
  return newPath + rest;
}

function deepSubstitute(value: unknown, replacement: string): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return substituteDependencyToken(value, replacement);
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => deepSubstitute(v, replacement));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const nk = substituteDependencyToken(k, replacement);
    out[nk] = deepSubstitute(v, replacement);
  }
  return out;
}

function hasMeaningfulPayload(payload: unknown): boolean {
  if (payload === undefined || payload === null) return false;
  if (typeof payload !== "object") return true;
  if (Array.isArray(payload)) return payload.length > 0;
  return Object.keys(payload as Record<string, unknown>).length > 0;
}

/** Flatten a JSON-like object into axios query params (primitives only; objects JSON-stringified). */
export function flattenPayloadToQueryParams(
  payload: Record<string, unknown>
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else {
      out[k] = JSON.stringify(v);
    }
  }
  return out;
}

/**
 * Applies `{value}` substitution from `_watchValue` to url, headers, and payload.
 * Call before building the axios config; keep `_watchValue` on the returned object for query keys.
 */
export function resolveAsyncApiConfigForFetch(api: AsyncApiConfig): AsyncApiConfig {
  const replacement = serializeWatchValue(api._watchValue);
  const url = substitutePathParamPlaceholders(
    substituteDependencyToken(api.url ?? "", replacement),
    replacement,
  );
  const headers = api.headers
    ? Object.fromEntries(
        Object.entries(api.headers).map(([k, v]) => [
          substituteDependencyToken(k, replacement),
          substituteDependencyToken(v, replacement),
        ]),
      )
    : undefined;
  const payload =
    api.payload === undefined || api.payload === null
      ? undefined
      : (deepSubstitute(api.payload, replacement) as Record<string, unknown> | unknown[]);

  return { ...api, url, headers, payload: payload as AsyncApiConfig["payload"] };
}

const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

function methodUsesJsonBody(
  method: AsyncApiConfig["method"],
  originalPayload: AsyncApiConfig["payload"],
): boolean {
  if (BODY_METHODS.has(method)) return true;
  if (method === "DELETE" && hasMeaningfulPayload(originalPayload)) return true;
  return false;
}

/**
 * Builds axios config for async/infinite option fetches.
 * - GET (and DELETE without a meaningful payload): `payload` is merged into **query params** with `dynamicParams`.
 * - POST / PUT / PATCH, and DELETE with a payload: JSON body = substituted `payload` + `dynamicParams`.
 *   If there was no user payload, injects `{ value: <watch> }` so POST dependent calls work without an explicit body.
 */
export function buildAxiosConfigForAsyncApi(
  apiConfig: AsyncApiConfig,
  dynamicParams: Record<string, string | number> = {},
): AxiosRequestConfig {
  const resolved = resolveAsyncApiConfigForFetch(apiConfig);
  const method = resolved.method;
  const repl = serializeWatchValue(apiConfig._watchValue);
  const hadUserPayload = hasMeaningfulPayload(apiConfig.payload);

  if (methodUsesJsonBody(method, apiConfig.payload)) {
    if (Array.isArray(resolved.payload)) {
      return {
        url: resolved.url,
        method,
        headers: resolved.headers,
        data: resolved.payload,
      };
    }
    let body: Record<string, unknown> =
      resolved.payload && typeof resolved.payload === "object" && !Array.isArray(resolved.payload)
        ? { ...(resolved.payload as Record<string, unknown>) }
        : {};
    if (!hadUserPayload && repl) {
      body = { value: repl, ...body };
    }
    return {
      url: resolved.url,
      method,
      headers: resolved.headers,
      data: { ...body, ...dynamicParams },
    };
  }

  const queryFromPayload =
    resolved.payload &&
    typeof resolved.payload === "object" &&
    !Array.isArray(resolved.payload)
      ? flattenPayloadToQueryParams(resolved.payload as Record<string, unknown>)
      : {};

  return {
    url: resolved.url,
    method,
    headers: resolved.headers,
    params: { ...queryFromPayload, ...dynamicParams },
  };
}
