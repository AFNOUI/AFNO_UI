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
import { generateDataFiles } from "./codegen/dataFiles";
import { resolveSource, type DataMode, type GeneratedFile } from "./codegen/types";
import { DEFAULT_TRANSPORT, transportNpmDependencies, type TransportChoice } from "@/lib/codegen/transport";

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


// Re-exported so existing importers of this module keep working; the
// definitions live in ./codegen/types.ts to avoid a cycle with ./codegen/dataFiles.
export type { GeneratedFile, DataMode } from "./codegen/types";

const json = (v: unknown) => JSON.stringify(v, null, 2);



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

/**
 * Emits the API data layer as TWO files, per AI_AGENT_RULES § R-55:
 *
 *   services.ts     — every `fetch`. The only file that talks to the network.
 *   useTableData.ts — React state, optimistic updates and rollback. The only
 *                     caller of services.ts.
 *
 * `DataTable.tsx` imports the hook and never imports services directly.
 */

// ─────────────────────────── Page generation ────────────────────────────

function generateDataTablePage(
  config: TableBuilderConfig,
  dataMode: DataMode,
  transport: TransportChoice = DEFAULT_TRANSPORT,
): GeneratedFile {
  // When axios is chosen the ENGINE must use it too. `TablePreview` fires
  // `apiConfig.rowActions` through its own transport context, which defaults to
  // fetch — so we mount the provider with the adapter exported by services.ts.
  // Without this a `--axios` install would be half axios, half fetch (R-56).
  const wrapTransport = transport.http === "axios";
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

  const transportImports = wrapTransport
    ? `import { TableTransportProvider } from "@/components/tables/transport/context";\nimport { tableTransport } from "./services";\n`
    : "";

  const code = `import { useMemo, useState } from "react";
import { TablePreview } from "./TablePreview";
import { useTableData, type TableQuery } from "./useTableData";
import { tableConfig, type Row } from "./tableConfig";
${hasInteractions ? `import { useRowInteractions } from "./useRowInteractions";\n` : ""}${transportImports}
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
${wrapTransport ? `    <TableTransportProvider transport={tableTransport}>
      <TablePreview
        config={tableConfig}
        data={data}
        isLoading={loading}${hasInteractions ? "\n        onCellInteract={onCellInteract}" : ""}
      />
    </TableTransportProvider>` : `    <TablePreview
      config={tableConfig}
      data={data}
      isLoading={loading}${hasInteractions ? "\n      onCellInteract={onCellInteract}" : ""}
    />`}
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

export interface GenerateAllFilesOptions {
  /** Source strings for a real `renderers.tsx` (reusable / per-column / dialog / …). */
  rendererSources?: TableRendererSources;
  /** Which HTTP client / query strategy to generate against (R-56). */
  transport?: TransportChoice;
}

/**
 * Whether this table emits a network layer at all (`services.ts` +
 * `useTableData.ts`).
 *
 * Extracted from `generateAllFiles` — same condition, same result — so the
 * Export tab can tell the user *why* the transport choice does nothing for a
 * purely client-side table, instead of showing a live control that silently
 * no-ops. A table only talks to a server when the data mode is `api` AND at
 * least one enabled feature is sourced from the API.
 */
export function generatesDataLayer(config: TableBuilderConfig, dataMode: DataMode): boolean {
  if (dataMode !== "api") return false;
  return (
    (resolveSource(config, "search") === "api" && config.enableSearch) ||
    (resolveSource(config, "filter") === "api" && config.enableColumnFilters) ||
    (resolveSource(config, "sort") === "api") ||
    (resolveSource(config, "pagination") === "api" && config.enablePagination)
  );
}

export function generateAllFiles(
  config: TableBuilderConfig,
  dataMode: DataMode,
  options: GenerateAllFilesOptions = {},
): GeneratedFile[] {
  const { rendererSources, transport = DEFAULT_TRANSPORT } = options;
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

  files.push(generateDataTablePage(config, dataMode, transport));

  if (generatesDataLayer(config, dataMode)) {
    files.push(...generateDataFiles(config, transport));
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

/**
 * @param transport Defaults to the zero-dependency choice, so callers that do
 * not offer the opt-ins keep reporting exactly what they reported before.
 */
export function getDependencyReport(
  config: TableBuilderConfig,
  transport: TransportChoice = DEFAULT_TRANSPORT,
): DependencyReport {
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

  // CLI-gated opt-ins (R-56) — present only when the caller actually chose them.
  for (const dep of transportNpmDependencies(transport)) deps.add(dep);

  return {
    npmInstall: `npm install ${Array.from(deps).sort().join(" ")}`,
    npmInstallDev: `npm install -D ${Array.from(dev).sort().join(" ")}`,
    notes,
  };
}
