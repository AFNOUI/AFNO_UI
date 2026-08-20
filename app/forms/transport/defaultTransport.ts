/**
 * The engine's built-in `fetch` transport — zero runtime dependencies.
 *
 * This is the DEFAULT every install gets. Projects that want axios (or an
 * authenticated client, or interceptors) override it from their variant's
 * `services.ts` via `FormTransportProvider`; they never edit this file.
 *
 * See AI_AGENT_RULES § R-53 / § R-54.
 */
import { resolveRequestUrl } from "./requestBuilder";
import type { OptionsRequest, OptionsTransport } from "./types";

/** Thrown for non-2xx responses so adapters can surface a real error. */
export class OptionsRequestError extends Error {
  readonly status: number;

  constructor(status: number, url: string) {
    super(`Request failed with status ${status}: ${url}`);
    this.name = "OptionsRequestError";
    this.status = status;
  }
}

function hasBody(request: OptionsRequest): boolean {
  return request.body !== undefined && request.method !== "GET";
}

export const fetchOptionsTransport: OptionsTransport = async (request, signal) => {
  const headers: Record<string, string> = { ...(request.headers ?? {}) };
  if (hasBody(request) && !hasHeader(headers, "content-type")) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(resolveRequestUrl(request), {
    method: request.method,
    headers,
    body: hasBody(request) ? JSON.stringify(request.body) : undefined,
    signal,
  });

  if (!response.ok) throw new OptionsRequestError(response.status, request.url);
  if (response.status === 204) return null;

  return response.json();
};

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === lower);
}
