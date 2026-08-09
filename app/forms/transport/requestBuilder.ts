/**
 * Pure `AsyncApiConfig` → `OptionsRequest` translation.
 *
 * ENGINE-OWNED and intentionally un-editable: the token grammar documented on
 * `DependentApiConfig` (`{value}`, `/:id`, `/:value`) and the method/body rules
 * below are part of the builder's contract, not a per-project preference. What
 * a project *does* want to own — the HTTP client, headers, retries, caching —
 * is injected instead (see `types.ts`).
 *
 * No transport library may be imported here — see AI_AGENT_RULES § R-53.
 */
import type { AsyncApiConfig } from "../types/types";

import {
  serializeWatchValue,
  hasMeaningfulPayload,
  flattenPayloadToQueryParams,
  resolveAsyncApiConfigForFetch,
} from "../utils/dependentApiRequest";
import type { OptionsRequest } from "./types";

const BODY_METHODS = new Set<AsyncApiConfig["method"]>(["POST", "PUT", "PATCH"]);

function methodUsesJsonBody(
  method: AsyncApiConfig["method"],
  originalPayload: AsyncApiConfig["payload"],
): boolean {
  if (BODY_METHODS.has(method)) return true;
  if (method === "DELETE" && hasMeaningfulPayload(originalPayload)) return true;
  return false;
}

/**
 * Builds the transport-agnostic request for an async / infinite option fetch.
 *
 * - GET (and DELETE without a meaningful payload): `payload` is merged into
 *   **query params** alongside `dynamicParams` (search / page / pageSize).
 * - POST / PUT / PATCH, and DELETE with a payload: JSON **body** = substituted
 *   `payload` + `dynamicParams`. When the user supplied no payload, injects
 *   `{ value: <watch> }` so dependent POST calls work without an explicit body.
 */
export function buildOptionsRequest(
  apiConfig: AsyncApiConfig,
  dynamicParams: Record<string, string | number> = {},
): OptionsRequest {
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
        body: resolved.payload,
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
      body: { ...body, ...dynamicParams },
    };
  }

  const queryFromPayload =
    resolved.payload && typeof resolved.payload === "object" && !Array.isArray(resolved.payload)
      ? flattenPayloadToQueryParams(resolved.payload as Record<string, unknown>)
      : {};

  return {
    url: resolved.url,
    method,
    headers: resolved.headers,
    params: { ...queryFromPayload, ...dynamicParams },
  };
}

/**
 * Collapses `params` into the URL query string.
 *
 * Clients that take params separately (axios) should ignore this; clients that
 * do not (`fetch`) call it to get the final URL. Existing query strings on the
 * configured URL are preserved.
 */
export function resolveRequestUrl(request: OptionsRequest): string {
  const entries = Object.entries(request.params ?? {});
  if (entries.length === 0) return request.url;
  const search = new URLSearchParams();
  for (const [key, value] of entries) search.set(key, String(value));
  return request.url + (request.url.includes("?") ? "&" : "?") + search.toString();
}

/** Pagination params for one page, derived from the config's param names. */
export function buildPaginationParams(
  apiConfig: AsyncApiConfig,
  search: string,
  page: number,
  size: number,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (apiConfig.searchParam && search) params[apiConfig.searchParam] = search;
  if (apiConfig.pageParam) {
    params[apiConfig.pageParam] = apiConfig.offsetBased ? (page - 1) * size : page;
  }
  if (apiConfig.pageSizeParam) params[apiConfig.pageSizeParam] = size;
  return params;
}
