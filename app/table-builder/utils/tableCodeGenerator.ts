/**
 * Type-safe code generator for the Data Table Builder.
 *
 * Design
 * ──────
 * • Strict TypeScript — no `any`. Generic <TRow extends { id: string }>.
 * • Per-feature data source: search / filter / sort / pagination can each be
 *   "client" or "api" independently. The hook only sends/handles what's set
 *   to "api"; client-side features stay client-side inside the engine.
 * • The hook also exposes feature-aware mutators (updateCell, deleteRows,
 *   reorderRows) — only emitted when the matching feature is enabled.
 * • Fixed shared engine files (TablePreview / types / useTablePreview /
 *   ui/table) are listed once. Optional engine deps (@dnd-kit/*,
 *   @tanstack/react-virtual) are only listed when the user actually needs
 *   them.
 */

import type { TableBuilderConfig, TableColumnConfig } from "@/tables/types";

/**
 * Source strings used to emit a real `renderers.tsx` file alongside
 * `tableConfig.ts`. Functions can't be JSON-serialised so the generator
 * reads these strings to reproduce them verbatim.
 */
export interface TableRendererSources {
  /** Import lines emitted at the top of the generated renderers.tsx file. */
  imports?: string;
  /** Body of the single reusable renderer — a CellRenderer<Row> expression. */
  reusable?: string;
  /** Map of columnId → CellRenderer<Row> expression (per-column overrides). */
  perColumn?: Record<string, string>;
  /**
   * Body of `rowClickAction.renderDialog` — a `RowDialogRenderer<Row>`
   * expression. When present, `tableConfig.ts` wires it onto
   * `rowClickAction.renderDialog`. Falls back to `dialogTemplate` / default
   * field-grid when omitted.
   */
  dialog?: string;
  /**
   * Body of `renderExpandedRow` — an `ExpandedRowRenderer<Row>` expression.
   * Falls back to `expandableLayout` switch when omitted.
   */
  expandedRow?: string;
  /**
   * Body of `renderPagination` — a `PaginationRenderer` expression.
   * Falls back to <DefaultPaginationBar /> (paginationLayout switch).
   */
  pagination?: string;
}

export type DataMode = "static" | "api";

export interface GeneratedFile {
  name: string;
  path: string;
  description: string;
  isFixed: boolean;
  language: "tsx" | "ts" | "json";
  code: string;
}

const json = (v: unknown) => JSON.stringify(v, null, 2);

function resolveSource(
  config: TableBuilderConfig,
  key: "search" | "filter" | "sort" | "pagination",
): "client" | "api" {
  const explicit = config.sources?.[key];
  if (explicit) return explicit;
  if (key === "sort") return config.sortMode;
  if (key === "pagination") return config.paginationMode;
  return config.sortMode;
}

function pickRowType(cols: TableColumnConfig[]): string {
  const fieldLines = cols
    .filter(c => c.visible && c.type !== "actions")
    .map(c => {
      let tsType = "string";
      switch (c.type) {
        case "number":
        case "currency":
        case "progress":
        case "rating":
          tsType = "number"; break;
        case "boolean":
        case "switch":
          tsType = "boolean"; break;
        case "tags":
          tsType = "string[]"; break;
        default:
          tsType = "string";
      }
      return `  ${JSON.stringify(c.key)}: ${tsType};`;
    })
    .join("\n");

  // `extends TableRow` gives Row the `Record<string, unknown>` index signature, so
  // `Row[]` stays assignable to TablePreview's `data: Record<string, unknown>[]` prop
  // in the consumer project (a bare interface has no index signature — TS2322).
  return `export interface Row extends TableRow {
  id: string;
${fieldLines}${cols.some(c => c.type === "avatar-image") ? "\n  avatarUrl?: string;" : ""}
}
`;
}

function cleanedConfig(config: TableBuilderConfig): Partial<TableBuilderConfig> {
  const cols = config.columns.filter(c => c.visible);
  // Emit EVERY boolean `enable*` flag (both true AND false). They are all REQUIRED
  // on TableBuilderConfig, so the generated `… satisfies TableBuilderConfig` literal
  // must carry them — omitting the false ones makes the installed `tableConfig.ts`
  // fail to type-check in the consumer project.
  const enableKeys = (Object.keys(config) as (keyof TableBuilderConfig)[])
    .filter((k) => k.startsWith("enable") && typeof config[k] === "boolean");

  const out: Record<string, unknown> = {
    title: config.title,
    description: config.description,
    direction: config.direction,
    density: config.density,
    pageSize: config.pageSize,
    sortMode: config.sortMode,
    paginationMode: config.paginationMode,
  };
  if (config.sources) out.sources = config.sources;
  if (config.apiEndpoint) out.apiEndpoint = config.apiEndpoint;
  if (config.apiConfig) out.apiConfig = config.apiConfig;
  if (config.groupBy) out.groupBy = config.groupBy;
  if (config.expandableLayout) out.expandableLayout = config.expandableLayout;
  if (config.expandableIconStyle) out.expandableIconStyle = config.expandableIconStyle;
  if (config.expandableIconPosition) out.expandableIconPosition = config.expandableIconPosition;
  if (config.paginationLayout) out.paginationLayout = config.paginationLayout;
  if (config.showPageSizeSelector) out.showPageSizeSelector = true;
  if (config.pageSizeOptions) out.pageSizeOptions = config.pageSizeOptions;
  if (config.showPageInfo === false) out.showPageInfo = false;
  if (config.showFirstLastButtons === false) out.showFirstLastButtons = false;
  if (config.virtualRowHeight) out.virtualRowHeight = config.virtualRowHeight;
  if (config.virtualMaxHeight) out.virtualMaxHeight = config.virtualMaxHeight;
  for (const k of enableKeys) out[k] = config[k];
  out.columns = cols;
  if (config.columnGroups?.length) out.columnGroups = config.columnGroups;
  if (config.rowClickAction && config.rowClickAction.type !== "none") {
    out.rowClickAction = config.rowClickAction;
  }
  if (config.stickyMaxHeight) out.stickyMaxHeight = config.stickyMaxHeight;
  return out as Partial<TableBuilderConfig>;
}

// ─────────────── Hook generation (per-feature API source) ───────────────

function generateHook(config: TableBuilderConfig): GeneratedFile {
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

  const headersLine = apiConfig?.headers && Object.keys(apiConfig.headers).length > 0
    ? `const baseHeaders: Record<string, string> = ${JSON.stringify(apiConfig.headers)};`
    : `const baseHeaders: Record<string, string> = {};`;

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
  const fetchInit = isPostLike
    ? `{
        method: "${listMethod}",
        headers: { "Content-Type": "application/json", ...baseHeaders },
        ${bodyTemplate ? "body: interpolated," : ""}
        signal: ctrl.signal,
      }`
    : `{ method: "GET", headers: baseHeaders, signal: ctrl.signal }`;

  const fetchUrl = isPostLike
    ? `\`\${endpoint}${listPath}?\${params}\``
    : `\`\${endpoint}${listPath}?\${params}\``;

  // ── Row-action handlers ──
  const actionHandlers: string[] = [];
  const actionTypeFields: string[] = [];
  for (const a of rowActions) {
    const fnName = toFnName(a.id, a.columnKey, a.trigger);
    const tokens = (s: string) => s
      .replace(/:id\b/g, "${row.id}")
      .replace(/:(\w+)/g, (_, k) => "${String(row." + k + ")}");
    const pathInterp = tokens(a.path);
    const queryInterp = a.query && Object.keys(a.query).length > 0
      ? `\n    const aParams = new URLSearchParams(${JSON.stringify(a.query)});`
      : "";
    const sigParams = a.trigger === "button" ? "row: TRow" : "row: TRow, value: unknown";
    const optimistic = a.optimistic !== false && a.trigger !== "button"
      ? `
    setData(prev => prev.map(r => r.id === row.id ? ({ ...r, [${JSON.stringify(a.columnKey)}]: value } as TRow) : r));
    const rollback = () => setData(prev => prev.map(r => r.id === row.id ? row : r));`
      : "";
    const bodyExpr = a.method === "GET" || a.method === "DELETE"
      ? ""
      : a.body
        ? `body: ${JSON.stringify(a.body)}.replace(/{{value}}/g, JSON.stringify(${a.trigger === "button" ? "null" : "value"})).replace(/{{rowId}}/g, JSON.stringify(row.id)).replace(/{{row\\.(\\w+)}}/g, (_, k) => JSON.stringify((row as Record<string, unknown>)[k])),`
        : `body: JSON.stringify(${a.trigger === "button" ? "{ id: row.id }" : `{ ${JSON.stringify(a.columnKey)}: value }`}),`;
    actionHandlers.push(`
  /**
   * ${a.method} \`\${endpoint}${a.path}\` — ${a.trigger} action for column "${a.columnKey}".
   * Fired from the cell renderer whenever the user changes the value (or
   * clicks, for trigger="button"). This is a per-row mutation and is
   * INDEPENDENT from the table list endpoint.
   */
  const ${fnName} = useCallback(async (${sigParams}): Promise<void> => {${queryInterp}${optimistic}
    try {
      const res = await fetch(\`\${endpoint}${pathInterp}${a.query ? "?${aParams}" : ""}\`, {
        method: ${JSON.stringify(a.method)},
        headers: { "Content-Type": "application/json", ...baseHeaders },
        ${bodyExpr}
      });
      if (!res.ok) throw new Error(\`${fnName} failed: \${res.status}\`);
    } catch (e) {${a.optimistic !== false && a.trigger !== "button" ? "\n      rollback();" : ""}
      throw e;
    }
  }, [endpoint]);
`);
    actionTypeFields.push(`  ${fnName}: (${sigParams}) => Promise<void>;`);
  }

  const mutators: string[] = [];
  if (hasInlineEdit) {
    mutators.push(`
  /** PATCH \`\${endpoint}/:rowId\` — update a single cell value. */
  const updateCell = useCallback(async (rowId: string, key: keyof TRow, value: unknown): Promise<void> => {
    const res = await fetch(\`\${endpoint}/\${rowId}\`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...baseHeaders },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) throw new Error(\`updateCell failed: \${res.status}\`);
    setData(prev => prev.map(r => (r.id === rowId ? ({ ...r, [key]: value } as TRow) : r)));
  }, [endpoint]);
`);
  }
  if (hasSelection || hasBulk) {
    mutators.push(`
  /** POST \`\${endpoint}/bulk-delete\` — delete N rows in a single request. */
  const deleteRows = useCallback(async (ids: ReadonlyArray<string>): Promise<void> => {
    const res = await fetch(\`\${endpoint}/bulk-delete\`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...baseHeaders },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error(\`deleteRows failed: \${res.status}\`);
    setData(prev => prev.filter(r => !ids.includes(r.id)));
    setTotal(t => Math.max(0, t - ids.length));
  }, [endpoint]);
`);
  }
  if (hasDnD) {
    mutators.push(`
  /** POST \`\${endpoint}/reorder\` — persist a new row order. */
  const reorderRows = useCallback(async (orderedIds: ReadonlyArray<string>): Promise<void> => {
    const res = await fetch(\`\${endpoint}/reorder\`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...baseHeaders },
      body: JSON.stringify({ order: orderedIds }),
    });
    if (!res.ok) throw new Error(\`reorderRows failed: \${res.status}\`);
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

  const code = `import { useCallback, useEffect, useState } from "react";
import type { Row } from "./tableConfig";

/**
 * Server-driven data hook for this DataTable.
 *
 * List endpoint (table-wide search / sort / filter / pagination):
 *   ${listMethod} \`${apiConfig?.baseUrl ?? config.apiEndpoint}${listPath}\`
 *
 * Row-action endpoints (per-row mutations from interactive cells like
 * dropdown / switch / radio / checkbox / rating / button — INDEPENDENT
 * of the list endpoint and target a single row at a time):${rowActionDocs}
 *
 * Only the inputs, mutators and handlers your enabled features need are
 * emitted — no dead state, no unused destructures.
 */
export interface TableQuery {
${queryFields.map(f => "  " + f).join("\n")}
}

export interface UseTableData<TRow extends { id: string }> {
  data: TRow[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
${interfaceExtras}
}

${headersLine}

export function useTableData<TRow extends { id: string } = Row>(
  endpoint: string,
  query: TableQuery,
): UseTableData<TRow> {
  const [data, setData] = useState<TRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    const ctrl = new AbortController();
    try {
      ${paramLines.join("\n      ")}${bodyBlock}
      const res = await fetch(${fetchUrl}, ${fetchInit});
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      const json = (await res.json()) as { data: TRow[]; total: number } | TRow[];
      const list = Array.isArray(json) ? json : json.data;
      setData(list);
      setTotal(Array.isArray(json) ? list.length : (json.total ?? list.length));
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  }, [${refetchDeps}]);

  useEffect(() => { void refetch(); }, [refetch]);
${mutators.join("")}${actionHandlers.join("\n")}

  return { ${returnFields} };
}
`;

  return {
    name: "useTableData.ts",
    path: "src/components/tables/useTableData.ts",
    description: "Server-side data hook. Inputs, mutators, and row-action handlers are emitted per-feature.",
    isFixed: false,
    language: "ts",
    code,
  };
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

// ─────────────────────────── Page generation ────────────────────────────

function generateDataTablePage(config: TableBuilderConfig, dataMode: DataMode): GeneratedFile {
  const apiSearch = resolveSource(config, "search") === "api" && config.enableSearch;
  const apiFilter = resolveSource(config, "filter") === "api" && config.enableColumnFilters;
  const apiSort = resolveSource(config, "sort") === "api";
  const apiPage = resolveSource(config, "pagination") === "api" && config.enablePagination;
  const hasMultiSort = config.enableMultiSort;
  const hasInteractions = pickInteractiveColumns(config).length > 0;

  const isApi = dataMode === "api" && (apiSearch || apiFilter || apiSort || apiPage);

  // ── Static mode: minimal wrapper ────────────────────────────────────
  if (!isApi) {
    const code = `import { TablePreview } from "./TablePreview";
import { tableConfig, type Row } from "./tableConfig";
${hasInteractions ? `import { useRowInteractions } from "./useRowInteractions";\n` : ""}
interface DataTableProps {
  data: Row[];
}

export default function DataTable({ data }: DataTableProps) {
${hasInteractions ? `  // Typed per-column change handlers — see useRowInteractions.ts.\n  // Pass \`onCellInteract\` to TablePreview to route user edits through your logic.\n  const { onCellInteract } = useRowInteractions<Row>();\n\n` : ""}  return <TablePreview config={tableConfig} data={data}${hasInteractions ? " onCellInteract={onCellInteract}" : ""} />;
}
`;
    return {
      name: "DataTable.tsx",
      path: "src/components/tables/DataTable.tsx",
      description: "Page wrapper. Pure client-side — pass static rows and TablePreview handles the rest.",
      isFixed: false,
      language: "tsx",
      code,
    };
  }

  // ── API mode: only emit state + query for features that hit the server.
  // Client-side features stay client-side inside TablePreview, so we don't
  // spam handlers/destructures the wrapper would never use.
  const stateLines: string[] = [];
  const queryFields: string[] = [];
  const queryDeps: string[] = [];

  if (apiSearch) {
    stateLines.push(`  const [search] = useState("");`);
    queryFields.push("search");
    queryDeps.push("search");
  }
  if (apiFilter) {
    stateLines.push(`  const [filters] = useState<Record<string, string>>({});`);
    queryFields.push("filters");
    queryDeps.push("filters");
  }
  if (apiSort) {
    if (hasMultiSort) {
      stateLines.push(`  const [sorts] = useState<Array<{ key: string; dir: "asc" | "desc" }>>([]);`);
      queryFields.push("sorts");
      queryDeps.push("sorts");
    } else {
      stateLines.push(`  const [sort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);`);
      queryFields.push("sort");
      queryDeps.push("sort");
    }
  }
  if (apiPage) {
    stateLines.push(`  const [page] = useState(0);`);
    stateLines.push(`  const [pageSize] = useState(tableConfig.pageSize ?? 10);`);
    queryFields.push("page", "pageSize");
    queryDeps.push("page", "pageSize");
  }

  const queryBody = queryFields.map(f => `      ${f},`).join("\n");

  const code = `import { useMemo, useState } from "react";
import { TablePreview } from "./TablePreview";
import { useTableData, type TableQuery } from "./useTableData";
import { tableConfig, type Row } from "./tableConfig";
${hasInteractions ? `import { useRowInteractions } from "./useRowInteractions";\n` : ""}
/**
 * Server-driven DataTable wrapper.
 *
 * \`useTableData\` also exposes \`refetch\`, \`error\` and feature-aware mutators
 * (\`updateCell\`, \`deleteRows\`, \`reorderRows\`) plus any typed row-action
 * handlers — destructure them when you want to wire custom UI on top of
 * TablePreview:
 *
 *   const { data, loading, refetch, updateCell } = useTableData<Row>(...)
 */
export default function DataTable() {
${stateLines.join("\n")}

  const query = useMemo<TableQuery>(() => ({
${queryBody}
  }), [${queryDeps.join(", ")}]);

  const { data, loading } = useTableData<Row>(tableConfig.apiEndpoint!, query);
${hasInteractions ? `  // Typed per-column change handlers — see useRowInteractions.ts.\n  const { onCellInteract } = useRowInteractions<Row>();\n` : ""}
  return (
    <TablePreview
      config={tableConfig}
      data={data}
      isLoading={loading}${hasInteractions ? "\n      onCellInteract={onCellInteract}" : ""}
    />
  );
}
`;

  return {
    name: "DataTable.tsx",
    path: "src/components/tables/DataTable.tsx",
    description: "Page wrapper. Server-driven — only emits state for features bound to the API.",
    isFixed: false,
    language: "tsx",
    code,
  };
}

// ──────────────── Row-interaction hook generation ─────────────────────
//
// For every interactive column (dropdown/switch/radio/checkbox/rating)
// we emit a stub handler with the signature
//   (row, oldValue, newValue) => void | Promise<void>
// The handler is a starting point — it logs by default and the user
// replaces the body with their own logic (API call, analytics, etc.).
// This is INDEPENDENT of API mode: even fully client-side tables with a
// dropdown/switch/etc. need a place to react to value changes.

// `boolean` is a read-only display (✓ / ✗) — NOT user-interactive.
// Only emit handlers for columns the user can actually change.
const INTERACTIVE_TYPES = new Set<string>(["dropdown", "switch", "radio", "rating"]);

function pickInteractiveColumns(config: TableBuilderConfig): TableColumnConfig[] {
  return config.columns.filter(c => c.visible && INTERACTIVE_TYPES.has(c.type));
}

function handlerName(col: TableColumnConfig): string {
  const safe = col.key
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return `on${safe || "Cell"}Change`;
}

function valueTsType(col: TableColumnConfig): string {
  switch (col.type) {
    case "switch":  return "boolean";
    case "rating":  return "number";
    default:        return "string";
  }
}

function generateRowInteractionsHook(config: TableBuilderConfig): GeneratedFile | null {
  const cols = pickInteractiveColumns(config);
  if (cols.length === 0) return null;

  const handlerDocs = cols.map(c => ` *   ${handlerName(c)}(row, oldValue, newValue)  ← "${c.label}" (${c.type})`).join("\n");

  const handlers = cols.map(c => {
    const fn = handlerName(c);
    const tv = valueTsType(c);
    return `  /**
   * Fires when the user changes the "${c.label}" cell (type: ${c.type}).
   * Replace the body with your own logic — call an API, dispatch an action,
   * trigger analytics, persist to a store, etc. The full row is passed in
   * so you have id + every other column value without an extra lookup.
   */
  const ${fn} = useCallback(async (
    row: TRow,
    oldValue: ${tv},
    newValue: ${tv},
  ): Promise<void> => {
    if (oldValue === newValue) return;
    // eslint-disable-next-line no-console
    console.log("[${fn}]", { rowId: row.id, oldValue, newValue, row });
    // TODO: e.g. await fetch(\`/api/rows/\${row.id}\`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ ${JSON.stringify(c.key)}: newValue }),
    // });
  }, []);`;
  }).join("\n\n");

  const dispatchCases = cols.map(c => {
    const tv = valueTsType(c);
    return `      case ${JSON.stringify(c.key)}:
        return ${handlerName(c)}(row as TRow, oldValue as ${tv}, newValue as ${tv});`;
  }).join("\n");

  const returnFields = ["onCellInteract", ...cols.map(handlerName)].join(",\n    ");

  const code = `import { useCallback } from "react";
import type { Row } from "./tableConfig";

/**
 * Per-column user-interaction handlers for this DataTable.
 *
 * One handler per interactive column (dropdown / switch / radio / checkbox /
 * rating). Each receives the full row plus the old and new values so you
 * can react with full context — no extra lookups, no stale closures:
 *
${handlerDocs}
 *
 * The hook also exposes a single \`onCellInteract(row, key, oldValue, newValue)\`
 * dispatcher you can pass straight to <TablePreview onCellInteract={...} />
 * — it routes each cell change to the matching typed handler above.
 */
export interface UseRowInteractions<TRow extends { id: string }> {
${cols.map(c => `  ${handlerName(c)}: (row: TRow, oldValue: ${valueTsType(c)}, newValue: ${valueTsType(c)}) => Promise<void>;`).join("\n")}
  // Wide signature so the dispatcher passes straight to <TablePreview onCellInteract={...}>
  // (the engine invokes it with generic rows). Per-column handlers above stay typed.
  onCellInteract: (row: Record<string, unknown>, key: string, oldValue: unknown, newValue: unknown) => Promise<void> | void;
}

export function useRowInteractions<TRow extends { id: string } = Row>(): UseRowInteractions<TRow> {
${handlers}

  const onCellInteract = useCallback((
    row: Record<string, unknown>,
    key: string,
    oldValue: unknown,
    newValue: unknown,
  ): Promise<void> | void => {
    switch (key) {
${dispatchCases}
      default:
        return;
    }
  }, [${cols.map(handlerName).join(", ")}]);

  return {
    ${returnFields},
  };
}
`;

  return {
    name: "useRowInteractions.ts",
    path: "src/components/tables/useRowInteractions.ts",
    description: "Per-column user-interaction handlers (dropdown/switch/radio/checkbox/rating) — receives (row, oldValue, newValue).",
    isFixed: false,
    language: "ts",
    code,
  };
}

// ───────────────────────────── Public API ─────────────────────────────

function emitRenderersFile(sources: TableRendererSources): string {
  const importsBlock = sources.imports
    ? sources.imports + "\n"
    : `import type { CellRenderer } from "@/components/tables/types";\nimport type { Row } from "./tableConfig";\n`;

  const parts: string[] = [importsBlock];

  if (sources.reusable) {
    parts.push(`/**
 * Case 1 — single reusable cell renderer.
 * Every cell renders through this body unless its column defines its
 * own \`renderCell\`.
 */
export const renderCell: CellRenderer<Row> = ${sources.reusable};
`);
  }

  if (sources.perColumn && Object.keys(sources.perColumn).length > 0) {
    const entries = Object.entries(sources.perColumn)
      .map(([id, body]) => `  ${JSON.stringify(id)}: ${body},`)
      .join("\n");
    parts.push(`/**
 * Case 2 — per-column cell renderers keyed by column id.
 * \`tableConfig.ts\` attaches these onto each column's \`renderCell\` field
 * during load — fully type-safe, no runtime cast needed.
 */
export const cellRenderers: Record<string, CellRenderer<Row>> = {
${entries}
};
`);
  }

  if (sources.dialog) {
    parts.push(`/**
 * Typed JSX renderer for the row-detail dialog. Wired onto
 * \`tableConfig.rowClickAction.renderDialog\`.
 *
 * Resolution order at render time:
 *   rowClickAction.renderDialog → rowClickAction.dialogTemplate → default field-grid
 */
import type { RowDialogRenderer } from "@/components/tables/types";
export const renderRowDialog: RowDialogRenderer<Row> = ${sources.dialog};
`);
  }

  if (sources.expandedRow) {
    parts.push(`/**
 * Typed JSX renderer for the expandable row body. Wired onto
 * \`tableConfig.renderExpandedRow\`.
 *
 * Resolution order at render time:
 *   config.renderExpandedRow → expandableLayout switch → "details" layout
 */
import type { ExpandedRowRenderer } from "@/components/tables/types";
export const renderExpandedRow: ExpandedRowRenderer<Row> = ${sources.expandedRow};
`);
  }

  if (sources.pagination) {
    parts.push(`/**
 * Typed JSX renderer for the pagination bar. Wired onto
 * \`tableConfig.renderPagination\`.
 *
 * Resolution order at render time:
 *   config.renderPagination → <DefaultPaginationBar /> (paginationLayout switch)
 */
import type { PaginationRenderer } from "@/components/tables/types";
export const renderPagination: PaginationRenderer = ${sources.pagination};
`);
  }

  return parts.join("\n");
}

function emitTableConfigFile(
  cleaned: Partial<TableBuilderConfig>,
  rowType: string,
  rendererSources?: TableRendererSources,
): string {
  const hasReusable = !!rendererSources?.reusable;
  const hasPerColumn = !!rendererSources?.perColumn && Object.keys(rendererSources.perColumn).length > 0;
  const hasDialog = !!rendererSources?.dialog;
  const hasExpanded = !!rendererSources?.expandedRow;
  const hasPagination = !!rendererSources?.pagination;
  const anyRenderer = hasReusable || hasPerColumn || hasDialog || hasExpanded || hasPagination;

  if (!anyRenderer) {
    return `import type { TableBuilderConfig, TableRow } from "./types";

${rowType}

export const tableConfig: TableBuilderConfig = ${json(cleaned)} as const satisfies TableBuilderConfig;
`;
  }

  const importNames = [
    hasReusable && "renderCell",
    hasPerColumn && "cellRenderers",
    hasDialog && "renderRowDialog",
    hasExpanded && "renderExpandedRow",
    hasPagination && "renderPagination",
  ].filter(Boolean).join(", ");
  const importLine = `import { ${importNames} } from "./renderers";`;

  const injections: string[] = [];
  if (hasReusable) injections.push("  renderCell,");
  if (hasExpanded) injections.push("  renderExpandedRow,");
  if (hasPagination) injections.push("  renderPagination,");
  const literalBase = json(cleaned);
  const literal = injections.length
    ? literalBase.replace(/\n}$/, ",\n" + injections.join("\n") + "\n}")
    : literalBase;

  const dialogAttach = hasDialog ? `

/**
 * Attach the typed JSX dialog renderer onto rowClickAction.
 *
 * Resolution order at render time (built into the engine):
 *   rowClickAction.renderDialog → rowClickAction.dialogTemplate → default field-grid
 */
tableConfig.rowClickAction = {
  ...(tableConfig.rowClickAction ?? { type: "dialog" }),
  renderDialog: renderRowDialog,
};` : "";

  const attachBlock = hasPerColumn
    ? `

/**
 * Attach per-column cell renderers from ./renderers.tsx via a single helper
 * call. Resolution order applied by the engine:
 *   column.renderCell  ->  config.renderCell  ->  built-in default
 */
tableConfig.columns = attachCellRenderers(tableConfig.columns, cellRenderers);`
    : "";

  const helperImport = hasPerColumn
    ? `\nimport { attachCellRenderers } from "@/components/tables/attachRenderers";`
    : "";
  return `import type { TableBuilderConfig, TableRow } from "./types";
${importLine}${helperImport}

${rowType}

/**
 * Strongly-typed table config.${hasReusable ? " The single reusable `renderCell` lives in ./renderers.tsx." : ""}
 */
export const tableConfig: TableBuilderConfig = ${literal};${attachBlock}${dialogAttach}
`;
}

export function generateAllFiles(
  config: TableBuilderConfig,
  dataMode: DataMode,
  rendererSources?: TableRendererSources,
): GeneratedFile[] {
  const cleaned = cleanedConfig(config);
  const rowType = pickRowType(config.columns);

  const files: GeneratedFile[] = [];

  files.push({
    name: "tableConfig.ts",
    path: "src/components/tables/tableConfig.ts",
    description: rendererSources
      ? "Strongly-typed config — wires in renderers from ./renderers.tsx."
      : "Strongly-typed config object + Row interface for this table.",
    isFixed: false,
    language: "ts",
    code: emitTableConfigFile(cleaned, rowType, rendererSources),
  });

  if (
    rendererSources &&
    (rendererSources.reusable
      || (rendererSources.perColumn && Object.keys(rendererSources.perColumn).length > 0)
      || rendererSources.dialog
      || rendererSources.expandedRow
      || rendererSources.pagination)
  ) {
    files.push({
      name: "renderers.tsx",
      path: "src/components/tables/renderers.tsx",
      description: "Typed JSX renderers (cell / dialog / expanded row) wired into tableConfig.ts.",
      isFixed: false,
      language: "tsx",
      code: emitRenderersFile(rendererSources),
    });
  }

  files.push(generateDataTablePage(config, dataMode));

  const anyApi = (
    (resolveSource(config, "search") === "api" && config.enableSearch) ||
    (resolveSource(config, "filter") === "api" && config.enableColumnFilters) ||
    (resolveSource(config, "sort") === "api") ||
    (resolveSource(config, "pagination") === "api" && config.enablePagination)
  );
  if (dataMode === "api" && anyApi) {
    files.push(generateHook(config));
  }

  const interactionsHook = generateRowInteractionsHook(config);
  if (interactionsHook) files.push(interactionsHook);

  return files;
}


export interface DependencyReport {
  npmInstall: string;
  npmInstallDev: string;
  notes: string[];
}

export function getDependencyReport(config: TableBuilderConfig): DependencyReport {
  const deps = new Set<string>([
    "react",
    "lucide-react",
    "clsx",
    "tailwind-merge",
    // The shared TablePreview engine imports `useVirtualizer` unconditionally, so
    // the virtualization peer is always required — not gated on enableVirtualization.
    "@tanstack/react-virtual",
  ]);
  const dev = new Set<string>(["typescript", "@types/react"]);
  const notes: string[] = [];

  if (config.enableDnD) {
    notes.push("Row drag-and-drop uses the bundled custom Pointer DnD library (components/dnd) — zero external deps.");
  }
  if (config.enableVirtualization) {
    notes.push("Virtualization uses @tanstack/react-virtual (already a required engine peer).");
  }
  // afnoui/radix primitives the engine touches
  [
    "@radix-ui/react-checkbox", "@radix-ui/react-switch",
    "@radix-ui/react-dropdown-menu", "@radix-ui/react-progress",
    "@radix-ui/react-radio-group", "@radix-ui/react-select",
    "@radix-ui/react-tabs", "@radix-ui/react-tooltip",
    "@radix-ui/react-avatar", "@radix-ui/react-scroll-area",
    "class-variance-authority",
  ].forEach(d => deps.add(d));

  return {
    npmInstall: `npm install ${Array.from(deps).sort().join(" ")}`,
    npmInstallDev: `npm install -D ${Array.from(dev).sort().join(" ")}`,
    notes,
  };
}
