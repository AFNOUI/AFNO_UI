"use client";

import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  X,
  Eye,
  Plus,
  Minus,
  Trash2,
  Search,
  Loader2,
  Columns3,
  Download,
  FileJson,
  ChevronUp,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  GripVertical,
  ExternalLink,
  ChevronsUpDown,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import {
  DndProvider,
  useDropZone,
  useDraggable,
  type DropResult,
  useDndContext,
} from "@/components/ui/dnd";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  renderRowDialogText,
  renderRowDialogTemplate,
} from "@/utils/rowDialogTemplate";
import {
  useTablePreview,
  aggregate as aggregateValues,
} from "@/table-builder/hooks/useTablePreview";
import {
  TableColumnConfig,
  TableBuilderConfig,
  TableRowClickConfig,
  ExpandableIconStyle,
  TableRow as TableRowType,
} from "@/table-builder/data/tableBuilderTemplates";
import { runCellJs } from "@/utils/cellJsRunner";

// ───── cell renderer ─────
// The rich default per-`col.type` renderer lives in
// `src/components/tables/defaultCellRenderer.tsx` and is used as the engine
// fallback. Per-column or per-table overrides via `column.renderCell` /
// `config.renderCell` short-circuit it.
import {
  DefaultCellRenderer,
  type DefaultCellRowAction as RowActionButton,
} from "@/tables/defaultCellRenderer";

// ───── Expandable row content ─────
// Layout switch lives in `src/components/tables/defaultExpandedRowRenderer.tsx`
// so user-supplied `renderExpandedRow` can compose with the built-in layouts.
import { DefaultRowDialogBody } from "@/tables/defaultRowDialog";
import { useRowApiActions } from "@/tables/useRowApiActions.hook";
import { DefaultPaginationBar } from "@/tables/defaultPaginationBar";
import { DefaultExpandedRow } from "@/tables/defaultExpandedRowRenderer";

interface TablePreviewProps {
  isLoading?: boolean;
  config: TableBuilderConfig;
  data: Record<string, unknown>[];
  /**
   * Optional dispatcher invoked whenever an interactive cell (switch, dropdown,
   * radio, rating) changes value. Receives the full row, the column key, the
   * previous value, and the new value. Returning a rejected promise does NOT
   * auto-rollback — use `config.apiConfig.rowActions` for optimistic rollback.
   */
  onCellInteract?: (
    row: Record<string, unknown>,
    key: string,
    oldValue: unknown,
    newValue: unknown,
  ) => Promise<void> | void;
}

// ───── helpers ─────

const aggregate = aggregateValues;

/** Replace `{id}` and `{field}` tokens in a URL template using the row data. */
function interpolateUrl(
  template: string,
  row: Record<string, unknown>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = k === "id" ? row.id : row[k];
    return v == null ? "" : encodeURIComponent(String(v));
  });
}

/** Resolve a click action to an action handler — or null if no-op. */
function resolveClickAction(
  action: TableRowClickConfig | undefined,
  row: Record<string, unknown>,
  openDialog: (row: Record<string, unknown>) => void,
  value?: unknown,
): (() => void) | null {
  if (!action || action.type === "none") return null;
  return () => {
    if (action.type === "dialog") return openDialog(row);
    if (action.type === "js") {
      runCellJs(action.code ?? "", { row, value });
      return;
    }
    const url = action.urlTemplate
      ? interpolateUrl(action.urlTemplate, row)
      : "#";
    if (action.type === "route-new") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  };
}

/** Compute cumulative offset (px) for sticky pinned columns. */
function computePinOffsets(
  pinned: TableColumnConfig[],
  widths: Record<string, number>,
  fallback = 140,
): number[] {
  const out: number[] = [];
  let acc = 0;
  for (const c of pinned) {
    out.push(acc);
    acc += widths[c.id] || c.width || fallback;
  }
  return out;
}

/** Compute sticky cell style for a pinned column. */
function pinStyle(
  pinned: "start" | "end" | null | undefined,
  offset: number | undefined,
  direction: "ltr" | "rtl",
  isLastStart = false,
  isFirstEnd = false,
): React.CSSProperties | undefined {
  if (!pinned || offset == null) return undefined;
  const startSide = direction === "rtl" ? "right" : "left";
  const endSide = direction === "rtl" ? "left" : "right";
  const style: React.CSSProperties = {
    position: "sticky",
    zIndex: 2,
    background: "hsl(var(--background))",
  };
  if (pinned === "start") {
    style[startSide as "left"] = offset;
    if (isLastStart) {
      style.boxShadow = "inset -1px 0 0 0 hsl(var(--border))";
    }
  } else {
    style[endSide as "right"] = offset;
    if (isFirstEnd) {
      style.boxShadow = "inset 1px 0 0 0 hsl(var(--border))";
    }
  }
  return style;
}
function ExpandIcon({
  style,
  expanded,
}: {
  style: ExpandableIconStyle;
  expanded: boolean;
}) {
  const cls = cn(
    "h-3.5 w-3.5 transition-transform",
    expanded &&
      (style === "chevron" || style === "caret" || style === "arrow") &&
      "rotate-90",
  );
  switch (style) {
    case "plus":
      return expanded ? (
        <Minus className="h-3.5 w-3.5" />
      ) : (
        <Plus className="h-3.5 w-3.5" />
      );
    case "caret":
      return <ChevronRight className={cls} />;
    case "arrow":
      return <ArrowRight className={cls} />;
    case "eye":
      return <Eye className={cn("h-3.5 w-3.5", expanded && "text-primary")} />;
    case "chevron":
    default:
      return <ChevronRight className={cls} />;
  }
}

function TableRowDragPreview({
  row,
  config,
  visibleCols,
  columnWidths,
  density,
  rowIdx,
  selected,
  expanded,
  sourceWidth,
}: {
  row: Record<string, unknown>;
  config: TableBuilderConfig;
  visibleCols: TableColumnConfig[];
  columnWidths: Record<string, number>;
  density: "comfortable" | "compact" | "spacious";
  rowIdx: number;
  selected: boolean;
  expanded: boolean;
  sourceWidth?: number;
}) {
  const heightClass =
    density === "compact" ? "h-9" : density === "spacious" ? "h-14" : "h-11";
  const leadingWidth =
    36 *
    ((config.enableDnD ? 1 : 0) +
      (config.enableExpandableRows ? 1 : 0) +
      (config.enableRowSelection ? 1 : 0));
  const contentWidth = visibleCols.reduce(
    (sum, col) => sum + (columnWidths[col.id] || col.width || 150),
    0,
  );
  const width = Math.max(sourceWidth ?? 0, leadingWidth + contentWidth, 320);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-primary/45 bg-background shadow-2xl ring-2 ring-primary/15",
        config.enableStriped && rowIdx % 2 === 1 && "bg-muted/40",
      )}
      style={{ width }}
    >
      <div className={cn("flex items-center", heightClass)}>
        {config.enableDnD && (
          <div className="flex h-full w-9 shrink-0 items-center justify-center border-e border-border/60 text-primary">
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}
        {config.enableExpandableRows && (
          <div className="flex h-full w-9 shrink-0 items-center justify-center border-e border-border/60 text-muted-foreground">
            <ExpandIcon
              style={config.expandableIconStyle || "chevron"}
              expanded={expanded}
            />
          </div>
        )}
        {config.enableRowSelection && (
          <div className="flex h-full w-9 shrink-0 items-center justify-center border-e border-border/60">
            <span
              className={cn(
                "h-4 w-4 rounded-sm border",
                selected && "border-primary bg-primary",
              )}
            />
          </div>
        )}
        {visibleCols.map((col) => {
          const val = row[col.key];
          const widthPx = columnWidths[col.id] || col.width || 150;
          const custom = col.renderCell ?? config.renderCell;
          const customOut = custom?.({
            row: row as TableRowType,
            value: val,
            column: col,
            rowIndex: rowIdx,
            isSelected: selected,
          });
          return (
            <div
              key={col.id}
              className={cn(
                "flex h-full min-w-0 items-center overflow-hidden border-e border-border/50 px-4 py-2 text-sm last:border-e-0 [&_*]:pointer-events-none",
                col.align === "center" && "justify-center text-center",
                col.align === "right" && "justify-end text-end",
              )}
              style={{ width: widthPx, minWidth: widthPx }}
            >
              {customOut ?? (
                <DefaultCellRenderer
                  col={col}
                  row={row}
                  val={val}
                  density={density}
                  inlineEdit={false}
                  onUpdate={() => undefined}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───── sortable row ─────
function SortableRow({
  row,
  rowIdx,
  config,
  density,
  expanded,
  selected,
  visibleCols,
  columnWidths,
  onRowClick,
  onCellUpdate,
  onToggleSelect,
  onToggleExpand,
  onOpenRowDialog,
  getRowActionButtons,
}: {
  rowIdx: number;
  selected: string[];
  expanded: string[];
  config: TableBuilderConfig;
  row: Record<string, unknown>;
  visibleCols: TableColumnConfig[];
  columnWidths: Record<string, number>;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  density: "comfortable" | "compact" | "spacious";
  onRowClick?: (row: Record<string, unknown>) => void;
  onOpenRowDialog: (row: Record<string, unknown>) => void;
  onCellUpdate: (rowId: string, key: string, value: unknown) => void;
  getRowActionButtons?: (
    row: Record<string, unknown>,
    col: TableColumnConfig,
  ) => RowActionButton[];
}) {
  const rowRef = useRef<HTMLTableRowElement | null>(null);
  // Drag handle wired to the custom Pointer DnD library. The row itself is
  // still the visual drag source, but only the GripVertical button is the
  // pointer trigger — clicking elsewhere on the row keeps row-click intact.
  const { dragProps, isDragging } = useDraggable<{ rowId: string }>({
    id: row.id as string,
    data: useMemo(() => ({ rowId: row.id as string }), [row.id]),
    disabled: !config.enableDnD,
    sourceRef: rowRef,
    preview: () => (
      <TableRowDragPreview
        row={row}
        config={config}
        visibleCols={visibleCols}
        columnWidths={columnWidths}
        density={density}
        rowIdx={rowIdx}
        selected={selected.includes(row.id as string)}
        expanded={expanded.includes(row.id as string)}
        sourceWidth={rowRef.current?.getBoundingClientRect().width}
      />
    ),
  });

  const heightClass =
    density === "compact" ? "h-9" : density === "spacious" ? "h-14" : "h-11";
  const isSelected = selected.includes(row.id as string);
  const isExpanded = expanded.includes(row.id as string);
  const iconStyle = config.expandableIconStyle || "chevron";
  const iconPos = config.expandableIconPosition || "first";

  // helper cells
  const dragCell = config.enableDnD && (
    <TableCell key="dnd" className="w-9 px-1 align-middle" data-noclick="true">
      <button
        type="button"
        {...dragProps}
        data-dnd-item={undefined}
        data-dragging={undefined}
        className={cn(
          "group/handle relative flex items-center justify-center h-7 w-7 rounded-md mx-auto",
          "cursor-grab active:cursor-grabbing transition-all",
          "text-muted-foreground/50 hover:text-primary hover:bg-primary/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          isDragging && "text-primary bg-primary/15",
        )}
        aria-label="Drag to reorder row"
        title="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5 transition-transform group-hover/handle:scale-110" />
      </button>
    </TableCell>
  );

  const expandCell = config.enableExpandableRows && (
    <TableCell key="exp" className="w-9 px-1 align-middle" data-noclick="true">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 mx-auto flex"
        data-noclick="true"
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand(row.id as string);
        }}
      >
        <ExpandIcon style={iconStyle} expanded={isExpanded} />
      </Button>
    </TableCell>
  );

  const selectCell = config.enableRowSelection && (
    <TableCell key="sel" className="w-9 px-1 align-middle">
      <div className="flex items-center justify-center h-7">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(row.id as string)}
          aria-label="Select row"
        />
      </div>
    </TableCell>
  );

  const orderedLeading: React.ReactNode[] = [];
  if (dragCell) orderedLeading.push(dragCell);
  if (config.enableExpandableRows && config.enableRowSelection) {
    if (iconPos === "before-checkbox" || iconPos === "first") {
      orderedLeading.push(expandCell, selectCell);
    } else if (iconPos === "after-checkbox" || iconPos === "last") {
      orderedLeading.push(selectCell, expandCell);
    } else {
      orderedLeading.push(expandCell, selectCell);
    }
  } else {
    if (config.enableExpandableRows && iconPos !== "last")
      orderedLeading.push(expandCell);
    if (selectCell) orderedLeading.push(selectCell);
    if (config.enableExpandableRows && iconPos === "last")
      orderedLeading.push(expandCell);
  }

  const pinEnabled = !!config.enablePinnedColumns;
  const startCols = pinEnabled
    ? visibleCols.filter((c) => c.pinned === "start")
    : [];
  const endCols = pinEnabled
    ? visibleCols.filter((c) => c.pinned === "end")
    : [];
  const startOffsets = computePinOffsets(startCols, columnWidths);
  const endOffsets = computePinOffsets([...endCols].reverse(), columnWidths);

  return (
    <>
      <TableRow
        ref={rowRef}
        data-dnd-item="true"
        data-dragging={isDragging ? "true" : "false"}
        data-state={isSelected ? "selected" : undefined}
        onClick={
          onRowClick
            ? (e) => {
                // Bulletproof guard: if the click originated from an inline control
                // (switch / dropdown / radio / actions cell) or any element marked
                // `data-noclick`, do NOT trigger the row action. We walk up from
                // the actual event target to the row root — covers cases where the
                // click hits a deeply-nested child of the control.
                const target = e.target as HTMLElement | null;
                if (target?.closest?.("[data-noclick='true']")) return;
                // Also bail when clicking inside any element rendered into a portal
                // (dropdown menu items, popovers, dialogs) — those bubble through
                // React's synthetic event system but are visually outside the row.
                if (
                  target?.closest?.(
                    "[role='menu'], [role='menuitem'], [role='dialog']",
                  )
                )
                  return;
                onRowClick(row);
              }
            : undefined
        }
        className={cn(
          heightClass,
          config.enableStriped && rowIdx % 2 === 1 && "bg-muted/40",
          config.enableHover && "hover:bg-muted/60 transition-colors",
          !config.enableHover && "hover:bg-transparent",
          isSelected && "bg-primary/5 hover:bg-primary/10",
          isDragging && "opacity-30",
          onRowClick && "cursor-pointer",
          config.enableDnD && "data-[dragging=true]:bg-primary/5",
        )}
      >
        {orderedLeading}
        {visibleCols.map((col) => {
          const val = row[col.key];
          const width = columnWidths[col.id] || col.width;
          const pinIdx =
            col.pinned === "start"
              ? startCols.findIndex((c) => c.id === col.id)
              : col.pinned === "end"
                ? endCols.findIndex((c) => c.id === col.id)
                : -1;
          const pinOffset =
            col.pinned === "start" && pinIdx >= 0
              ? startOffsets[pinIdx]
              : col.pinned === "end" && pinIdx >= 0
                ? endOffsets[endCols.length - 1 - pinIdx]
                : undefined;
          const sticky = pinEnabled
            ? pinStyle(
                col.pinned ?? null,
                pinOffset,
                config.direction,
                col.pinned === "start" && pinIdx === startCols.length - 1,
                col.pinned === "end" && pinIdx === 0,
              )
            : undefined;
          const widthStyle = width
            ? { width: `${width}px`, minWidth: `${width}px` }
            : undefined;
          const cellAction = resolveClickAction(
            col.clickAction,
            row,
            onOpenRowDialog,
            val,
          );
          return (
            <TableCell
              key={col.id}
              style={{ ...widthStyle, ...sticky }}
              className={cn(
                "py-2 align-middle",
                col.align === "center" && "text-center",
                col.align === "right" && "text-end",
              )}
            >
              {(() => {
                const custom = col.renderCell ?? config.renderCell;
                if (custom) {
                  const out = custom({
                    row: row as TableRowType,
                    value: val,
                    column: col,
                    rowIndex: rowIdx,
                    isSelected,
                  });
                  // Returning `undefined` / `null` lets the cell fall through
                  // to the built-in renderer — handy when a reusable renderer
                  // only wants to customise *some* columns.
                  if (out !== undefined && out !== null) return out;
                }
                return (
                  <DefaultCellRenderer
                    col={col}
                    row={row}
                    val={val}
                    density={density}
                    inlineEdit={config.enableInlineEdit}
                    onUpdate={onCellUpdate}
                    rowActionButtons={getRowActionButtons?.(row, col)}
                    onCellClick={cellAction ?? undefined}
                  />
                );
              })()}
            </TableCell>
          );
        })}
      </TableRow>
      {isExpanded && config.enableExpandableRows && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell
            colSpan={
              visibleCols.length +
              (config.enableDnD ? 1 : 0) +
              (config.enableRowSelection ? 1 : 0) +
              1
            }
            className="p-0"
          >
            {(() => {
              // Resolution order: config.renderExpandedRow → expandableLayout switch
              if (config.renderExpandedRow) {
                const out = config.renderExpandedRow({
                  row: row as TableRowType,
                  columns: visibleCols,
                  rowIndex: rowIdx,
                });
                if (out !== undefined && out !== null) return out;
              }
              return (
                <DefaultExpandedRow
                  row={row as TableRowType}
                  layout={config.expandableLayout || "details"}
                  columns={visibleCols}
                  rowIndex={rowIdx}
                />
              );
            })()}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ───── loading skeleton ─────
function LoadingSkeleton({ cols, rows }: { cols: number; rows: number }) {
  return (
    <div className="space-y-0">
      <div className="border-b border-border p-3 flex gap-4 bg-muted/20">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="border-b border-border p-3 flex gap-4 items-center"
        >
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-3 flex-1 rounded"
              style={{ animationDelay: `${(r * cols + i) * 50}ms` }}
            />
          ))}
        </div>
      ))}
      <div className="flex items-center justify-center py-3 gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading data from API…
      </div>
    </div>
  );
}

// ───── pagination renderer ─────
// The default bar (with every paginationLayout — full/compact/numbered/
// minimal/infoOnly) lives in `src/components/tables/defaultPaginationBar.tsx`
// so user-supplied `config.renderPagination` can fully replace it.
// Resolution order: config.renderPagination → <DefaultPaginationBar />

// ───── grouped section helper ─────
function GroupedSection({
  groupKey,
  groupRows,
  config,
  visibleCols,
  selected,
  onToggleSelect,
  density,
  onCellUpdate,
  expanded,
  onToggleExpand,
  columnWidths,
  getRowActionButtons,
  onRowClick,
  onOpenRowDialog,
}: {
  groupKey: string;
  groupRows: Record<string, unknown>[];
  config: TableBuilderConfig;
  visibleCols: TableColumnConfig[];
  selected: string[];
  onToggleSelect: (id: string) => void;
  density: "comfortable" | "compact" | "spacious";
  onCellUpdate: (rowId: string, key: string, value: unknown) => void;
  expanded: string[];
  onToggleExpand: (id: string) => void;
  columnWidths: Record<string, number>;
  getRowActionButtons?: (
    row: Record<string, unknown>,
    col: TableColumnConfig,
  ) => RowActionButton[];
  onRowClick?: (row: Record<string, unknown>) => void;
  onOpenRowDialog: (row: Record<string, unknown>) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const totalCols =
    visibleCols.length +
    (config.enableDnD ? 1 : 0) +
    (config.enableRowSelection ? 1 : 0) +
    (config.enableExpandableRows ? 1 : 0);

  // Compute per-group aggregate if enabled
  const aggCols = visibleCols.filter(
    (c) => c.aggregation && c.aggregation !== "none",
  );

  return (
    <>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableCell colSpan={totalCols} className="py-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex items-center gap-2 text-xs font-semibold text-foreground"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  !collapsed && "rotate-90",
                )}
              />
              {groupKey}
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {groupRows.length}
              </Badge>
            </button>
            {config.enableAggregation && aggCols.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {aggCols.map((col) => (
                  <span
                    key={col.id}
                    className="text-[10px] text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">
                      {col.label}:
                    </span>{" "}
                    {col.type === "currency" ? col.format || "$" : ""}
                    {aggregate(
                      groupRows as TableRowType[],
                      col.key,
                      col.aggregation!,
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
      {!collapsed &&
        groupRows.map((row, i) => (
          <SortableRow
            key={row.id as string}
            row={row}
            rowIdx={i}
            config={config}
            visibleCols={visibleCols}
            selected={selected}
            onToggleSelect={onToggleSelect}
            density={density}
            onCellUpdate={onCellUpdate}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            columnWidths={columnWidths}
            getRowActionButtons={getRowActionButtons}
            onRowClick={onRowClick}
            onOpenRowDialog={onOpenRowDialog}
          />
        ))}
    </>
  );
}

// ───── main component ─────
/**
 * Drop-zone wrapper for the table body. Registers itself with the custom
 * Pointer DnD library so the active row's pointer-up drops at the resolved
 * insertion index. We attach the zone ref to the actual `<tbody>` so the
 * indexer (which scans `[data-dnd-item="true"]`) finds the rows directly.
 */
/**
 * DnD context — exposes the active hoverIndex + ghost slot size so each row
 * (and the trailing slot) can render a same-sized placeholder at the exact
 * insertion point. This is what gives users a clear "drop here" preview.
 */
const DndTableCtx = React.createContext<{
  isDragging: boolean;
  hoverIndex: number | null;
  slotHeight: number;
  previewNode: React.ReactNode;
  draggedId: string | null;
  colSpan: number;
} | null>(null);

function DndGhostRow({ index }: { index: number }) {
  const ctx = React.useContext(DndTableCtx);
  if (!ctx || !ctx.isDragging || ctx.hoverIndex !== index) return null;
  const height = Math.max(ctx.slotHeight, 28);
  return (
    <TableRow aria-hidden="true" className="pointer-events-none border-0">
      <TableCell colSpan={ctx.colSpan} className="p-0 border-0">
        <div
          className="mx-1 my-0.5 animate-in fade-in zoom-in-95 duration-150"
          style={{ height: `${height}px` }}
        >
          {ctx.previewNode ? (
            <div className="opacity-45 saturate-75">{ctx.previewNode}</div>
          ) : (
            <div className="h-full rounded-md border-2 border-dashed border-primary/60 bg-primary/10 ring-1 ring-primary/20" />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function DndTableBody({
  enabled,
  rowIds,
  onMove,
  colSpan,
  children,
}: {
  enabled: boolean;
  rowIds: string[];
  onMove: (rowId: string, toIndex: number) => void;
  colSpan: number;
  children: React.ReactNode;
}) {
  const handleDrop = useCallback(
    (result: DropResult<{ rowId: string }>) => {
      onMove(result.item.data.rowId, result.index);
    },
    [onMove],
  );
  const { zoneProps, isOver, hoverIndex, slotSize, isDragging } = useDropZone<
    Record<string, unknown>,
    { rowId: string }
  >({
    id: "table-rows",
    data: useMemo(() => ({ count: rowIds.length }), [rowIds.length]),
    disabled: !enabled,
    axis: "y",
    onDrop: handleDrop,
  });
  const { active } = useDndContext();
  const ctxValue = useMemo(
    () => ({
      isDragging: !!isDragging && isOver,
      hoverIndex: isOver ? hoverIndex : null,
      slotHeight: slotSize?.height ?? 0,
      previewNode: active?.previewNode ?? null,
      draggedId: active?.id ?? null,
      colSpan,
    }),
    [
      active?.id,
      active?.previewNode,
      isDragging,
      isOver,
      hoverIndex,
      slotSize?.height,
      colSpan,
    ],
  );
  return (
    <DndTableCtx.Provider value={ctxValue}>
      <TableBody {...(zoneProps as React.ComponentProps<typeof TableBody>)}>
        {children}
      </TableBody>
    </DndTableCtx.Provider>
  );
}

export function TablePreview({
  data,
  config,
  isLoading,
  onCellInteract,
}: TablePreviewProps) {
  const [dialogRow, setDialogRow] = useState<Record<string, unknown> | null>(
    null,
  );
  const [showJson, setShowJson] = useState(false);
  const openRowDialog = useCallback(
    (r: Record<string, unknown>) => setDialogRow(r),
    [],
  );
  const rowClickHandler = useCallback(
    (r: Record<string, unknown>) => {
      const action = config.rowClickAction;
      if (!action || action.type === "none") return;
      if (action.type === "dialog") return setDialogRow(r);
      if (action.type === "js") {
        runCellJs(action.code ?? "", { row: r, value: undefined });
        return;
      }
      const url = action.urlTemplate
        ? interpolateUrl(action.urlTemplate, r)
        : "#";
      if (action.type === "route-new")
        window.open(url, "_blank", "noopener,noreferrer");
      else window.location.href = url;
    },
    [config.rowClickAction],
  );
  const rowClickActive =
    config.rowClickAction && config.rowClickAction.type !== "none";
  const {
    search,
    setSearch,
    sorts,
    setSorts,
    columnFilters,
    setColumnFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    selected,
    setSelected,
    expanded,
    hiddenCols,
    columnWidths,
    rows,
    visibleCols,
    sorted,
    grouped,
    paged,
    totalPages,
    toggleSort,
    toggleSelect,
    toggleExpand,
    toggleSelectAll,
    toggleColumnVisibility,
    moveRow,
    handleCellUpdate,
    startResize,
  } = useTablePreview<TableRowType>({
    config,
    data: data as TableRowType[],
  });

  const sortStateFor = (key: string) => sorts.find((s) => s.key === key);

  const effectivePageSize = pageSize;

  // ─── Row-action API wiring ───
  // All the optimistic-update / fetch / rollback / toast logic lives in the
  // `useRowApiActions` hook (so this component stays presentational) and the
  // raw network calls live in `tableServices.ts`.
  const { wrappedCellUpdate, getRowActionButtons } = useRowApiActions({
    config,
    rows,
    applyLocalUpdate: handleCellUpdate,
    onCellInteract: onCellInteract as
      | ((
          row: TableRowType,
          key: string,
          oldValue: unknown,
          newValue: unknown,
        ) => Promise<void> | void)
      | undefined,
  });

  // ─── Virtualization: only safe when no grouping (group rows + collapsibles
  // mess with virtualizer flat-index assumptions) and no DnD (sortable needs
  // every row mounted to register sensors). Expand rows are fine because we
  // estimate per-row height based on expanded state.
  const virtualizationActive =
    !!config.enableVirtualization &&
    !grouped &&
    !config.enableDnD &&
    paged.length > 0;
  const virtualScrollRef = useRef<HTMLDivElement>(null);
  const rowHeightEstimate =
    config.virtualRowHeight ??
    (config.density === "compact"
      ? 36
      : config.density === "spacious"
        ? 56
        : 44);
  const rowVirtualizer = useVirtualizer({
    count: virtualizationActive ? paged.length : 0,
    getScrollElement: () => virtualScrollRef.current,
    estimateSize: (idx) => {
      const r = paged[idx];
      const isExp = r && expanded.includes(r.id as string);
      return rowHeightEstimate + (isExp ? 220 : 0);
    },
    overscan: 8,
    getItemKey: (idx) => (paged[idx]?.id as string) ?? idx,
  });

  // ─── Export (CSV / JSON) — respects current filters, sorts, and visible columns ───
  const exportRows = useCallback(
    (format: "csv" | "json") => {
      const filename = `${config.title.toLowerCase().replace(/\s+/g, "-") || "table"}.${format}`;

      if (format === "json") {
        // Emit only visible columns (+ id) so the export mirrors what the user sees.
        const data = sorted.map((r) => {
          const out: Record<string, unknown> = { id: r.id };
          for (const c of visibleCols) out[c.key] = r[c.key];
          return out;
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast({
          title: "Exported",
          description: `${data.length} rows downloaded as JSON`,
        });
        return;
      }

      // CSV: escape quotes per RFC 4180 and wrap every field; handle arrays/objects safely.
      const escape = (v: unknown): string => {
        if (v == null) return "";
        const s =
          Array.isArray(v) || typeof v === "object"
            ? JSON.stringify(v)
            : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      };
      const header = visibleCols.map((c) => escape(c.label || c.key)).join(",");
      const body = sorted
        .map((r) => visibleCols.map((c) => escape(r[c.key])).join(","))
        .join("\n");
      const blob = new Blob([header + "\n" + body], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Exported",
        description: `${sorted.length} rows downloaded as CSV`,
      });
    },
    [config.title, sorted, visibleCols],
  );

  const showFooter =
    config.enableFooter &&
    config.enableAggregation &&
    visibleCols.some((c) => c.aggregation && c.aggregation !== "none");

  const cardClasses = cn(
    "border-border w-full overflow-hidden",
    config.enableBordered && "ring-1 ring-border",
  );

  // CRITICAL FIX: only cap height when sticky-header is on AND pagination is OFF.
  // Otherwise pagination chunks the data — height capping creates a redundant inner scroll.
  // Virtualization always needs a scroll container with fixed height.
  const wantStickyScroll =
    (config.enableStickyHeader && !config.enablePagination) ||
    virtualizationActive;
  const wrapperHeight = virtualizationActive
    ? (config.virtualMaxHeight ?? 480)
    : (config.stickyMaxHeight ?? 600);
  const tableWrapperStyle = wantStickyScroll
    ? { maxHeight: `${wrapperHeight}px` }
    : undefined;
  const tableWrapperClasses = cn(
    "overflow-x-auto",
    wantStickyScroll && "overflow-y-auto",
    config.enableBordered &&
      "[&_td]:border-x [&_td]:border-border/60 [&_th]:border-x [&_th]:border-border/60",
  );

  // header columns for selection / dnd / expand following icon position
  const renderHeaderLeading = () => {
    const dragHead = config.enableDnD && (
      <TableHead key="dnd" className="w-9" />
    );
    const expandHead = config.enableExpandableRows && (
      <TableHead key="exp" className="w-9" />
    );
    const selectHead = config.enableRowSelection && (
      <TableHead key="sel" className="w-9 px-1">
        <div className="flex items-center justify-center h-7">
          <Checkbox
            checked={selected.length === paged.length && paged.length > 0}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all"
          />
        </div>
      </TableHead>
    );

    const arr: React.ReactNode[] = [];
    if (dragHead) arr.push(dragHead);
    const iconPos = config.expandableIconPosition || "first";
    if (config.enableExpandableRows && config.enableRowSelection) {
      if (iconPos === "before-checkbox" || iconPos === "first")
        arr.push(expandHead, selectHead);
      else arr.push(selectHead, expandHead);
    } else {
      if (config.enableExpandableRows && iconPos !== "last")
        arr.push(expandHead);
      if (selectHead) arr.push(selectHead);
      if (config.enableExpandableRows && iconPos === "last")
        arr.push(expandHead);
    }
    return arr;
  };

  return (
    <div className="space-y-4">
      <Card className={cardClasses} dir={config.direction}>
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {config.title}
              </CardTitle>
              {config.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {config.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {config.enableSearch && (
                <div className="relative">
                  <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search…"
                    className="ps-8 h-8 text-xs w-44"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                  />
                </div>
              )}
              {config.enableColumnVisibility && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                    >
                      <Columns3 className="h-3.5 w-3.5" /> Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs">
                      Toggle columns
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {config.columns
                      .filter((c) => c.visible)
                      .map((col) => (
                        <DropdownMenuCheckboxItem
                          key={col.id}
                          checked={!hiddenCols.includes(col.id)}
                          onCheckedChange={() => toggleColumnVisibility(col.id)}
                          className="text-xs"
                        >
                          {col.label || col.key}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {config.enableExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-xs">
                      Download {sorted.length} row
                      {sorted.length !== 1 ? "s" : ""}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-xs gap-2"
                      onClick={() => exportRows("csv")}
                    >
                      <Download className="h-3 w-3" /> Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-xs gap-2"
                      onClick={() => exportRows("json")}
                    >
                      <Download className="h-3 w-3" /> Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {selected.length > 0 && config.enableBulkActions && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-primary/5 rounded-lg border border-primary/15">
              <span className="text-xs font-medium text-primary">
                {selected.length} selected
              </span>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setSelected([])}
              >
                <X className="h-3 w-3" /> Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 text-destructive border-destructive/30"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </Button>
            </div>
          )}
          {config.enableMultiSort && sorts.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Sorted by:
              </span>
              {sorts.map((s, i) => (
                <Badge
                  key={s.key}
                  variant="secondary"
                  className="text-[10px] gap-1"
                >
                  {i + 1}. {s.key} {s.dir === "asc" ? "↑" : "↓"}
                  <button
                    onClick={() =>
                      setSorts((prev) => prev.filter((x) => x.key !== s.key))
                    }
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={() => setSorts([])}
                className="text-[10px] text-primary hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSkeleton
              cols={visibleCols.length}
              rows={effectivePageSize}
            />
          ) : (
            <div
              ref={virtualScrollRef}
              className={tableWrapperClasses}
              style={tableWrapperStyle}
            >
              <DndProvider>
                <Table>
                  <TableHeader
                    className={cn(
                      config.enableStickyHeader &&
                        "sticky top-0 z-10 bg-background/95 backdrop-blur-sm",
                    )}
                  >
                    {config.enableNestedHeaders &&
                      config.columnGroups &&
                      config.columnGroups.length > 0 && (
                        <TableRow className="bg-muted/30">
                          {renderHeaderLeading().map((_, i) => (
                            <TableHead key={`gh-pad-${i}`} className="w-9" />
                          ))}
                          {(() => {
                            const groups = config.columnGroups!;
                            const cells: React.ReactNode[] = [];
                            let i = 0;
                            while (i < visibleCols.length) {
                              const col = visibleCols[i];
                              const grp = groups.find((g) =>
                                g.columns.includes(col.id),
                              );
                              if (!grp) {
                                cells.push(
                                  <TableHead
                                    key={`gh-${col.id}`}
                                    className="border-b border-border/40"
                                  />,
                                );
                                i++;
                                continue;
                              }
                              let span = 0;
                              while (
                                i + span < visibleCols.length &&
                                grp.columns.includes(visibleCols[i + span].id)
                              )
                                span++;
                              cells.push(
                                <TableHead
                                  key={`gh-${grp.id}-${i}`}
                                  colSpan={span}
                                  className={cn(
                                    "text-center border-b border-border/40 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground py-1.5",
                                    grp.align === "left" && "text-start",
                                    grp.align === "right" && "text-end",
                                  )}
                                >
                                  {grp.label}
                                </TableHead>,
                              );
                              i += span;
                            }
                            return cells;
                          })()}
                        </TableRow>
                      )}
                    <TableRow>
                      {renderHeaderLeading()}
                      {visibleCols.map((col) => {
                        const sortState = sortStateFor(col.key);
                        const width = columnWidths[col.id] || col.width;
                        const startCols = config.enablePinnedColumns
                          ? visibleCols.filter((c) => c.pinned === "start")
                          : [];
                        const endCols = config.enablePinnedColumns
                          ? visibleCols.filter((c) => c.pinned === "end")
                          : [];
                        const startOffsets = computePinOffsets(
                          startCols,
                          columnWidths,
                        );
                        const endOffsets = computePinOffsets(
                          [...endCols].reverse(),
                          columnWidths,
                        );
                        const pinIdx =
                          col.pinned === "start"
                            ? startCols.findIndex((c) => c.id === col.id)
                            : col.pinned === "end"
                              ? endCols.findIndex((c) => c.id === col.id)
                              : -1;
                        const pinOffset =
                          col.pinned === "start" && pinIdx >= 0
                            ? startOffsets[pinIdx]
                            : col.pinned === "end" && pinIdx >= 0
                              ? endOffsets[endCols.length - 1 - pinIdx]
                              : undefined;
                        const sticky = config.enablePinnedColumns
                          ? pinStyle(
                              col.pinned ?? null,
                              pinOffset,
                              config.direction,
                              col.pinned === "start" &&
                                pinIdx === startCols.length - 1,
                              col.pinned === "end" && pinIdx === 0,
                            )
                          : undefined;
                        const widthStyle = width
                          ? { width: `${width}px`, minWidth: `${width}px` }
                          : undefined;
                        const headSticky = sticky
                          ? {
                              ...sticky,
                              zIndex: 3,
                              background: "hsl(var(--muted) / 0.4)",
                            }
                          : undefined;
                        return (
                          <TableHead
                            key={col.id}
                            style={{ ...widthStyle, ...headSticky }}
                            className={cn(
                              "relative group",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-end",
                            )}
                          >
                            {col.sortable ? (
                              <button
                                onClick={(e) => toggleSort(col.key, e.shiftKey)}
                                className="inline-flex items-center text-xs font-medium uppercase tracking-wider hover:text-foreground transition-colors"
                              >
                                {col.label}
                                {sortState ? (
                                  sortState.dir === "asc" ? (
                                    <ChevronUp className="h-3 w-3 ms-1" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 ms-1" />
                                  )
                                ) : (
                                  <ChevronsUpDown className="h-3 w-3 ms-1 opacity-40" />
                                )}
                              </button>
                            ) : (
                              <span className="text-xs font-medium uppercase tracking-wider">
                                {col.label}
                              </span>
                            )}
                            {config.enableColumnResize &&
                              col.resizable !== false && (
                                <div
                                  onMouseDown={(e) => startResize(col.id, e)}
                                  className="absolute end-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/40 group-hover:bg-border opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                    {config.enableColumnFilters && (
                      <TableRow className="bg-muted/20">
                        {renderHeaderLeading().map((cell, i) => (
                          // render placeholders; don't repeat content (checkbox should not show again)
                          <TableHead key={`fp-${i}`} className="w-9" />
                        ))}
                        {visibleCols.map((col) => (
                          <TableHead key={col.id} className="py-1.5 px-2">
                            {col.filterable ? (
                              <Input
                                value={columnFilters[col.key] || ""}
                                onChange={(e) => {
                                  setColumnFilters((p) => ({
                                    ...p,
                                    [col.key]: e.target.value,
                                  }));
                                  setPage(0);
                                }}
                                placeholder="Filter…"
                                className="h-7 text-[11px]"
                              />
                            ) : null}
                          </TableHead>
                        ))}
                      </TableRow>
                    )}
                  </TableHeader>
                  <DndTableBody
                    enabled={config.enableDnD}
                    rowIds={paged.map((r) => r.id as string)}
                    onMove={moveRow}
                    colSpan={
                      visibleCols.length +
                      (config.enableDnD ? 1 : 0) +
                      (config.enableRowSelection ? 1 : 0) +
                      (config.enableExpandableRows ? 1 : 0)
                    }
                  >
                    <>
                      {paged.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={
                              visibleCols.length +
                              (config.enableDnD ? 1 : 0) +
                              (config.enableRowSelection ? 1 : 0) +
                              (config.enableExpandableRows ? 1 : 0)
                            }
                            className="text-center py-12 text-muted-foreground text-xs"
                          >
                            No data to display
                          </TableCell>
                        </TableRow>
                      ) : grouped ? (
                        Array.from(grouped.entries()).map(
                          ([groupKey, groupRows]) => (
                            <GroupedSection
                              key={groupKey}
                              groupKey={groupKey}
                              groupRows={groupRows}
                              config={config}
                              visibleCols={visibleCols}
                              selected={selected}
                              onToggleSelect={toggleSelect}
                              density={config.density}
                              onCellUpdate={wrappedCellUpdate}
                              expanded={expanded}
                              onToggleExpand={toggleExpand}
                              columnWidths={columnWidths}
                              getRowActionButtons={getRowActionButtons}
                              onRowClick={
                                rowClickActive ? rowClickHandler : undefined
                              }
                              onOpenRowDialog={openRowDialog}
                            />
                          ),
                        )
                      ) : virtualizationActive ? (
                        (() => {
                          const items = rowVirtualizer.getVirtualItems();
                          const totalSize = rowVirtualizer.getTotalSize();
                          const paddingTop =
                            items.length > 0 ? items[0].start : 0;
                          const paddingBottom =
                            items.length > 0
                              ? totalSize - items[items.length - 1].end
                              : 0;
                          const colSpan =
                            visibleCols.length +
                            (config.enableDnD ? 1 : 0) +
                            (config.enableRowSelection ? 1 : 0) +
                            (config.enableExpandableRows ? 1 : 0);
                          return (
                            <>
                              {paddingTop > 0 && (
                                <TableRow style={{ height: `${paddingTop}px` }}>
                                  <TableCell
                                    colSpan={colSpan}
                                    className="p-0 border-0"
                                  />
                                </TableRow>
                              )}
                              {items.map((vi) => {
                                const row = paged[vi.index];
                                if (!row) return null;
                                return (
                                  <React.Fragment key={row.id as string}>
                                    <DndGhostRow index={vi.index} />
                                    <SortableRow
                                      row={row}
                                      rowIdx={vi.index}
                                      config={config}
                                      visibleCols={visibleCols}
                                      selected={selected}
                                      onToggleSelect={toggleSelect}
                                      density={config.density}
                                      onCellUpdate={wrappedCellUpdate}
                                      expanded={expanded}
                                      onToggleExpand={toggleExpand}
                                      columnWidths={columnWidths}
                                      getRowActionButtons={getRowActionButtons}
                                      onRowClick={
                                        rowClickActive
                                          ? rowClickHandler
                                          : undefined
                                      }
                                      onOpenRowDialog={openRowDialog}
                                    />
                                  </React.Fragment>
                                );
                              })}
                              <DndGhostRow index={paged.length} />
                              {paddingBottom > 0 && (
                                <TableRow
                                  style={{ height: `${paddingBottom}px` }}
                                >
                                  <TableCell
                                    colSpan={colSpan}
                                    className="p-0 border-0"
                                  />
                                </TableRow>
                              )}
                            </>
                          );
                        })()
                      ) : (
                        <>
                          {paged.map((row, rowIdx) => (
                            <React.Fragment key={row.id as string}>
                              <DndGhostRow index={rowIdx} />
                              <SortableRow
                                row={row}
                                rowIdx={rowIdx}
                                config={config}
                                visibleCols={visibleCols}
                                selected={selected}
                                onToggleSelect={toggleSelect}
                                density={config.density}
                                onCellUpdate={wrappedCellUpdate}
                                expanded={expanded}
                                onToggleExpand={toggleExpand}
                                columnWidths={columnWidths}
                                getRowActionButtons={getRowActionButtons}
                                onRowClick={
                                  rowClickActive ? rowClickHandler : undefined
                                }
                                onOpenRowDialog={openRowDialog}
                              />
                            </React.Fragment>
                          ))}
                          <DndGhostRow index={paged.length} />
                        </>
                      )}
                    </>
                  </DndTableBody>

                  {showFooter && (
                    <TableFooter>
                      <TableRow>
                        {config.enableDnD && <TableCell />}
                        {config.enableExpandableRows && <TableCell />}
                        {config.enableRowSelection && <TableCell />}
                        {visibleCols.map((col) => (
                          <TableCell
                            key={col.id}
                            className={cn(
                              "text-xs font-semibold",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-end",
                            )}
                          >
                            {col.aggregation && col.aggregation !== "none" ? (
                              <span>
                                <span className="text-muted-foreground font-normal me-1">
                                  {col.footerLabel || col.aggregation}:
                                </span>
                                {col.type === "currency"
                                  ? col.format || "$"
                                  : ""}
                                {aggregate(sorted, col.key, col.aggregation)}
                              </span>
                            ) : null}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </DndProvider>
            </div>
          )}
          {config.enablePagination &&
            !isLoading &&
            (() => {
              // Resolution order: config.renderPagination → DefaultPaginationBar.
              const ctx = {
                page,
                setPage,
                totalPages,
                pageSize: effectivePageSize,
                setPageSize,
                totalRows: sorted.length,
              };
              if (config.renderPagination) {
                const out = config.renderPagination(ctx);
                if (out !== undefined && out !== null) return out;
              }
              return <DefaultPaginationBar {...ctx} config={config} />;
            })()}
        </CardContent>
      </Card>

      {/* Row-detail Dialog (opened by row or cell click actions of type "dialog") */}
      <RowDetailDialog
        row={dialogRow}
        action={config.rowClickAction}
        onClose={() => setDialogRow(null)}
      />

      {/* JSON Configuration Panel — mirrors Form Builder UX */}
      <Card className="border-border">
        <Collapsible open={showJson} onOpenChange={setShowJson}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 pt-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">JSON Configuration</CardTitle>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {config.columns.length} columns · {data.length} rows
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  {showJson ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 px-4 pb-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Table config
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        JSON.stringify(config, null, 2),
                      );
                      toast({
                        title: "Copied",
                        description: "Config JSON copied to clipboard",
                      });
                    }}
                  >
                    <ExternalLink className="h-3 w-3" /> Copy
                  </Button>
                </div>
                <ScrollArea className="max-h-[320px]">
                  <pre className="text-[11px] font-mono p-3 rounded-lg bg-muted/50 border border-border overflow-x-auto leading-relaxed">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Sample data
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        JSON.stringify(data, null, 2),
                      );
                      toast({
                        title: "Copied",
                        description: "Sample data copied to clipboard",
                      });
                    }}
                  >
                    <ExternalLink className="h-3 w-3" /> Copy
                  </Button>
                </div>
                <ScrollArea className="max-h-[260px]">
                  <pre className="text-[11px] font-mono p-3 rounded-lg bg-muted/50 border border-border overflow-x-auto leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

/**
 * Row-detail dialog. When `action.dialogTemplate` is empty, renders a default
 * field grid (the previous behavior). When set, renders the user-provided
 * Tailwind/HTML template with mustache substitution + sandboxed JS.
 */
function RowDetailDialog({
  row,
  action,
  onClose,
}: {
  row: Record<string, unknown> | null;
  action: TableRowClickConfig | undefined;
  onClose: () => void;
}) {
  const widthClass = action?.dialogWidthClass ?? "max-w-2xl";
  const hasTemplate = !!action?.dialogTemplate?.trim();
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Plain derivations — the React Compiler memoizes these; manual useMemo here
  // could not be preserved (cross-memo `ctx` reference + optional-chain deps).
  const ctx = { row: row ?? {}, value: undefined as unknown };

  const renderedTitle = !action?.dialogTitle
    ? "Row details"
    : renderRowDialogText(action.dialogTitle, ctx);

  const renderedDescription = !action?.dialogDescription
    ? null
    : renderRowDialogText(action.dialogDescription, ctx);

  const renderedJsx =
    !row || !action?.renderDialog
      ? null
      : action.renderDialog({
          row: row as TableRowType,
          value: undefined,
          close: onClose,
        }) ?? null;

  const renderedHtml =
    !hasTemplate || !row || renderedJsx
      ? ""
      : renderRowDialogTemplate(action!.dialogTemplate!, ctx);

  // Run the user-supplied dialogJs once the template is in the DOM.
  useEffect(() => {
    if (!row) return;
    if (renderedJsx) return; // JSX path skips the sandboxed JS hook.
    if (!action?.dialogJs?.trim()) return;
    // Defer one tick so dangerouslySetInnerHTML has flushed.
    const id = window.requestAnimationFrame(() => {
      runCellJs(action.dialogJs!, {
        row,
        value: undefined,
        el: contentRef.current,
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [row, action?.dialogJs, renderedJsx]);

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(widthClass)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4 text-primary" />
            {renderedTitle}
          </DialogTitle>
          {renderedDescription !== null ? (
            <DialogDescription className="text-xs">
              {renderedDescription}
            </DialogDescription>
          ) : (
            <DialogDescription className="text-xs">
              Full record for{" "}
              <span className="font-mono">{String(row?.id ?? "—")}</span>
            </DialogDescription>
          )}
        </DialogHeader>
        {row && renderedJsx && (
          <ScrollArea className="max-h-[70vh] pe-2">
            <div ref={contentRef}>{renderedJsx}</div>
          </ScrollArea>
        )}
        {row && !renderedJsx && hasTemplate && (
          <ScrollArea className="max-h-[70vh] pe-2">
            <div
              ref={contentRef}
              // Sanitized in renderRowDialogTemplate (script tags + on*= handlers stripped).
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </ScrollArea>
        )}
        {row && !renderedJsx && !hasTemplate && (
          <ScrollArea className="max-h-[60vh] pe-2">
            <DefaultRowDialogBody row={row as TableRowType} />
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
