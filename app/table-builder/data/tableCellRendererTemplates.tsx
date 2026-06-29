/**
 * Cell renderer demos for the Data Table Builder — mirrors the tree
 * builder's `renderNode` pattern but for table cells.
 *
 * Each template carries:
 *   • a full TableBuilderConfig (with `renderCell` and/or per-column
 *     `column.renderCell` wired in)
 *   • realistic sample data
 *   • `rendererSources`: the *source strings* the code generator uses to
 *     emit a real `renderers.tsx` file alongside `tableConfig.ts`. The
 *     emitted code is 1:1 with what you see here — zero magic.
 *
 * Resolution order at render time (built into the engine):
 *   column.renderCell  ->  config.renderCell  ->  built-in default
 *
 * Both renderers receive a fully-typed `CellRenderContext<Row>`:
 *   { row, value, column, rowIndex, isSelected }
 */
import { CheckCircle2, Circle, AlertCircle, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import type {
  CellRenderer,
  TableBuilderConfig,
  TableColumnConfig,
} from "@/tables/types";
import type { TableRendererSources } from "@/table-builder/utils/tableCodeGenerator";

// ─────────────────────────────────────────────────────────────────────
// Typed row shape for these demos. Mirrors what the code generator's
// `pickRowType()` would emit from the column definitions below.
// ─────────────────────────────────────────────────────────────────────
interface DemoRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  progress: number;
  rating: number;
}

// ─────────────────────────────────────────────────────────────────────
// CASE 1 — single reusable renderer that ONLY customises the "name"
// column. Returning `undefined` for every other column makes TablePreview
// fall through to the built-in renderer for that column type, so you
// don't have to re-implement defaults you don't care about.
// ─────────────────────────────────────────────────────────────────────
const reusableRenderer: CellRenderer<DemoRow> = ({ row, value, column }) => {
  if (column.key === "name") {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
            {String(value).split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-xs font-semibold truncate">{String(value)}</div>
          <div className="text-[10px] text-muted-foreground truncate">#{row.id} · {row.role}</div>
        </div>
      </div>
    );
  }
  // Any other column → return undefined → engine renders the built-in default.
  return undefined;
};

// Source string for the code generator. Kept verbatim from the renderer
// above (minus the `DemoRow` typing → `Row` in the generated file).
const REUSABLE_SOURCE = `({ row, value, column }) => {
  if (column.key === "name") {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
            {String(value).split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-xs font-semibold truncate">{String(value)}</div>
          <div className="text-[10px] text-muted-foreground truncate">#{row.id} · {row.role}</div>
        </div>
      </div>
    );
  }
  // Fall through to the built-in renderer for every other column.
  return undefined;
}`;

// ─────────────────────────────────────────────────────────────────────
// CASE 2 — per-column renderers. Each column owns its visual contract,
// fully typed via `row: Row` inside each renderer.
// ─────────────────────────────────────────────────────────────────────
const statusRenderer: CellRenderer<DemoRow> = ({ value }) => {
  const v = String(value);
  const map: Record<string, { icon: typeof CheckCircle2; cls: string; label: string }> = {
    Active:   { icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", label: "Active" },
    Pending:  { icon: AlertCircle,  cls: "text-amber-600 bg-amber-500/10 border-amber-500/20",       label: "Pending" },
    Inactive: { icon: Circle,       cls: "text-muted-foreground bg-muted border-border",             label: "Inactive" },
  };
  const meta = map[v] ?? map.Inactive;
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={`gap-1 text-[10px] font-semibold ${meta.cls}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
};

const progressRenderer: CellRenderer<DemoRow> = ({ value }) => {
  const n = Math.max(0, Math.min(100, Number(value) || 0));
  const tone =
    n >= 80 ? "[&>div]:bg-emerald-500" :
    n >= 50 ? "[&>div]:bg-amber-500"   :
              "[&>div]:bg-rose-500";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={n} className={`h-1.5 flex-1 ${tone}`} />
      <span className="text-[10px] tabular-nums font-mono w-9 text-end">{n}%</span>
    </div>
  );
};

const ratingRenderer: CellRenderer<DemoRow> = ({ value }) => {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">{n.toFixed(1)}</span>
    </div>
  );
};

const PER_COLUMN_SOURCES: Record<string, string> = {
  c4: `({ value }) => {
  const v = String(value);
  const map: Record<string, { icon: typeof CheckCircle2; cls: string; label: string }> = {
    Active:   { icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", label: "Active" },
    Pending:  { icon: AlertCircle,  cls: "text-amber-600 bg-amber-500/10 border-amber-500/20",       label: "Pending" },
    Inactive: { icon: Circle,       cls: "text-muted-foreground bg-muted border-border",             label: "Inactive" },
  };
  const meta = map[v] ?? map.Inactive;
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={\`gap-1 text-[10px] font-semibold \${meta.cls}\`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}`,
  c5: `({ value }) => {
  const n = Math.max(0, Math.min(100, Number(value) || 0));
  const tone =
    n >= 80 ? "[&>div]:bg-emerald-500" :
    n >= 50 ? "[&>div]:bg-amber-500"   :
              "[&>div]:bg-rose-500";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={n} className={\`h-1.5 flex-1 \${tone}\`} />
      <span className="text-[10px] tabular-nums font-mono w-9 text-end">{n}%</span>
    </div>
  );
}`,
  c6: `({ value }) => {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={\`h-3.5 w-3.5 \${i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}\`}
        />
      ))}
      <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">{n.toFixed(1)}</span>
    </div>
  );
}`,
};

// ─────────────────────────────────────────────────────────────────────
// Shared column shape used by both demos. We deliberately use the SAME
// data shape so the two templates are easy to compare side-by-side.
// ─────────────────────────────────────────────────────────────────────
const sharedColumns = (
  overrides: Partial<Record<string, Partial<TableColumnConfig>>> = {},
): TableColumnConfig[] => [
  { id: "c1", key: "name",     label: "Member",   type: "text",   sortable: true,  filterable: true,  visible: true, align: "left",  ...overrides.c1 },
  { id: "c2", key: "email",    label: "Email",    type: "email",  sortable: true,  filterable: true,  visible: true, align: "left",  ...overrides.c2 },
  { id: "c3", key: "role",     label: "Role",     type: "text",   sortable: true,  filterable: true,  visible: true, align: "left",  ...overrides.c3 },
  { id: "c4", key: "status",   label: "Status",   type: "text",   sortable: true,  filterable: true,  visible: true, align: "left",  ...overrides.c4 },
  { id: "c5", key: "progress", label: "Progress", type: "number", sortable: true,  filterable: false, visible: true, align: "left",  ...overrides.c5 },
  { id: "c6", key: "rating",   label: "Rating",   type: "number", sortable: true,  filterable: false, visible: true, align: "left",  ...overrides.c6 },
];

const sharedData: Array<Record<string, unknown>> = [
  { id: "1", name: "Sarah Chen",      email: "sarah@acme.co",  role: "Admin",  status: "Active",   progress: 92, rating: 5 },
  { id: "2", name: "Mike Rodriguez",  email: "mike@acme.co",   role: "Editor", status: "Active",   progress: 71, rating: 4 },
  { id: "3", name: "Anna Kim",        email: "anna@acme.co",   role: "Viewer", status: "Pending",  progress: 48, rating: 3 },
  { id: "4", name: "Tom Baker",       email: "tom@acme.co",    role: "Admin",  status: "Inactive", progress: 12, rating: 2 },
  { id: "5", name: "Lisa Park",       email: "lisa@acme.co",   role: "Editor", status: "Active",   progress: 85, rating: 5 },
  { id: "6", name: "James Wilson",    email: "james@acme.co",  role: "Viewer", status: "Pending",  progress: 33, rating: 3 },
];

const sharedBase: Omit<TableBuilderConfig, "title" | "description" | "columns"> = {
  enableSearch: true,
  enablePagination: true,
  enableRowSelection: true,
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
  pageSize: 6,
  sortMode: "client",
  paginationMode: "client",
  apiEndpoint: "",
  direction: "ltr",
  density: "comfortable",
};

export const cellRendererTemplates = {
  // ─── Case 1: single reusable renderer ───
  reusableCellRenderer: {
    key: "reusableCellRenderer",
    title: "Reusable Cell Renderer",
    description:
      "One typed renderer drives every cell. The generated `tableConfig.ts` imports `renderCell` from `./renderers.tsx`.",
    complexity: "intermediate" as const,
    config: {
      ...sharedBase,
      title: "Team — reusable cell renderer",
      description: "Every cell flows through a single typed renderer (config.renderCell).",
      columns: sharedColumns(),
      renderCell: reusableRenderer as CellRenderer,
    },
    sampleData: sharedData,
    rendererSources: {
      imports: `import { Avatar, AvatarFallback } from "@/components/ui/avatar";\nimport type { CellRenderer } from "@/components/tables/types";\nimport type { Row } from "./tableConfig";`,
      reusable: REUSABLE_SOURCE,
    } satisfies TableRendererSources,
  },

  // ─── Case 2: per-column renderers ───
  perColumnRenderer: {
    key: "perColumnRenderer",
    title: "Per-Column Cell Renderers",
    description:
      "Each column owns its visual contract via `column.renderCell`. Status, progress and rating each get a fully-typed renderer.",
    complexity: "advanced" as const,
    config: {
      ...sharedBase,
      title: "Team — per-column renderers",
      description: "Each column ships its own typed CellRenderer.",
      columns: sharedColumns({
        c4: { renderCell: statusRenderer as CellRenderer },
        c5: { renderCell: progressRenderer as CellRenderer },
        c6: { renderCell: ratingRenderer as CellRenderer },
      }),
    },
    sampleData: sharedData,
    rendererSources: {
      imports: `import { Badge } from "@/components/ui/badge";\nimport { Progress } from "@/components/ui/progress";\nimport { CheckCircle2, Circle, AlertCircle, Star } from "lucide-react";\nimport type { CellRenderer } from "@/components/tables/types";\nimport type { Row } from "./tableConfig";`,
      perColumn: PER_COLUMN_SOURCES,
    } satisfies TableRendererSources,
  },
};
