/**
 * JSX renderer demos for **row dialog** and **expandable row** — the
 * TanStack-style typed render hooks introduced alongside `column.renderCell`.
 *
 * Resolution order (built into the engine):
 *   • Row dialog    → rowClickAction.renderDialog → rowClickAction.dialogTemplate → default field-grid
 *   • Expanded row  → config.renderExpandedRow    → expandableLayout switch       → "details" layout
 *
 * Each template ships:
 *   - a working JSX `renderDialog` / `renderExpandedRow` so the live preview
 *     in /table-builder mounts the real component tree, no mustache strings.
 *   - matching `rendererSources` so the code generator emits the *same* JSX
 *     verbatim into `src/components/tables/renderers.tsx` — zero drift between
 *     builder preview and exported source.
 */
import { Mail, Calendar, Award, Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import type {
  RowDialogRenderer,
  TableColumnConfig,
  PaginationRenderer,
  TableBuilderConfig,
  ExpandedRowRenderer,
} from "@/tables/types";
import type { TableRendererSources } from "./utils/tableCodeGenerator";

// ─────────────────────────────────────────────────────────────────────
// Shared row shape mirroring what the generator's `pickRowType()` emits.
// ─────────────────────────────────────────────────────────────────────
interface DemoRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  progress: number;
  joined: string;
}

const sharedColumns = (): TableColumnConfig[] => [
  { id: "c1", key: "name",     label: "Name",     type: "avatar",   sortable: true,  filterable: true,  visible: true, align: "left", underline: true },
  { id: "c2", key: "email",    label: "Email",    type: "email",    sortable: true,  filterable: true,  visible: true, align: "left" },
  { id: "c3", key: "role",     label: "Role",     type: "badge",    sortable: true,  filterable: true,  visible: true, align: "left",
    badgeVariants: { Admin: "default", Editor: "secondary", Viewer: "outline" } },
  { id: "c4", key: "status",   label: "Status",   type: "badge",    sortable: true,  filterable: true,  visible: true, align: "left",
    badgeVariants: { Active: "default", Pending: "secondary", Inactive: "outline" } },
  { id: "c5", key: "progress", label: "Progress", type: "progress", sortable: true,  filterable: false, visible: true, align: "left" },
  { id: "c6", key: "joined",   label: "Joined",   type: "date",     sortable: true,  filterable: false, visible: true, align: "left" },
];

const sharedData: DemoRow[] = [
  { id: "1", name: "Sarah Chen",     email: "sarah@acme.co", role: "Admin",  status: "Active",   progress: 92, joined: "2023-04-12" },
  { id: "2", name: "Mike Rodriguez", email: "mike@acme.co",  role: "Editor", status: "Active",   progress: 71, joined: "2023-07-03" },
  { id: "3", name: "Anna Kim",       email: "anna@acme.co",  role: "Viewer", status: "Pending",  progress: 48, joined: "2024-01-22" },
  { id: "4", name: "Tom Baker",      email: "tom@acme.co",   role: "Admin",  status: "Inactive", progress: 12, joined: "2022-11-08" },
  { id: "5", name: "Lisa Park",      email: "lisa@acme.co",  role: "Editor", status: "Active",   progress: 85, joined: "2023-09-15" },
];

const sharedBase: Omit<TableBuilderConfig, "title" | "description" | "columns"> = {
  enableSearch: true,
  enablePagination: true,
  enableRowSelection: false,
  enableDnD: false,
  enableColumnVisibility: false,
  enableExport: false,
  enableStriped: false,
  enableHover: true,
  enableBordered: false,
  enableStickyHeader: false,
  enableExpandableRows: false,
  enableInlineEdit: false,
  enableBulkActions: false,
  enableColumnResize: false,
  enableMultiSort: false,
  enableColumnFilters: false,
  enableRowGrouping: false,
  enableAggregation: false,
  enableFooter: false,
  pageSize: 5,
  sortMode: "client",
  paginationMode: "client",
  apiEndpoint: "",
  direction: "ltr",
  density: "comfortable",
};

// ─────────────────────────────────────────────────────────────────────
// CASE 1 — typed JSX `renderDialog`
// ─────────────────────────────────────────────────────────────────────
const dialogRenderer: RowDialogRenderer<DemoRow> = ({ row, close }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {row.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="text-base font-semibold">{row.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3" /> {row.email}
        </div>
      </div>
      <Badge className="ms-auto" variant={row.status === "Active" ? "default" : "secondary"}>
        {row.status}
      </Badge>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-md border border-border bg-muted/30 p-3">
        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Role</div>
        <div className="text-sm font-medium mt-0.5 flex items-center gap-1">
          <Award className="h-3 w-3 text-primary" /> {row.role}
        </div>
      </div>
      <div className="rounded-md border border-border bg-muted/30 p-3">
        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Joined</div>
        <div className="text-sm font-medium mt-0.5 flex items-center gap-1">
          <Calendar className="h-3 w-3 text-primary" /> {row.joined}
        </div>
      </div>
    </div>
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
          <Activity className="h-3 w-3" /> Onboarding progress
        </div>
        <div className="text-xs font-semibold tabular-nums">{row.progress}%</div>
      </div>
      <Progress value={row.progress} className="h-2" />
    </div>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={close}
        className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted"
      >
        Close
      </button>
    </div>
  </div>
);

const DIALOG_SOURCE = `({ row, close }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {row.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="text-base font-semibold">{row.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3" /> {row.email}
        </div>
      </div>
      <Badge className="ms-auto" variant={row.status === "Active" ? "default" : "secondary"}>
        {row.status}
      </Badge>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-md border border-border bg-muted/30 p-3">
        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Role</div>
        <div className="text-sm font-medium mt-0.5 flex items-center gap-1">
          <Award className="h-3 w-3 text-primary" /> {row.role}
        </div>
      </div>
      <div className="rounded-md border border-border bg-muted/30 p-3">
        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Joined</div>
        <div className="text-sm font-medium mt-0.5 flex items-center gap-1">
          <Calendar className="h-3 w-3 text-primary" /> {row.joined}
        </div>
      </div>
    </div>
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
          <Activity className="h-3 w-3" /> Onboarding progress
        </div>
        <div className="text-xs font-semibold tabular-nums">{row.progress}%</div>
      </div>
      <Progress value={row.progress} className="h-2" />
    </div>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={close}
        className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted"
      >
        Close
      </button>
    </div>
  </div>
)`;

// ─────────────────────────────────────────────────────────────────────
// CASE 2 — typed JSX `renderExpandedRow`
// ─────────────────────────────────────────────────────────────────────
const expandedRenderer: ExpandedRowRenderer<DemoRow> = ({ row, columns }) => (
  <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Row · {row.name}
      </div>
      <Badge variant="outline" className="text-[10px]">
        {columns.length} columns visible
      </Badge>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {columns.filter(c => c.key !== "name").map(col => (
        <div key={col.id} className="rounded-md border border-border bg-background p-3">
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">{col.label}</div>
          <div className="text-sm font-medium mt-0.5">{String(row[col.key] ?? "—")}</div>
        </div>
      ))}
    </div>
  </div>
);

const EXPANDED_SOURCE = `({ row, columns }) => (
  <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Row · {row.name}
      </div>
      <Badge variant="outline" className="text-[10px]">
        {columns.length} columns visible
      </Badge>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {columns.filter(c => c.key !== "name").map(col => (
        <div key={col.id} className="rounded-md border border-border bg-background p-3">
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">{col.label}</div>
          <div className="text-sm font-medium mt-0.5">{String(row[col.key] ?? "—")}</div>
        </div>
      ))}
    </div>
  </div>
)`;

export const interactionRendererTemplates = {
  // ─── JSX renderDialog ───
  jsxDialogRenderer: {
    key: "jsxDialogRenderer",
    title: "JSX Row Dialog",
    description:
      "`rowClickAction.renderDialog` returns a typed JSX tree — TanStack-style, full type safety, no mustache strings.",
    complexity: "advanced" as const,
    config: {
      ...sharedBase,
      title: "Team — JSX dialog renderer",
      description: "Click any row to open the typed JSX dialog.",
      columns: sharedColumns(),
      rowClickAction: {
        type: "dialog" as const,
        renderDialog: dialogRenderer as RowDialogRenderer,
      },
    },
    sampleData: sharedData as Array<Record<string, unknown>>,
    rendererSources: {
      imports:
`import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, Calendar, Award, Activity } from "lucide-react";
import type { RowDialogRenderer } from "@/components/tables/types";
import type { Row } from "./tableConfig";`,
      dialog: DIALOG_SOURCE,
    } satisfies TableRendererSources,
  },

  // ─── JSX renderExpandedRow ───
  jsxExpandedRowRenderer: {
    key: "jsxExpandedRowRenderer",
    title: "JSX Expanded Row",
    description:
      "`config.renderExpandedRow` returns a typed JSX tree — overrides the built-in `expandableLayout` switch.",
    complexity: "advanced" as const,
    config: {
      ...sharedBase,
      title: "Team — JSX expanded row",
      description: "Expand any row to open the typed JSX expanded body.",
      enableExpandableRows: true,
      expandableIconStyle: "chevron" as const,
      columns: sharedColumns(),
      renderExpandedRow: expandedRenderer as ExpandedRowRenderer,
    },
    sampleData: sharedData as Array<Record<string, unknown>>,
    rendererSources: {
      imports:
`import { Badge } from "@/components/ui/badge";
import type { ExpandedRowRenderer } from "@/components/tables/types";
import type { Row } from "./tableConfig";`,
      expandedRow: EXPANDED_SOURCE,
    } satisfies TableRendererSources,
  },

  // ─── JSX renderPagination ───
  jsxPaginationRenderer: {
    key: "jsxPaginationRenderer",
    title: "JSX Pagination Bar",
    description:
      "`config.renderPagination` returns a typed JSX tree — overrides the built-in pagination layouts with a fully custom bar.",
    complexity: "advanced" as const,
    config: {
      ...sharedBase,
      title: "Team — JSX pagination bar",
      description: "Custom typed JSX pagination, with full control over layout + style.",
      columns: sharedColumns(),
      renderPagination: (({ page, setPage, totalPages, totalRows }) => (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <div className="text-xs">
            <span className="font-semibold text-primary tabular-nums">{page + 1}</span>
            <span className="text-muted-foreground"> of </span>
            <span className="font-semibold tabular-nums">{totalPages}</span>
            <span className="text-muted-foreground"> · {totalRows} rows</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="text-xs px-3 py-1.5 rounded-md border border-primary/50 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )) as PaginationRenderer,
    },
    sampleData: sharedData as Array<Record<string, unknown>>,
    rendererSources: {
      imports:
`import type { PaginationRenderer } from "@/components/tables/types";`,
      pagination:
`({ page, setPage, totalPages, totalRows }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
    <div className="text-xs">
      <span className="font-semibold text-primary tabular-nums">{page + 1}</span>
      <span className="text-muted-foreground"> of </span>
      <span className="font-semibold tabular-nums">{totalPages}</span>
      <span className="text-muted-foreground"> · {totalRows} rows</span>
    </div>
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setPage(p => Math.max(0, p - 1))}
        disabled={page === 0}
        className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40"
      >
        ← Prev
      </button>
      <button
        type="button"
        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
        disabled={page >= totalPages - 1}
        className="text-xs px-3 py-1.5 rounded-md border border-primary/50 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  </div>
)`,
    } satisfies TableRendererSources,
  },
};
