/**
 * Transport contracts for async / infinite option loading.
 *
 * This file is ENGINE-OWNED and deliberately dependency-free: it names the
 * seam between the parts of option-loading that can never change (building a
 * request from an `AsyncApiConfig`, tracking loading state, de-duplicating
 * pages) and the parts every project wants to own (which HTTP client sends
 * the request, how responses are cached, how auth headers are attached).
 *
 * Nothing here may import `axios`, `@tanstack/react-query`, or any other
 * transport library — see AI_AGENT_RULES § R-53.
 */
import type { FieldOption } from "../types/types";

/**
 * A library-agnostic description of one outbound request.
 *
 * Deliberately shaped so the two common adapters are near-trivial:
 *   axios → `{ url, method, headers, params, data: body }`
 *   fetch → `resolveRequestUrl(req)` + `{ method, headers, body }`
 */
export interface OptionsRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  /** Query-string values. Already flattened to primitives. */
  params?: Record<string, string | number | boolean>;
  /** JSON body. `undefined` for requests that carry no body. */
  body?: unknown;
}

/**
 * Sends one `OptionsRequest` and resolves with the parsed response body.
 *
 * Implementations live in the VARIANT layer (`services.ts`) so a project can
 * swap `fetch` for axios, attach interceptors, or refresh tokens without
 * touching an afnoui-managed file. The engine ships a `fetch` implementation
 * as the default — see `defaultTransport.ts`.
 */
export type OptionsTransport = (
  request: OptionsRequest,
  signal?: AbortSignal,
) => Promise<unknown>;

export interface OptionsPage {
  options: FieldOption[];
  hasMore: boolean;
  page: number;
}

export interface AsyncQueryState {
  data: FieldOption[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export interface InfiniteQueryState {
  pages: OptionsPage[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * The caching / state-management strategy behind the option hooks.
 *
 * Both members are React hooks and are called unconditionally from
 * `useAsyncOptions` / `useInfiniteOptions`. To stay compatible with the rules
 * of hooks, an adapter object MUST be module-level constant — never rebuilt
 * inside a component body. The provider enforces this by taking the adapter
 * as a value, not a factory.
 */
export interface OptionsQueryAdapter {
  /** One-shot list load. `key` changes re-run the query. */
  useAsyncQuery(args: {
    key: readonly unknown[];
    enabled: boolean;
    run: (signal?: AbortSignal) => Promise<FieldOption[]>;
  }): AsyncQueryState;

  /** Paginated load. `key` changes reset accumulated pages. */
  useInfiniteQuery(args: {
    key: readonly unknown[];
    enabled: boolean;
    run: (page: number, signal?: AbortSignal) => Promise<OptionsPage>;
  }): InfiniteQueryState;
}

/** Everything the option hooks need from the host project. */
export interface FormTransport {
  transport: OptionsTransport;
  adapter: OptionsQueryAdapter;
}
