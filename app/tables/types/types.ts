/**
 * Table engine types — shared between Table Builder and exported variants.
 * Keep this file dependency-free so it can be copied into any project.
 */

export type TableColumnType =
  | "text"
  | "number"
  | "badge"
  | "avatar"
  | "avatar-image"
  | "date"
  | "progress"
  | "actions"
  | "email"
  | "link"
  | "currency"
  | "boolean"
  | "dropdown"
  | "switch"
  | "radio"
  | "rating"
  | "status-dot"
  | "tags";

export type AggregationType = "sum" | "avg" | "min" | "max" | "count" | "none";

export type ExpandableLayout =
  | "details"
  | "grid"
  | "tabs"
  | "timeline"
  | "gallery"
  | "card"
  | "stats";
export type ExpandableIconStyle =
  | "chevron"
  | "plus"
  | "caret"
  | "arrow"
  | "eye";
export type ExpandableIconPosition =
  | "before-checkbox"
  | "after-checkbox"
  | "first"
  | "last";
export type PaginationLayout =
  | "compact"
  | "full"
  | "minimal"
  | "numbered"
  | "infoOnly";

/** Generic row shape — extend in your project for per-feature type safety. */
export type TableRow = Record<string, unknown> & { id: string };

export interface TableColumnOption {
  label: string;
  value: string;
  color?: string;
}

export interface TableColumnConfig {
  id: string;
  key: string;
  label: string;
  type: TableColumnType;
  sortable: boolean;
  filterable: boolean;
  visible: boolean;
  resizable?: boolean;
  groupable?: boolean;
  width?: number;
  align?: "left" | "center" | "right";
  badgeVariants?: Record<string, string>;
  format?: string;
  options?: TableColumnOption[];
  aggregation?: AggregationType;
  footerLabel?: string;
  /** Pin to start (left in LTR) or end (right in LTR). */
  pinned?: "start" | "end" | null;
  /** Optional group label for grouped headers (rendered as super-header above this column). */
  group?: string;
  /** Render this column's text value with an underline (e.g. to hint at a link / drill-in). */
  underline?: boolean;
  /**
   * Optional click action attached to a cell value. When set, the cell value
   * becomes interactive (button / link). Independent of row click.
   *   - `"none"`        — no action (default).
   *   - `"dialog"`      — open a row-detail dialog.
   *   - `"route-same"`  — navigate to `urlTemplate` in the same tab.
   *   - `"route-new"`   — open `urlTemplate` in a new tab.
   *   - `"js"`          — run the snippet in `code` inside a sandbox; the
   *                       snippet receives `row`, `value`, and `helpers`
   *                       (toast / copy / open). Stops row-click bubbling.
   * `urlTemplate` supports `{id}` and `{<field>}` tokens (e.g. `/users/{id}`).
   */
  clickAction?: {
    type: "none" | "dialog" | "route-same" | "route-new" | "js";
    urlTemplate?: string;
    /** JS snippet body executed when `type === "js"`. */
    code?: string;
  };
}

/**
 * Row-level click handler. Mirrors `TableColumnConfig.clickAction` but applies
 * to the entire row (clicking anywhere on the row).
 */
export interface TableRowClickConfig {
  type: "none" | "dialog" | "route-same" | "route-new" | "js";
  urlTemplate?: string;
  /** JS snippet body executed when `type === "js"`. */
  code?: string;
  /**
   * Generic row-detail dialog (used when `type === "dialog"`).
   *
   * `dialogTemplate` — an HTML/Tailwind snippet with mustache substitution.
   *   Supported tokens:
   *     {{row.field}}        → row[field]
   *     {{value}}            → cell value (when fired from a cell)
   *     {{#if row.field}}…{{/if}} → conditional block
   *     {{#each row.tags}}…{{/each}} (for arrays) → repeats inner block, with `{{this}}` referring to the item
   *
   *   The output is sanitized (no <script>, no inline event handlers) and
   *   inserted via `dangerouslySetInnerHTML`. If empty, a sensible default
   *   field grid is rendered.
   *
   * `dialogJs` — optional sandboxed JS run after the template is inserted.
   *   Receives `row`, `value`, `helpers`, and `el` (the dialog content root).
   *   Lets the user wire up form submits, fetches, charts, etc. Same sandbox
   *   as `cellJsRunner` (no fetch/window/localStorage by default).
   *
   * `dialogTitle` / `dialogDescription` — optional plain-text strings, also
   *   support mustache substitution.
   *
   * `dialogWidthClass` — Tailwind class controlling DialogContent width
   *   (e.g. "max-w-md", "max-w-3xl", "max-w-5xl"). Defaults to "max-w-2xl".
   */
  dialogJs?: string;
  dialogTitle?: string;
  dialogTemplate?: string;
  dialogWidthClass?: string;
  dialogDescription?: string;
}

export interface TableColumnGroup {
  id: string;
  label: string;
  /** Column ids belonging to this group (must match TableColumnConfig.id). */
  columns: string[];
  align?: "left" | "center" | "right";
}

export interface TableBuilderConfig {
  title: string;
  description: string;
  // Core
  enableSearch: boolean;
  enablePagination: boolean;
  enableRowSelection: boolean;
  enableDnD: boolean;
  enableColumnVisibility: boolean;
  enableExport: boolean;
  enableStriped: boolean;
  enableHover: boolean;
  enableBordered: boolean;
  enableStickyHeader: boolean;
  enableExpandableRows: boolean;
  enableInlineEdit: boolean;
  enableBulkActions: boolean;
  enableColumnResize: boolean;
  // Advanced
  enableMultiSort: boolean;
  enableColumnFilters: boolean;
  enableRowGrouping: boolean;
  enableAggregation: boolean;
  enableFooter: boolean;
  /** Render super-header row from columnGroups. */
  enableNestedHeaders?: boolean;
  /** Pin columns marked with `pinned` to the start/end of the table. */
  enablePinnedColumns?: boolean;
  /** Use @tanstack/react-virtual to render only visible rows. */
  enableVirtualization?: boolean;
  /** Approximate row height (px) used by the virtualizer. */
  virtualRowHeight?: number;
  /** Viewport height (px) when virtualization is on. */
  virtualMaxHeight?: number;

  // Layout
  pageSize: number;
  /** Default sort source. Per-feature override via `sources.sort`. */
  sortMode: "client" | "api";
  /** Default pagination source. Per-feature override via `sources.pagination`. */
  paginationMode: "client" | "api";
  /**
   * REST endpoint backing API-mode features. Optional so client-only variants
   * (no API integration) don't have to declare `apiEndpoint: ""` boilerplate;
   * the codegen and `useTableData` hook only read it when at least one
   * `sources.*` is `"api"` (or for back-compat when `sortMode`/`paginationMode`
   * is `"api"`).
   */
  apiEndpoint?: string;
  /**
   * Detailed REST configuration. Used by the generated `useTableData` hook
   * when any feature.source === "api". When omitted we default to GET on
   * `apiEndpoint` with sensible query params.
   */
  apiConfig?: TableApiConfig;
  /**
   * Per-feature data source selector. Any feature set to `"api"` causes the
   * generated `useTableData` hook to call the endpoint when that input changes
   * (and to send the corresponding query param). Defaults derive from
   * sortMode / paginationMode for backwards compatibility.
   */
  sources?: {
    search?: "client" | "api";
    filter?: "client" | "api";
    sort?: "client" | "api";
    pagination?: "client" | "api";
  };
  direction: "ltr" | "rtl";
  density: "comfortable" | "compact" | "spacious";
  groupBy?: string;

  columns: TableColumnConfig[];
  columnGroups?: TableColumnGroup[];

  // Expandable
  expandableLayout?: ExpandableLayout;
  expandableIconStyle?: ExpandableIconStyle;
  expandableIconPosition?: ExpandableIconPosition;
  // Pagination
  paginationLayout?: PaginationLayout;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  showPageInfo?: boolean;
  showFirstLastButtons?: boolean;
  // Sticky viewport (only effective without pagination)
  stickyMaxHeight?: number;

  /**
   * Row-level click action — when set (and not "none"), every row becomes
   * clickable and either opens a row-detail dialog or navigates to a URL.
   * Per-column `clickAction` (on a specific cell) overrides this for that cell.
   */
  rowClickAction?: TableRowClickConfig;
}

/** HTTP method for either the list endpoint or per-row mutations. */
export type TableHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface TableApiConfig {
  /** Base URL. e.g. "https://api.example.com/users" */
  baseUrl: string;
  /** HTTP method used to fetch the list. GET is recommended. */
  listMethod: TableHttpMethod;
  /**
   * Optional path template appended to baseUrl. Tokens:
   *   :id        — replaced with row.id (only for row mutations).
   *   :{field}   — replaced with the matching row field.
   * Example list path: "" or "/search". Example mutation path: "/:id".
   */
  listPath?: string;
  /** Extra query string parameters always sent with the list request. */
  listQuery?: Record<string, string>;
  /**
   * Body sent on non-GET list requests. Variables {{search}}, {{page}},
   * {{pageSize}}, {{filters}}, {{sort}} are interpolated by the hook.
   */
  listBody?: string;
  /** Optional headers (Bearer, x-api-key, etc.). */
  headers?: Record<string, string>;
  /**
   * Per-feature row-mutation endpoints. Each entry produces a typed handler
   * inside the generated useTableData hook. The cell renderer in TablePreview
   * calls the matching handler whenever the user toggles the control, the
   * UI is optimistically updated, and the request is sent in the background.
   */
  rowActions?: TableRowActionConfig[];
}

export interface TableRowActionConfig {
  /** Unique id for this action (also used as the handler name suffix). */
  id: string;
  /** Column key whose interaction triggers this action. */
  columnKey: string;
  /** Trigger type — controls which events the cell wires up. */
  trigger: "switch" | "checkbox" | "radio" | "dropdown" | "button" | "rating";
  /** HTTP method. */
  method: TableHttpMethod;
  /**
   * Path template appended to apiConfig.baseUrl. Tokens:
   *   :id    — row.id
   *   :{k}   — row[k]
   * Example: "/:id/toggle"
   */
  path: string;
  /**
   * Body template (string). Use {{value}} for the new value, {{rowId}} for
   * row.id, and {{row.field}} for any row property.
   * Example: '{ "active": {{value}} }'
   */
  body?: string;
  /** Extra query parameters. */
  query?: Record<string, string>;
  /** Optimistic UI: apply the change immediately and rollback on error. */
  optimistic?: boolean;
}

/** Sort descriptor used by both client- and server-side modes. */
export interface SortDescriptor {
  key: string;
  dir: "asc" | "desc";
}
