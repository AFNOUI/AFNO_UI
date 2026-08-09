/**
 * The engine's built-in `fetch` transport for row actions — zero runtime
 * dependencies. This is what every install gets by default.
 *
 * Projects that need axios, interceptors or auth-refresh supply their own from
 * the variant's `services.ts` via `TableTransportProvider`; they never edit
 * this file. See AI_AGENT_RULES § R-53 / § R-54.
 */
import type { RowActionResult, TableRequest, TableTransport } from "./types";

/**
 * Never rejects — row actions report failure through `RowActionResult` so the
 * caller can decide whether to roll back and how loudly to complain.
 */
export function runTableRequest(request: TableRequest): Promise<RowActionResult> {
  const { label } = request;
  return fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, status: res.status, label };
    })
    .catch((e: unknown) => ({
      ok: false,
      status: 0,
      error: e instanceof Error ? e : new Error("network error"),
      label,
    }));
}

export const fetchTableTransport: TableTransport = runTableRequest;
