/**
 * The API data layer for a generated table: `constants.ts`, `services.ts` and
 * `useTableData.ts`.
 *
 * Extracted from `tableCodeGenerator.ts`, which had grown past 1100 lines with
 * this function alone near 500. See AI_AGENT_RULES § R-55 (the layering these
 * three files implement) and § R-56 / § R-57 (transport opt-ins + tunables).
 */
import type { TableBuilderConfig } from "@/tables/types";
import {
  DEFAULT_TRANSPORT,
  cliGatedNote,
  emitConstantsFile,
  tanstackConstants,
  type ConstantsEntry,
  type TransportChoice,
} from "@/lib/codegen/transport";

import { resolveSource, type GeneratedFile } from "./types";


/**
 * Everything the three emitters need, derived once from the config.
 *
 * Deliberately a flat bag of pre-computed strings rather than a clever object:
 * each emitter is then a pure template, and the (fiddly) per-feature derivation
 * lives in exactly one place — `buildDataPlan`.
 */
interface DataPlan {
  config: TableBuilderConfig;
  transport: TransportChoice;
  isAxios: boolean;
  isTanstack: boolean;
  apiConfig: TableBuilderConfig["apiConfig"];
  listMethod: string;
  listPath: string;
  constantsEntries: ConstantsEntry[];
  queryFields: string[];
  paramLines: string[];
  bodyBlock: string;
  listInit: string;
  fetchUrl: string;
  rowActionDocs: string;
  serviceMutatorFns: string[];
  serviceActionFns: string[];
  serviceImportNames: string[];
  hookMutators: string[];
  hookActionHandlers: string[];
  refetchDeps: string;
  returnFields: string;
  interfaceExtras: string;
}

/** Derives every per-feature string the emitters below interpolate. */
function buildDataPlan(
  config: TableBuilderConfig,
  transport: TransportChoice,
): DataPlan {
  const apiSearch = resolveSource(config, "search") === "api" && config.enableSearch;
  const apiFilter = resolveSource(config, "filter") === "api" && config.enableColumnFilters;
  const apiSort = resolveSource(config, "sort") === "api";
  const apiPage = resolveSource(config, "pagination") === "api" && config.enablePagination;
  const hasMultiSort = config.enableMultiSort;
  const hasInlineEdit = config.enableInlineEdit;
  const hasSelection = config.enableRowSelection;
  const hasBulk = config.enableBulkActions;
  const hasDnD = config.enableDnD;
  const apiConfig = config.apiConfig;
  const listMethod = apiConfig?.listMethod ?? "GET";
  const isPostLike = listMethod !== "GET";
  const rowActions = apiConfig?.rowActions ?? [];

  const sortType = hasMultiSort
    ? `Array<{ key: string; dir: "asc" | "desc" }>`
    : `{ key: string; dir: "asc" | "desc" } | null`;

  const queryFields: string[] = [];
  if (apiPage) queryFields.push("page: number;", "pageSize: number;");
  if (apiSearch) queryFields.push("search: string;");
  if (apiFilter) queryFields.push("filters: Record<string, string>;");
  if (apiSort) queryFields.push(`${hasMultiSort ? "sorts: " + sortType : "sort: " + sortType};`);

  const isAxios = transport.http === "axios";
  const isTanstack = transport.query === "tanstack";

  // R-57: every tunable lives in constants.ts, never inline in services/hooks.
  const constantsEntries: ConstantsEntry[] = [
    {
      name: "BASE_HEADERS",
      value: `${JSON.stringify(apiConfig?.headers ?? {})} as Record<string, string>`,
      doc: "Sent on every request. Add auth headers here.",
    },
    { name: "LIST_PATH", value: JSON.stringify(apiConfig?.listPath ?? ""), doc: "Appended to the endpoint for the list request." },
  ];
  if (config.enableRowSelection || config.enableBulkActions) {
    constantsEntries.push({ name: "BULK_DELETE_PATH", value: '"/bulk-delete"', doc: "Appended to the endpoint for bulk deletes." });
  }
  if (config.enableDnD) {
    constantsEntries.push({ name: "REORDER_PATH", value: '"/reorder"', doc: "Appended to the endpoint when persisting a new row order." });
  }
  if (isTanstack) constantsEntries.push(...tanstackConstants());

  const staticQueryLine = apiConfig?.listQuery && Object.keys(apiConfig.listQuery).length > 0
    ? `Object.entries(${JSON.stringify(apiConfig.listQuery)}).forEach(([k, v]) => params.set(k, v));`
    : "";

  // Build query-param assembly
  const paramLines: string[] = [`const params = new URLSearchParams();`];
  if (staticQueryLine) paramLines.push(staticQueryLine);
  if (apiPage) {
    paramLines.push(`params.set("page", String(query.page));`);
    paramLines.push(`params.set("size", String(query.pageSize));`);
  }
  if (apiSearch) paramLines.push(`if (query.search) params.set("q", query.search);`);
  if (apiFilter) {
    paramLines.push(`for (const [k, v] of Object.entries(query.filters)) {`);
    paramLines.push(`  if (v) params.set(\`filter[\${k}]\`, v);`);
    paramLines.push(`}`);
  }
  if (apiSort) {
    if (hasMultiSort) {
      paramLines.push(`query.sorts.forEach((s, i) => params.append(\`sort[\${i}]\`, \`\${s.key}:\${s.dir}\`));`);
    } else {
      paramLines.push(`if (query.sort) params.set("sort", \`\${query.sort.key}:\${query.sort.dir}\`);`);
    }
  }

  // Body interpolation for non-GET list requests
  const bodyTemplate = apiConfig?.listBody?.trim();
  const bodyBlock = isPostLike && bodyTemplate
    ? `
    const interpolated = ${JSON.stringify(bodyTemplate)}
      .replace(/{{search}}/g, JSON.stringify(${apiSearch ? "query.search ?? \"\"" : "\"\""}))
      .replace(/{{page}}/g, String(${apiPage ? "query.page" : "0"}))
      .replace(/{{pageSize}}/g, String(${apiPage ? "query.pageSize" : "0"}))
      .replace(/{{filters}}/g, JSON.stringify(${apiFilter ? "query.filters" : "{}"}))
      .replace(/{{sort}}/g, JSON.stringify(${apiSort ? (hasMultiSort ? "query.sorts" : "query.sort") : "null"}));`
    : "";

  const listPath = apiConfig?.listPath ?? "";
  const listInit = isPostLike
    ? `{ method: "${listMethod}", ${bodyTemplate ? "body: interpolated, " : ""}signal }`
    : `{ method: "GET", signal }`;

  // Uses the LIST_PATH constant (not the baked literal) so the import is live
  // and the path stays editable in constants.ts (R-57).
  const fetchUrl = "`${endpoint}${LIST_PATH}?${params}`";

  // ── Row actions: request fn (services) + stateful wrapper (hook) ──
  const serviceActionFns: string[] = [];
  const hookActionHandlers: string[] = [];
  const actionTypeFields: string[] = [];
  const serviceImportNames: string[] = [];

  for (const a of rowActions) {
    const fnName = toFnName(a.id, a.columnKey, a.trigger);
    const reqName = `${fnName}Request`;
    serviceImportNames.push(reqName);

    const tokens = (str: string) => str
      .replace(/:id\b/g, "${row.id}")
      .replace(/:(\w+)/g, (_, k) => "${String(row." + k + ")}");
    const pathInterp = tokens(a.path);
    const queryInterp = a.query && Object.keys(a.query).length > 0
      ? `\n  const aParams = new URLSearchParams(${JSON.stringify(a.query)});`
      : "";
    const isButton = a.trigger === "button";
    const sigParams = isButton ? "row: TRow" : "row: TRow, value: unknown";
    const svcSig = isButton
      ? "row: TRow"
      : "row: TRow, value: unknown";

    const bodyExpr = a.method === "GET" || a.method === "DELETE"
      ? ""
      : a.body
        ? `body: ${JSON.stringify(a.body)}.replace(/{{value}}/g, JSON.stringify(${isButton ? "null" : "value"})).replace(/{{rowId}}/g, JSON.stringify(row.id)).replace(/{{row\\.(\\w+)}}/g, (_, k) => JSON.stringify((row as Record<string, unknown>)[k])),`
        : `body: JSON.stringify(${isButton ? "{ id: row.id }" : `{ ${JSON.stringify(a.columnKey)}: value }`}),`;

    serviceActionFns.push(`
/**
 * ${a.method} \`\${endpoint}${a.path}\` — ${a.trigger} action for column "${a.columnKey}".
 * Per-row mutation, INDEPENDENT of the list endpoint.
 */
export async function ${reqName}<TRow extends { id: string }>(
  endpoint: string,
  ${svcSig},
): Promise<void> {${queryInterp}
  await request(\`\${endpoint}${pathInterp}${a.query ? "?${aParams}" : ""}\`, {
    method: ${JSON.stringify(a.method)},
    ${bodyExpr}
  });
}
`);

    const optimistic = a.optimistic !== false && !isButton
      ? `
    setData(prev => prev.map(r => r.id === row.id ? ({ ...r, [${JSON.stringify(a.columnKey)}]: value } as TRow) : r));
    const rollback = () => setData(prev => prev.map(r => r.id === row.id ? row : r));`
      : "";
    const rollbackCall = a.optimistic !== false && !isButton ? "\n      rollback();" : "";
    const callArgs = isButton ? "endpoint, row" : "endpoint, row, value";

    hookActionHandlers.push(`
  /**
   * ${a.method} \`\${endpoint}${a.path}\` — ${a.trigger} action for column "${a.columnKey}".
   * Optimistic update + rollback live here; the request lives in services.ts.
   */
  const ${fnName} = useCallback(async (${sigParams}): Promise<void> => {${optimistic}
    try {
      await ${reqName}(${callArgs});
    } catch (e) {${rollbackCall}
      throw e;
    }
  }, [endpoint]);
`);
    actionTypeFields.push(`  ${fnName}: (${sigParams}) => Promise<void>;`);
  }

  // ── Feature mutators: request fn (services) + stateful wrapper (hook) ──
  const serviceMutatorFns: string[] = [];
  const hookMutators: string[] = [];

  if (hasInlineEdit) {
    serviceImportNames.push("updateCellRequest");
    serviceMutatorFns.push(`
/** PATCH \`\${endpoint}/:rowId\` — update a single cell value. */
export async function updateCellRequest(
  endpoint: string,
  rowId: string,
  key: string,
  value: unknown,
): Promise<void> {
  await request(\`\${endpoint}/\${rowId}\`, {
    method: "PATCH",
    body: JSON.stringify({ [key]: value }),
  });
}
`);
    hookMutators.push(`
  /** Updates one cell, then mirrors the change into local state. */
  const updateCell = useCallback(async (rowId: string, key: keyof TRow, value: unknown): Promise<void> => {
    await updateCellRequest(endpoint, rowId, String(key), value);
    setData(prev => prev.map(r => (r.id === rowId ? ({ ...r, [key]: value } as TRow) : r)));
  }, [endpoint]);
`);
  }

  if (hasSelection || hasBulk) {
    serviceImportNames.push("deleteRowsRequest");
    serviceMutatorFns.push(`
/** POST \`\${endpoint}/bulk-delete\` — delete N rows in a single request. */
export async function deleteRowsRequest(
  endpoint: string,
  ids: ReadonlyArray<string>,
): Promise<void> {
  await request(\`\${endpoint}\${BULK_DELETE_PATH}\`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}
`);
    hookMutators.push(`
  /** Deletes N rows, then drops them from local state. */
  const deleteRows = useCallback(async (ids: ReadonlyArray<string>): Promise<void> => {
    await deleteRowsRequest(endpoint, ids);
    setData(prev => prev.filter(r => !ids.includes(r.id)));
    setTotal(t => Math.max(0, t - ids.length));
  }, [endpoint]);
`);
  }

  if (hasDnD) {
    serviceImportNames.push("reorderRowsRequest");
    serviceMutatorFns.push(`
/** POST \`\${endpoint}/reorder\` — persist a new row order. */
export async function reorderRowsRequest(
  endpoint: string,
  orderedIds: ReadonlyArray<string>,
): Promise<void> {
  await request(\`\${endpoint}\${REORDER_PATH}\`, {
    method: "POST",
    body: JSON.stringify({ order: orderedIds }),
  });
}
`);
    hookMutators.push(`
  /** Persists a new row order. */
  const reorderRows = useCallback(async (orderedIds: ReadonlyArray<string>): Promise<void> => {
    await reorderRowsRequest(endpoint, orderedIds);
  }, [endpoint]);
`);
  }

  const refetchDeps = [
    "endpoint",
    apiPage && "query.page", apiPage && "query.pageSize",
    apiSearch && "query.search",
    apiFilter && "query.filters",
    apiSort && (hasMultiSort ? "query.sorts" : "query.sort"),
  ].filter(Boolean).join(", ");

  const returnFields = [
    "data", "total", "loading", "error", "refetch",
    hasInlineEdit && "updateCell",
    (hasSelection || hasBulk) && "deleteRows",
    hasDnD && "reorderRows",
    ...rowActions.map(a => toFnName(a.id, a.columnKey, a.trigger)),
  ].filter(Boolean).join(", ");

  const rowActionDocs = rowActions.length === 0
    ? " (none)"
    : "\n *   " + rowActions.map(a => `${a.method} \`\${endpoint}${a.path}\`  ← ${a.trigger} on column "${a.columnKey}"`).join("\n *   ");

  const interfaceExtras = [
    hasInlineEdit && "  updateCell: (rowId: string, key: keyof TRow, value: unknown) => Promise<void>;",
    (hasSelection || hasBulk) && "  deleteRows: (ids: ReadonlyArray<string>) => Promise<void>;",
    hasDnD && "  reorderRows: (orderedIds: ReadonlyArray<string>) => Promise<void>;",
    ...actionTypeFields,
  ].filter(Boolean).join("\n");


  return {
    config,
    transport,
    isAxios,
    isTanstack,
    apiConfig,
    listMethod,
    listPath,
    constantsEntries,
    queryFields,
    paramLines,
    bodyBlock,
    listInit,
    fetchUrl,
    rowActionDocs,
    serviceMutatorFns,
    serviceActionFns,
    serviceImportNames,
    hookMutators,
    hookActionHandlers,
    refetchDeps,
    returnFields,
    interfaceExtras,
  };
}

/** Emits `services.ts` — the only file that talks to the network (R-55). */
function emitServicesCode(plan: DataPlan): string {
  const {
    config,
    transport,
    isAxios,
    isTanstack,
    apiConfig,
    listMethod,
    listPath,
    constantsEntries,
    queryFields,
    paramLines,
    bodyBlock,
    listInit,
    fetchUrl,
    rowActionDocs,
    serviceMutatorFns,
    serviceActionFns,
  } = plan;

  // ─────────────────────────── services.ts ───────────────────────────
  const constantsImports = constantsEntries
    .filter((e) => !isTanstack || (e.name !== "STALE_TIME_MS" && e.name !== "GC_TIME_MS"))
    .map((e) => e.name);

  // When axios is chosen the ENGINE must use it too, not just this file:
  // `TablePreview` fires `apiConfig.rowActions` through its own transport
  // context, which defaults to fetch. Exporting an adapter here (and mounting
  // the provider in DataTable.tsx) keeps both halves on the same client.
  const engineTransport = isAxios
    ? `
/**
 * Adapter that lets the ENGINE's row-action path use axios as well.
 * \`DataTable.tsx\` mounts this via \`TableTransportProvider\`; without it
 * \`TablePreview\` would keep using its built-in fetch default.
 */
export const tableTransport: TableTransport = async (request) => {
  try {
    const res = await axios.request({
      url: request.url,
      method: request.method,
      headers: request.headers,
      data: request.body === undefined ? undefined : JSON.parse(request.body),
    });
    return { ok: true, status: res.status, label: request.label };
  } catch (e) {
    const status = axios.isAxiosError(e) ? (e.response?.status ?? 0) : 0;
    return {
      ok: false,
      status,
      error: e instanceof Error ? e : new Error("network error"),
      label: request.label,
    };
  }
};
`
    : "";

  const requestHelper = isAxios
    ? `import axios from "axios";
import type { TableTransport } from "../../components/tables/transport/types";

/**
 * Single place the HTTP client is named. Every function below goes through it,
 * so swapping clients (or adding interceptors / auth refresh) is a one-spot
 * change. axios rejects on non-2xx already, so errors propagate untouched.
 */
async function request<T = void>(
  url: string,
  init: { method: string; body?: string; signal?: AbortSignal },
): Promise<T> {
  const res = await axios.request<T>({
    url,
    method: init.method,
    headers: { "Content-Type": "application/json", ...BASE_HEADERS },
    data: init.body === undefined ? undefined : JSON.parse(init.body),
    signal: init.signal,
  });
  return res.data;
}`
    : `/**
 * Single place the HTTP client is named. Every function below goes through it,
 * so swapping \`fetch\` for axios (or adding interceptors / auth refresh) is a
 * one-spot change rather than an edit per function.
 */
async function request<T = void>(
  url: string,
  init: { method: string; body?: string; signal?: AbortSignal },
): Promise<T> {
  const res = await fetch(url, {
    method: init.method,
    headers: { "Content-Type": "application/json", ...BASE_HEADERS },
    body: init.body,
    signal: init.signal,
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}`;

  const servicesCode = `/**
 * Network layer for this DataTable — the ONLY file here that talks to your
 * backend (AI_AGENT_RULES § R-55: component → hooks → services).
 *
 * List endpoint (table-wide search / sort / filter / pagination):
 *   ${listMethod} \`${apiConfig?.baseUrl ?? config.apiEndpoint}${listPath}\`
 *
 * Row-action endpoints (per-row mutations from interactive cells like
 * dropdown / switch / radio / checkbox / rating / button — INDEPENDENT
 * of the list endpoint and target a single row at a time):${rowActionDocs}
 *
 * Every function throws on a non-2xx response and lets the error propagate —
 * catch it in the hook layer and handle it however your app does (custom error
 * class, status-code mapping, toast). Nothing is swallowed here.
 *
${cliGatedNote("http", transport)}
 */
import {
  ${constantsImports.join(",\n  ")},
} from "./constants";

export interface TableQuery {
${queryFields.map(f => "  " + f).join("\n")}
}

export interface TableListResult<TRow> {
  rows: TRow[];
  total: number;
}

${requestHelper}

/** Fetches one page of rows for the current query. */
export async function fetchRows<TRow extends { id: string }>(
  endpoint: string,
  query: TableQuery,
  signal?: AbortSignal,
): Promise<TableListResult<TRow>> {
  ${paramLines.join("\n  ")}${bodyBlock}
  const json = await request<{ data: TRow[]; total: number } | TRow[]>(${fetchUrl}, ${listInit});
  const list = Array.isArray(json) ? json : json.data;
  return {
    rows: list,
    total: Array.isArray(json) ? list.length : (json.total ?? list.length),
  };
}
${serviceMutatorFns.join("")}${serviceActionFns.join("")}${engineTransport}`;

  // ────────────────────────── useTableData.ts ──────────────────────────

  return servicesCode;
}

/** Emits `useTableData.ts` — state, optimistic updates, rollback (R-55). */
function emitHookCode(plan: DataPlan): string {
  const {
    transport,
    isTanstack,
    serviceImportNames,
    hookMutators,
    hookActionHandlers,
    refetchDeps,
    returnFields,
    interfaceExtras,
  } = plan;

  const importList = ["fetchRows", ...serviceImportNames];
  const hookCode = `${isTanstack ? `import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { STALE_TIME_MS, GC_TIME_MS } from "./constants";` : `import { useCallback, useEffect, useState } from "react";`}

import type { Row } from "./tableConfig";
import {
  ${importList.join(",\n  ")},
  type TableQuery,${isTanstack ? "\n  type TableListResult," : ""}
} from "./services";

/**
 * Server-driven data hook for this DataTable.
 *
 * Per AI_AGENT_RULES § R-55 this is the ONLY caller of \`services.ts\` — the
 * component never imports it. React state, optimistic updates and rollback
 * live here; the requests live there.
 *
 * Errors from services propagate untouched, so you can catch them here and
 * apply your own handling (custom error class, status mapping, toast).
 *
 * Only the inputs, mutators and handlers your enabled features need are
 * emitted — no dead state, no unused destructures.
 *
${cliGatedNote("query", transport)}
 */
export type { TableQuery };

export interface UseTableData<TRow extends { id: string }> {
  data: TRow[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
${interfaceExtras}
}

export function useTableData<TRow extends { id: string } = Row>(
  endpoint: string,
  query: TableQuery,
): UseTableData<TRow> {
${isTanstack ? `  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["table-rows", endpoint, query] as const, [${refetchDeps}]);

  const { data: page, isPending: loading, error } = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchRows<TRow>(endpoint, query, signal),
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
  });

  const data = useMemo(() => page?.rows ?? [], [page]);
  const total = page?.total ?? 0;

  // Mutators below are written against setData/setTotal so the exact same code
  // works under either strategy. Here they write through the query cache.
  const setData = useCallback((updater: (prev: TRow[]) => TRow[]): void => {
    queryClient.setQueryData<TableListResult<TRow>>(queryKey, (prev) =>
      prev ? { ...prev, rows: updater(prev.rows) } : prev,
    );
  }, [queryClient, queryKey]);

  const setTotal = useCallback((updater: (prev: number) => number): void => {
    queryClient.setQueryData<TableListResult<TRow>>(queryKey, (prev) =>
      prev ? { ...prev, total: updater(prev.total) } : prev,
    );
  }, [queryClient, queryKey]);

  const refetch = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);` : `  const [data, setData] = useState<TRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    const ctrl = new AbortController();
    try {
      const result = await fetchRows<TRow>(endpoint, query, ctrl.signal);
      setData(result.rows);
      setTotal(result.total);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  }, [${refetchDeps}]);

  useEffect(() => { void refetch(); }, [refetch]);`}
${hookMutators.join("")}${hookActionHandlers.join("\n")}

  return { ${returnFields} };
}
`;


  return hookCode;
}

/**
 * Emits the API data layer as THREE files, per AI_AGENT_RULES § R-55 / § R-57:
 *
 *   constants.ts    — every tunable (headers, paths, cache windows).
 *   services.ts     — every request. The only file that talks to the network.
 *   useTableData.ts — React state, optimistic updates and rollback. The only
 *                     caller of services.ts.
 *
 * `DataTable.tsx` imports the hook and never imports services directly.
 */
export function generateDataFiles(
  config: TableBuilderConfig,
  transport: TransportChoice = DEFAULT_TRANSPORT,
): GeneratedFile[] {
  const plan = buildDataPlan(config, transport);
  const servicesCode = emitServicesCode(plan);
  const hookCode = emitHookCode(plan);

  return [
    {
      name: "constants.ts",
      path: "src/components/tables/constants.ts",
      description: "Tunables for this table — headers, paths, cache windows. Edit here, not in services/hooks.",
      isFixed: false,
      language: "ts",
      code: emitConstantsFile(`the ${config.title ?? "DataTable"} table`, plan.constantsEntries),
    },
    {
      name: "services.ts",
      path: "src/components/tables/services.ts",
      description: `Network layer (${transport.http}) — the only file that talks to your backend.`,
      isFixed: false,
      language: "ts",
      code: servicesCode,
    },
    {
      name: "useTableData.ts",
      path: "src/components/tables/useTableData.ts",
      description: "Server-side data hook. State, optimistic updates and rollback; calls services.ts.",
      isFixed: false,
      language: "ts",
      code: hookCode,
    },
  ];
}



/** Build a safe handler name like `onSwitchActive` from action metadata. */
function toFnName(actionId: string, columnKey: string, trigger: string): string {
  const trig = trigger.charAt(0).toUpperCase() + trigger.slice(1);
  const safeKey = columnKey
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return `on${trig}${safeKey || actionId.replace(/[^a-zA-Z0-9]/g, "")}`;
}
