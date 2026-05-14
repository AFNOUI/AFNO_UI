import {
  X,
  Eye,
  Star,
  Plus,
  Minus,
  Trash2,
  Circle,
  Search,
  Loader2,
  Columns3,
  Download,
  RefreshCw,
  ChevronUp,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  ChevronsLeft,
  ChevronRight,
  GripVertical,
  ChevronsRight,
  ChevronsUpDown,
  MoreHorizontal,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useState, useCallback, useRef, useMemo, useEffect } from "react";

import {
  DndProvider,
  useDropZone,
  useDraggable,
  type DropResult,
} from "@/components/ui/dnd";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useTablePreview,
  aggregate as aggregateValues,
} from "@/table-builder/hooks/useTablePreview";
import { VariantJsonConfigPanel } from "@/components/shared/VariantJsonConfigPanel";
import {
  TableColumnConfig,
  TableBuilderConfig,
  TableRowClickConfig,
  ExpandableIconStyle,
  TableRow as TableRowType,
} from "@/table-builder/data/tableBuilderTemplates";
import { runCellJs } from "@/utils/cellJsRunner";
import { renderRowDialogTemplate, renderRowDialogText } from "@/utils/rowDialogTemplate";

interface TablePreviewProps {
  isLoading?: boolean;
  onCellInteract?: (
    row: Record<string, unknown>,
    key: string,
    oldValue: unknown,
    newValue: unknown,
  ) => Promise<void> | void;
  config: TableBuilderConfig;
  data: Record<string, unknown>[];
}

// ───── helpers ─────
function getInitials(name: string) {
  return String(name)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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

/**
 * Compute sticky cell style for a pinned column.
 *
 * `zBase` lets the caller pick the painting layer:
 *   - body cells:   10 + stackBias  (must paint above unpinned static siblings)
 *   - filter row:   15 + stackBias
 *   - header row:   20 + stackBias  (always wins so column labels stay readable)
 *
 * Notably, this function **does not set `background`** — that's the caller's job
 * because:
 *   - body cells need to *match the row's visual state* (stripe / hover / selected)
 *     so they don't look like a different "patch" sitting on top of the row;
 *   - header / filter cells use a different muted overlay color than body cells.
 *
 * `isolation: isolate` creates an explicit stacking context on every pinned cell.
 * That guarantees no descendant element (a `transform`, `will-change`, `opacity<1`,
 * a Radix portal trigger, etc.) can accidentally hoist itself above the next pinned
 * cell during horizontal scroll.
 *
 * `overflow: hidden` clips cell-internal overflow (long labels, wide badges) to
 * the cell's box, so nothing painted *inside* a pinned cell can extend past its
 * sticky boundary into a sibling pinned column.
 *
 * The edge separator (boxShadow) layers a 1-px inset border with a soft drop
 * shadow on the *outer* side. The inset hairline can disappear when `--card`
 * matches the page background, so the drop shadow guarantees the divider is
 * visible in every theme.
 */
function pinStyle(
  pinned: "start" | "end" | null | undefined,
  offset: number | undefined,
  direction: "ltr" | "rtl",
  isLastStart = false,
  isFirstEnd = false,
  zBase = 10,
): React.CSSProperties | undefined {
  if (!pinned || offset == null) return undefined;
  const startSide = direction === "rtl" ? "right" : "left";
  const endSide = direction === "rtl" ? "left" : "right";
  const style: React.CSSProperties = {
    position: "sticky",
    zIndex: zBase,
    overflow: "hidden",
    isolation: "isolate",
  };
  // Soft drop shadow on the scroll-facing side so the boundary is *always*
  // visible, even when `--border` blends into `--card` (common in dark themes).
  const startShadow =
    direction === "rtl"
      ? "inset 1px 0 0 0 hsl(var(--border)), -6px 0 8px -6px rgb(0 0 0 / 0.18)"
      : "inset -1px 0 0 0 hsl(var(--border)), 6px 0 8px -6px rgb(0 0 0 / 0.18)";
  const endShadow =
    direction === "rtl"
      ? "inset -1px 0 0 0 hsl(var(--border)), 6px 0 8px -6px rgb(0 0 0 / 0.18)"
      : "inset 1px 0 0 0 hsl(var(--border)), -6px 0 8px -6px rgb(0 0 0 / 0.18)";
  if (pinned === "start") {
    style[startSide as "left"] = offset;
    if (isLastStart) style.boxShadow = startShadow;
  } else {
    style[endSide as "right"] = offset;
    if (isFirstEnd) style.boxShadow = endShadow;
  }
  return style;
}

/**
 * Solid, fully opaque background that matches what an unpinned cell *visually*
 * shows for a given row state. Pinned cells must paint a solid background to
 * mask scrolling content beneath them, but they don't inherit the row's
 * stripe / hover / selected overlays — so they end up looking like a different
 * "patch" sitting on the row. `color-mix()` blends the table's `--card` token
 * with the row's overlay token in srgb space, producing a single solid color
 * that's pixel-identical to (card + overlay-at-X%) the unpinned cell shows.
 *
 * `color-mix(in srgb, ...)` is supported in every Chromium / WebKit / Firefox
 * release from 2023 onwards (Baseline 2024).
 */
function pinnedRowBackground(state: {
  selected: boolean;
  striped: boolean;
}): string {
  if (state.selected) {
    return "color-mix(in srgb, hsl(var(--card)), hsl(var(--primary)) 8%)";
  }
  if (state.striped) {
    return "color-mix(in srgb, hsl(var(--card)), hsl(var(--muted)) 40%)";
  }
  return "hsl(var(--card))";
}

/** Per-column width + sticky styles for header and filter rows (keeps filter cells aligned with pinned headers). */
function getPinnedColumnLayout(
  col: TableColumnConfig,
  visibleCols: TableColumnConfig[],
  config: TableBuilderConfig,
  columnWidths: Record<string, number>,
): {
  widthStyle: React.CSSProperties | undefined;
  headSticky: React.CSSProperties | undefined;
  filterSticky: React.CSSProperties | undefined;
} {
  const width = columnWidths[col.id] || col.width;
  const widthStyle = width
    ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }
    : undefined;
  if (!config.enablePinnedColumns) {
    return { widthStyle, headSticky: undefined, filterSticky: undefined };
  }
  const startCols = visibleCols.filter((c) => c.pinned === "start");
  const endCols = visibleCols.filter((c) => c.pinned === "end");
  const startOffsets = computePinOffsets(startCols, columnWidths);
  const endOffsets = computePinOffsets([...endCols].reverse(), columnWidths);
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
  /**
   * Sticky siblings share the same base z-index by default, so when the user
   * scrolls horizontally the *next* column (later in the DOM) paints on top of
   * a left-pinned column and header/filter text visually merge ("Trade #" +
   * "Symbol"). Bias z-index so edge-most pins win: for `start`, leftmost column
   * gets the highest value; for `end`, rightmost column wins. Re-used by the
   * body cell path in `SortableRow` via `computeStackBias` below.
   */
  const stackBias =
    col.pinned === "start" && pinIdx >= 0
      ? startCols.length - 1 - pinIdx
      : col.pinned === "end" && pinIdx >= 0
        ? pinIdx
        : 0;
  const headBase = pinStyle(
    col.pinned ?? null,
    pinOffset,
    config.direction,
    col.pinned === "start" && pinIdx === startCols.length - 1,
    col.pinned === "end" && pinIdx === 0,
    20 + stackBias,
  );
  const filterBase = pinStyle(
    col.pinned ?? null,
    pinOffset,
    config.direction,
    col.pinned === "start" && pinIdx === startCols.length - 1,
    col.pinned === "end" && pinIdx === 0,
    15 + stackBias,
  );
  if (!headBase || !filterBase) {
    return { widthStyle, headSticky: undefined, filterSticky: undefined };
  }
  // Header + filter sit on top of the table chrome (also `--card`) and need
  // *opaque* backgrounds so scrolling content can't smudge through them at
  // scrollLeft > 0. We blend `--card` with the same muted token the unpinned
  // header / filter rows use, so the pinned cell looks identical to its
  // unpinned siblings while still fully masking what's behind it.
  const headSticky: React.CSSProperties = {
    ...headBase,
    background: "color-mix(in srgb, hsl(var(--card)), hsl(var(--muted)) 40%)",
  };
  const filterSticky: React.CSSProperties = {
    ...filterBase,
    background: "color-mix(in srgb, hsl(var(--card)), hsl(var(--muted)) 25%)",
  };
  return { widthStyle, headSticky, filterSticky };
}

/**
 * Body cells need the same stack-bias logic as the header so multiple pinned
 * columns layer correctly during horizontal scroll. Extracted so `SortableRow`
 * doesn't duplicate the offsets/bias arithmetic.
 */
function computeStackBias(
  col: TableColumnConfig,
  startCols: TableColumnConfig[],
  endCols: TableColumnConfig[],
): number {
  if (col.pinned === "start") {
    const idx = startCols.findIndex((c) => c.id === col.id);
    return idx >= 0 ? startCols.length - 1 - idx : 0;
  }
  if (col.pinned === "end") {
    const idx = endCols.findIndex((c) => c.id === col.id);
    return idx >= 0 ? idx : 0;
  }
  return 0;
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

// ───── cell renderer ─────
interface RowActionButton {
  id: string;
  title: string;
  onClick: () => void;
}
function CellRenderer({
  col,
  row,
  val,
  density,
  inlineEdit,
  onUpdate,
  rowActionButtons,
  onCellClick,
}: {
  col: TableColumnConfig;
  row: Record<string, unknown>;
  val: unknown;
  density: "comfortable" | "compact" | "spacious";
  inlineEdit: boolean;
  onUpdate: (rowId: string, key: string, value: unknown) => void;
  rowActionButtons?: RowActionButton[];
  onCellClick?: () => void;
}) {
  const sizeClass =
    density === "compact"
      ? "text-[11px]"
      : density === "spacious"
        ? "text-sm"
        : "text-xs";
  // Solid underline using the current text colour — guarantees visibility on
  // both light and dark themes regardless of the cell type.
  const underlineClass = col.underline
    ? "underline underline-offset-4 decoration-solid decoration-current"
    : "";
  const clickable = !!onCellClick;
  const interactiveClass = clickable
    ? "cursor-pointer hover:text-primary hover:decoration-primary transition-colors"
    : "";
  const stop = (e: React.MouseEvent) => {
    if (clickable) e.stopPropagation();
  };
  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    e.stopPropagation();
    onCellClick?.();
  };
  void stop; // currently unused — kept for future per-control wiring

  switch (col.type) {
    case "badge":
      return (
        <Badge
          variant={
            (col.badgeVariants?.[String(val)] || "secondary") as
              | "default"
              | "secondary"
              | "outline"
              | "destructive"
          }
          className={cn(sizeClass, underlineClass, interactiveClass)}
          onClick={handleClick}
        >
          {String(val)}
        </Badge>
      );

    case "progress":
      return (
        <div className="flex items-center gap-2 min-w-[80px]">
          <Progress value={Number(val) || 0} className="h-1.5 flex-1" />
          <span
            className={cn(sizeClass, "text-muted-foreground w-9 tabular-nums")}
          >
            {Number(val) || 0}%
          </span>
        </div>
      );

    case "currency":
      return (
        <span
          className={cn(
            sizeClass,
            "font-medium tabular-nums",
            underlineClass,
            interactiveClass,
          )}
          onClick={handleClick}
        >
          {col.format || "$"}
          {Number(val).toLocaleString()}
        </span>
      );

    case "date":
      return (
        <span
          className={cn(
            sizeClass,
            "text-muted-foreground tabular-nums",
            underlineClass,
            interactiveClass,
          )}
          onClick={handleClick}
        >
          {String(val ?? "—")}
        </span>
      );

    case "email":
      return clickable ? (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            sizeClass,
            "text-primary hover:underline truncate block max-w-[180px] text-start",
            underlineClass,
          )}
        >
          {String(val ?? "—")}
        </button>
      ) : (
        <a
          href={`mailto:${val}`}
          data-noclick="true"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            sizeClass,
            "text-primary hover:underline truncate block max-w-[180px]",
            underlineClass,
          )}
        >
          {String(val ?? "—")}
        </a>
      );

    case "link":
      // When the column has a click action, render a button that routes
      // through the cell-click handler (which already stopPropagation's so the
      // row-click dialog never fires). Otherwise render a real anchor — but
      // mark it `data-noclick` and stop propagation so opening a link never
      // also triggers the row-click action.
      return clickable ? (
        <button
          type="button"
          data-noclick="true"
          onClick={handleClick}
          className={cn(
            sizeClass,
            "text-primary hover:underline truncate block max-w-[220px] text-start",
            underlineClass,
          )}
        >
          {String(val)}
        </button>
      ) : (
        <a
          href={String(val)}
          target="_blank"
          rel="noreferrer"
          data-noclick="true"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            sizeClass,
            "text-primary hover:underline",
            underlineClass,
          )}
        >
          {String(val)}
        </a>
      );

    case "boolean":
      return (
        <Badge
          variant={val ? "default" : "secondary"}
          className={cn(sizeClass)}
        >
          {val ? "Yes" : "No"}
        </Badge>
      );

    case "switch":
      return (
        <Switch
          data-noclick="true"
          checked={Boolean(val)}
          onCheckedChange={(v) => onUpdate(row.id as string, col.key, v)}
          onClick={(e) => e.stopPropagation()}
          className="scale-90"
          disabled={!inlineEdit}
        />
      );

    case "radio":
      return (
        <RadioGroup
          data-noclick="true"
          value={String(val ?? "")}
          onValueChange={(v) => onUpdate(row.id as string, col.key, v)}
          className="flex gap-2"
          onClick={(e) => e.stopPropagation()}
          disabled={!inlineEdit}
        >
          {(col.options || []).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1 text-xs cursor-pointer"
            >
              <RadioGroupItem value={opt.value} className="h-3 w-3" />
              <span>{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
      );

    case "dropdown":
      if (!inlineEdit) {
        return (
          <Badge variant="outline" className={cn(sizeClass)}>
            {String(val ?? "—")}
          </Badge>
        );
      }
      return (
        <Select
          value={String(val ?? "")}
          onValueChange={(v) => onUpdate(row.id as string, col.key, v)}
        >
          <SelectTrigger
            data-noclick="true"
            className="h-7 text-xs w-32 border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(col.options || []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "rating": {
      const n = Number(val) || 0;
      return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < n
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
      );
    }

    case "status-dot": {
      const opt = col.options?.find((o) => o.value === val);
      const color = opt?.color || "hsl(var(--muted-foreground))";
      return (
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className={cn(sizeClass, "font-medium")}>
            {opt?.label || String(val ?? "—")}
          </span>
        </div>
      );
    }

    case "tags": {
      const tags = Array.isArray(val) ? val : [];
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((t, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {String(t)}
            </Badge>
          ))}
        </div>
      );
    }

    case "avatar":
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(String(val))}
            </AvatarFallback>
          </Avatar>
          <span className={cn(sizeClass, "font-medium truncate")}>
            {String(val ?? "—")}
          </span>
        </div>
      );

    case "avatar-image":
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={String(row.avatarUrl || "")} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(String(val))}
            </AvatarFallback>
          </Avatar>
          <span className={cn(sizeClass, "font-medium truncate")}>
            {String(val ?? "—")}
          </span>
        </div>
      );

    case "actions":
      return (
        <div
          data-noclick="true"
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {rowActionButtons?.map((b) => (
            <Button
              key={b.id}
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={b.title}
              onClick={(e) => {
                e.stopPropagation();
                b.onClick();
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );

    case "number":
      return (
        <span
          className={cn(
            sizeClass,
            "tabular-nums",
            underlineClass,
            interactiveClass,
          )}
          onClick={handleClick}
        >
          {val == null ? "—" : Number(val).toLocaleString()}
        </span>
      );

    default:
      return (
        <span
          className={cn(
            sizeClass,
            "truncate block",
            underlineClass,
            interactiveClass,
          )}
          onClick={handleClick}
        >
          {String(val ?? "—")}
        </span>
      );
  }
}

// ───── Expandable row content (multiple layouts) ─────
function ExpandedContent({
  row,
  layout,
}: {
  row: Record<string, unknown>;
  layout: TableBuilderConfig["expandableLayout"];
}) {
  const entries = Object.entries(row).filter(
    ([k]) => k !== "id" && !["milestones", "assets"].includes(k),
  );

  switch (layout) {
    case "card":
      return (
        <div className="px-4 py-4 bg-gradient-to-br from-muted/40 to-muted/20">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Full Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {entries.map(([k, v]) => (
                  <div
                    key={k}
                    className="space-y-0.5 p-2.5 rounded-md bg-muted/30 border border-border/40"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {k}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {String(v)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case "grid":
      return (
        <div className="px-4 py-4 bg-muted/20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {entries.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-col items-center justify-center text-center p-3 rounded-lg bg-background border border-border/60"
              >
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  {k}
                </div>
                <div className="text-sm font-bold tabular-nums truncate w-full">
                  {String(v)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "tabs":
      return (
        <div className="px-4 py-3 bg-muted/20">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="h-8">
              <TabsTrigger value="details" className="text-xs h-6 px-3">
                Details
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs h-6 px-3">
                Raw JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-2">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 px-2">
                {entries.map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">
                      {k}:
                    </span>
                    <span className="font-medium truncate ms-2">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="raw" className="mt-2">
              <pre className="text-[10px] bg-background border border-border rounded p-2 overflow-x-auto">
                {JSON.stringify(row, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      );

    case "timeline": {
      const milestones =
        (row.milestones as Array<{
          date: string;
          label: string;
          done: boolean;
        }>) || [];
      return (
        <div className="px-6 py-4 bg-muted/20">
          <p className="text-xs font-semibold text-foreground mb-3">
            Milestones
          </p>
          <div className="relative ms-2">
            <div className="absolute start-1.5 top-1 bottom-1 w-px bg-border" />
            <div className="space-y-3">
              {milestones.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No milestones available.
                </p>
              ) : (
                milestones.map((m, i) => (
                  <div key={i} className="relative flex items-start gap-3 ps-5">
                    <div className="absolute start-0 top-0.5">
                      {m.done ? (
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {m.date}
                      </div>
                    </div>
                    {m.done && (
                      <Badge variant="secondary" className="text-[9px]">
                        Done
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    case "gallery": {
      const assets = (row.assets as string[]) || [];
      return (
        <div className="px-4 py-4 bg-muted/20">
          <p className="text-xs font-semibold text-foreground mb-3">
            Asset Preview ({assets.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {assets.map((cls, i) => (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm",
                  cls,
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "stats": {
      // pull a few KPI fields if present
      const kpiKeys = ["calls", "demos", "win", "deals", "revenue", "quota"];
      const kpis = kpiKeys
        .filter((k) => row[k] !== undefined)
        .map((k) => ({ key: k, value: row[k] }));
      return (
        <div className="px-4 py-4 bg-muted/20">
          <p className="text-xs font-semibold text-foreground mb-3">
            Performance Breakdown
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {kpis.length === 0 ? (
              <p className="text-xs text-muted-foreground col-span-full">
                No KPI fields available.
              </p>
            ) : (
              kpis.map(({ key, value }) => (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-background border border-border/60"
                >
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {key}
                  </div>
                  <div className="text-lg font-bold tabular-nums mt-0.5">
                    {String(value)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    case "details":
    default:
      return (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-foreground mb-1">
            Row Details
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
            {entries.map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-muted-foreground capitalize">{k}:</span>
                <span className="font-medium truncate ms-2">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

// ───── sortable row ─────
function SortableRow({
  row,
  rowIdx,
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
  row: Record<string, unknown>;
  rowIdx: number;
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
  // Drag handle wired to the custom Pointer DnD library. The row itself is
  // still the visual drag source, but only the GripVertical button is the
  // pointer trigger — clicking elsewhere on the row keeps row-click intact.
  const { dragProps, isDragging } = useDraggable<{ rowId: string }>({
    id: row.id as string,
    data: useMemo(() => ({ rowId: row.id as string }), [row.id]),
    disabled: !config.enableDnD,
    preview: () => (
      <div className="rounded border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-lg">
        Moving row…
      </div>
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
    <TableCell key="dnd" className="w-9 px-1 align-middle">
      <button
        type="button"
        {...dragProps}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground flex items-center justify-center h-7 w-7 rounded hover:bg-muted mx-auto"
        aria-label="Drag to reorder row"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
    </TableCell>
  );

  const expandCell = config.enableExpandableRows && (
    <TableCell key="exp" className="w-9 px-1 align-middle">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 mx-auto flex"
        onClick={() => onToggleExpand(row.id as string)}
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
          isDragging && "opacity-50",
          onRowClick && "cursor-pointer",
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
          const stackBias = pinEnabled ? computeStackBias(col, startCols, endCols) : 0;
          const isPinnedCell = pinEnabled && !!col.pinned;
          const sticky = isPinnedCell
            ? pinStyle(
                col.pinned ?? null,
                pinOffset,
                config.direction,
                col.pinned === "start" && pinIdx === startCols.length - 1,
                col.pinned === "end" && pinIdx === 0,
                10 + stackBias,
              )
            : undefined;
          const widthStyle = width
            ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }
            : undefined;
          // Pinned cells must paint a solid background to mask scrolling
          // content beneath them — but they don't inherit the row's stripe /
          // hover / selected overlays, so we synthesise a matching opaque
          // colour via `color-mix` (see `pinnedRowBackground`). Unpinned
          // cells stay transparent and inherit the row classes as before.
          const pinnedBg = isPinnedCell
            ? pinnedRowBackground({
                selected: isSelected,
                striped: !!config.enableStriped && rowIdx % 2 === 1,
              })
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
              style={{
                ...widthStyle,
                ...sticky,
                ...(pinnedBg ? { background: pinnedBg } : {}),
              }}
              className={cn(
                // `overflow-hidden` on every body cell (not just pinned) is the
                // belt-and-braces fix for bleed-through: a wide / rounded child
                // (badge, long text, anti-aliased pill edge) painted by an
                // unpinned cell can no longer extend past its own column box
                // into a sticky neighbour's territory.
                "py-2 align-middle overflow-hidden",
                col.align === "center" && "text-center",
                col.align === "right" && "text-end",
              )}
            >
              <CellRenderer
                col={col}
                row={row}
                val={val}
                density={density}
                inlineEdit={config.enableInlineEdit}
                onUpdate={onCellUpdate}
                rowActionButtons={getRowActionButtons?.(row, col)}
                onCellClick={cellAction ?? undefined}
              />
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
            <ExpandedContent
              row={row}
              layout={config.expandableLayout || "details"}
            />
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
function PaginationBar({
  page,
  setPage,
  totalPages,
  pageSize,
  setPageSize,
  sortedLength,
  config,
}: {
  page: number;
  setPage: (n: number | ((p: number) => number)) => void;
  totalPages: number;
  pageSize: number;
  setPageSize: (n: number) => void;
  sortedLength: number;
  config: TableBuilderConfig;
}) {
  const layout = config.paginationLayout || "full";
  const showInfo = config.showPageInfo !== false;
  const showFirstLast = config.showFirstLastButtons !== false;
  const showSizeSelector = config.showPageSizeSelector === true;
  const sizeOptions =
    config.pageSizeOptions && config.pageSizeOptions.length
      ? config.pageSizeOptions
      : [5, 10, 20, 50];

  const renderInfo = showInfo && (
    <p className="text-xs text-muted-foreground">
      Showing {sortedLength > 0 ? page * pageSize + 1 : 0}–
      {Math.min((page + 1) * pageSize, sortedLength)} of {sortedLength}
    </p>
  );

  const renderSizeSelector = showSizeSelector && (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground hidden sm:inline">
        Rows:
      </span>
      <Select
        value={String(pageSize)}
        onValueChange={(v) => {
          setPageSize(Number(v));
          setPage(0);
        }}
      >
        <SelectTrigger className="h-7 text-xs w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizeOptions.map((n) => (
            <SelectItem key={n} value={String(n)} className="text-xs">
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (layout === "infoOnly") {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border flex-wrap">
        {renderInfo}
        {renderSizeSelector}
      </div>
    );
  }

  if (layout === "minimal") {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border flex-wrap">
        {renderInfo}
        <div className="flex items-center gap-2">
          {renderSizeSelector}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-3 w-3 rtl:rotate-180" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    );
  }

  if (layout === "numbered") {
    // Show up to 5 page numbers with ellipsis
    const pages: (number | "...")[] = [];
    const maxBtns = 5;
    if (totalPages <= maxBtns) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      if (start > 1) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push("...");
      pages.push(totalPages - 1);
    }
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border flex-wrap">
        {renderInfo}
        <div className="flex items-center gap-1.5 flex-wrap">
          {renderSizeSelector}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
            {pages.map((p, i) =>
              p === "..." ? (
                <span
                  key={`e-${i}`}
                  className="px-1.5 text-xs text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className="h-7 w-7 text-xs tabular-nums"
                  onClick={() => setPage(p)}
                >
                  {p + 1}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border flex-wrap">
        {renderInfo}
        <div className="flex items-center gap-2">
          {renderSizeSelector}
          <span className="text-xs tabular-nums">
            {page + 1}/{totalPages}
          </span>
          <div className="flex">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-e-none"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-s-none -ms-px"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // FULL (default)
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border flex-wrap">
      <div className="flex items-center gap-3 flex-wrap">
        {renderInfo}
        {renderSizeSelector}
      </div>
      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page === 0}
            onClick={() => setPage(0)}
          >
            <ChevronsLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
        <span className="text-xs px-2 tabular-nums">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
          >
            <ChevronsRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Button>
        )}
      </div>
    </div>
  );
}

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
function DndTableBody({
  enabled,
  rowIds,
  onMove,
  children,
}: {
  enabled: boolean;
  rowIds: string[];
  onMove: (rowId: string, toIndex: number) => void;
  children: React.ReactNode;
}) {
  const handleDrop = useCallback(
    (result: DropResult<{ rowId: string }>) => {
      onMove(result.item.data.rowId, result.index);
    },
    [onMove],
  );
  const { zoneProps } = useDropZone<Record<string, unknown>, { rowId: string }>(
    {
      id: "table-rows",
      data: useMemo(() => ({ count: rowIds.length }), [rowIds.length]),
      disabled: !enabled,
      axis: "y",
      onDrop: handleDrop,
    },
  );
  // Spread `zoneProps` so the callback ref + data attrs land on the underlying
  // tbody DOM node. (Spread keeps React's ref-attachment in commit phase, which
  // sidesteps the `react-hooks/refs` lint rule that flags property-by-property
  // reads of zoneProps during render.)
  return (
    <TableBody
      {...(zoneProps as React.HTMLAttributes<HTMLTableSectionElement> & {
        ref: React.Ref<HTMLTableSectionElement>;
      })}
    >
      {children}
    </TableBody>
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
    rows,
    page,
    sorts,
    paged,
    sorted,
    search,
    grouped,
    expanded,
    pageSize,
    selected,
    hiddenCols,
    totalPages,
    visibleCols,
    columnWidths,
    columnFilters,
    setPage,
    moveRow,
    setSorts,
    setSearch,
    toggleSort,
    setPageSize,
    setSelected,
    startResize,
    toggleSelect,
    toggleExpand,
    toggleSelectAll,
    setColumnFilters,
    handleCellUpdate,
    toggleColumnVisibility,
  } = useTablePreview<TableRowType>({
    config,
    data: data as TableRowType[],
  });

  const sortStateFor = (key: string) => sorts.find((s) => s.key === key);

  const effectivePageSize = pageSize;

  // ─── Row-action API wiring ───
  // When a column has a matching apiConfig.rowActions[*].columnKey, fire the
  // configured fetch on cell update. The local state has already been
  // optimistically updated by handleCellUpdate; on failure we rollback to the
  // previous value and surface a toast.
  const wrappedCellUpdate = useCallback(
    (rowId: string, key: string, value: unknown) => {
      const prev = rows.find((r) => r.id === rowId);
      const prevValue = prev ? prev[key] : undefined;
      handleCellUpdate(rowId, key, value);

      // Fire user-supplied dispatcher (from useRowInteractions) — typed per-column
      // handlers run here. Errors are surfaced via toast but do not rollback;
      // rollback is owned by apiConfig.rowActions below.
      if (onCellInteract && prev && prevValue !== value) {
        try {
          const result = onCellInteract(prev, key, prevValue, value);
          if (result && typeof (result as Promise<void>).catch === "function") {
            (result as Promise<void>).catch((e: unknown) => {
              toast({
                title: "Interaction handler failed",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
              });
            });
          }
        } catch (e) {
          toast({
            title: "Interaction handler failed",
            description: e instanceof Error ? e.message : "Unknown error",
            variant: "destructive",
          });
        }
      }

      const action = config.apiConfig?.rowActions?.find(
        (a) => a.columnKey === key,
      );
      const baseUrl = config.apiConfig?.baseUrl;
      if (!action || !baseUrl) return;

      const row = prev as Record<string, unknown> | undefined;
      if (!row) return;

      // Token-replace :id and :{field}
      const interpolatedPath = action.path
        .replace(/:id\b/g, String(rowId))
        .replace(/:(\w+)/g, (_, k: string) => String(row[k] ?? ""));

      const search =
        action.query && Object.keys(action.query).length > 0
          ? "?" + new URLSearchParams(action.query).toString()
          : "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(config.apiConfig?.headers ?? {}),
      };

      let body: string | undefined;
      if (action.method !== "GET" && action.method !== "DELETE") {
        if (action.body) {
          body = action.body
            .replace(/{{value}}/g, JSON.stringify(value))
            .replace(/{{rowId}}/g, JSON.stringify(rowId))
            .replace(/{{row\.(\w+)}}/g, (_, k: string) =>
              JSON.stringify(row[k]),
            );
        } else {
          body = JSON.stringify({ [key]: value });
        }
      }

      void (async () => {
        try {
          const res = await fetch(`${baseUrl}${interpolatedPath}${search}`, {
            method: action.method,
            headers,
            body,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (e) {
          if (action.optimistic !== false) {
            handleCellUpdate(rowId, key, prevValue); // rollback
          }
          toast({
            title: "Update failed",
            description: `${action.method} ${interpolatedPath} — ${e instanceof Error ? e.message : "network error"}`,
            variant: "destructive",
          });
        }
      })();
    },
    [config.apiConfig, handleCellUpdate, rows, onCellInteract],
  );

  // Build refresh-style buttons for any `trigger:"button"` row-actions whose
  // columnKey targets the same `actions` column. Clicking fires the configured
  // POST/PUT/PATCH with the body template — closing the loop on user-action
  // columns beyond switch/dropdown/radio.
  const getRowActionButtons = useCallback(
    (
      row: Record<string, unknown>,
      col: TableColumnConfig,
    ): RowActionButton[] => {
      if (col.type !== "actions") return [];
      const actions =
        config.apiConfig?.rowActions?.filter(
          (a) => a.trigger === "button" && a.columnKey === col.key,
        ) ?? [];
      const baseUrl = config.apiConfig?.baseUrl;
      if (actions.length === 0 || !baseUrl) return [];
      return actions.map((action) => ({
        id: action.id,
        title: `${action.method} ${action.path}`,
        onClick: () => {
          const path = action.path
            .replace(/:id\b/g, String(row.id))
            .replace(/:(\w+)/g, (_, k: string) => String(row[k] ?? ""));
          const qs =
            action.query && Object.keys(action.query).length > 0
              ? "?" + new URLSearchParams(action.query).toString()
              : "";
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(config.apiConfig?.headers ?? {}),
          };
          const body =
            action.method === "GET" || action.method === "DELETE"
              ? undefined
              : action.body
                ? action.body
                    .replace(/{{rowId}}/g, JSON.stringify(row.id))
                    .replace(/{{row\.(\w+)}}/g, (_, k: string) =>
                      JSON.stringify(row[k]),
                    )
                : JSON.stringify({ id: row.id });
          void (async () => {
            try {
              const res = await fetch(`${baseUrl}${path}${qs}`, {
                method: action.method,
                headers,
                body,
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              toast({
                title: "Action complete",
                description: `${action.method} ${path}`,
              });
            } catch (e) {
              toast({
                title: "Action failed",
                description: `${action.method} ${path} — ${e instanceof Error ? e.message : "network error"}`,
                variant: "destructive",
              });
            }
          })();
        },
      }));
    },
    [config.apiConfig],
  );

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
                        const { widthStyle, headSticky } = getPinnedColumnLayout(
                          col,
                          visibleCols,
                          config,
                          columnWidths,
                        );
                        return (
                          <TableHead
                            key={col.id}
                            style={{ ...widthStyle, ...headSticky }}
                            className={cn(
                              "relative group min-w-0",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-end",
                            )}
                          >
                            {col.sortable ? (
                              <button
                                type="button"
                                onClick={(e) => toggleSort(col.key, e.shiftKey)}
                                className="inline-flex max-w-full min-w-0 w-full items-center gap-0 text-xs font-medium uppercase tracking-wider hover:text-foreground transition-colors"
                              >
                                <span className="min-w-0 flex-1 truncate text-start">
                                  {col.label}
                                </span>
                                {sortState ? (
                                  sortState.dir === "asc" ? (
                                    <ChevronUp className="h-3 w-3 shrink-0 ms-1" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 shrink-0 ms-1" />
                                  )
                                ) : (
                                  <ChevronsUpDown className="h-3 w-3 ms-1 shrink-0 opacity-40" />
                                )}
                              </button>
                            ) : (
                              <span className="block max-w-full min-w-0 truncate text-xs font-medium uppercase tracking-wider">
                                {col.label}
                              </span>
                            )}
                            {config.enableColumnResize &&
                              col.resizable !== false && (
                                <div
                                  onMouseDown={(e) => startResize(col.id, e)}
                                  className="absolute end-0 top-0 z-20 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/40 group-hover:bg-border opacity-0 group-hover:opacity-100 transition-opacity"
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
                        {visibleCols.map((col) => {
                          const { widthStyle, filterSticky } =
                            getPinnedColumnLayout(
                              col,
                              visibleCols,
                              config,
                              columnWidths,
                            );
                          return (
                            <TableHead
                              key={col.id}
                              className="min-w-0 overflow-hidden py-1.5 px-2 align-middle"
                              style={{ ...widthStyle, ...filterSticky }}
                            >
                              {col.filterable ? (
                                <div className="min-w-0 max-w-full overflow-x-hidden">
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
                                    className="h-7 w-full min-w-0 max-w-full overflow-x-hidden text-[11px]"
                                  />
                                </div>
                              ) : null}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    )}
                  </TableHeader>
                  <DndTableBody
                    enabled={config.enableDnD}
                    rowIds={paged.map((r) => r.id as string)}
                    onMove={moveRow}
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
                                  <SortableRow
                                    key={row.id as string}
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
                                );
                              })}
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
                        paged.map((row, rowIdx) => (
                          <SortableRow
                            key={row.id as string}
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
                        ))
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
          {config.enablePagination && !isLoading && (
            <PaginationBar
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              pageSize={effectivePageSize}
              setPageSize={setPageSize}
              sortedLength={sorted.length}
              config={config}
            />
          )}
        </CardContent>
      </Card>

      {/* Row-detail Dialog (opened by row or cell click actions of type "dialog") */}
      <RowDetailDialog
        row={dialogRow}
        action={config.rowClickAction}
        onClose={() => setDialogRow(null)}
      />

      <VariantJsonConfigPanel
        open={showJson}
        onOpenChange={setShowJson}
        titleMeta={`${config.columns.length} columns · ${data.length} rows`}
        blocks={[
          {
            label: "Table config",
            value: config,
            maxHeightClass: "max-h-[320px]",
            copySuccessDescription: "Config JSON copied to clipboard",
          },
          {
            label: "Sample data",
            value: data,
            maxHeightClass: "max-h-[260px]",
            copySuccessDescription: "Sample data copied to clipboard",
          },
        ]}
      />
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
  onClose: () => void;
  row: Record<string, unknown> | null;
  action: TableRowClickConfig | undefined;
}) {
  const widthClass = action?.dialogWidthClass ?? "max-w-2xl";
  // Extract optional-chain values into stable locals so the React Compiler's
  // dependency inference matches our manual useMemo/useEffect deps exactly.
  const dialogTitle = action?.dialogTitle;
  const dialogDescription = action?.dialogDescription;
  const dialogTemplate = action?.dialogTemplate;
  const dialogJs = action?.dialogJs;
  const hasTemplate = !!dialogTemplate?.trim();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const ctx = useMemo(
    () => ({ row: row ?? {}, value: undefined as unknown }),
    [row],
  );

  const renderedTitle = useMemo(() => {
    if (!dialogTitle) return "Row details";
    return renderRowDialogText(dialogTitle, ctx);
  }, [dialogTitle, ctx]);

  const renderedDescription = useMemo(() => {
    if (!dialogDescription) return null;
    return renderRowDialogText(dialogDescription, ctx);
  }, [dialogDescription, ctx]);

  const renderedHtml = useMemo(() => {
    if (!hasTemplate || !row || !dialogTemplate) return "";
    return renderRowDialogTemplate(dialogTemplate, ctx);
  }, [hasTemplate, row, dialogTemplate, ctx]);

  // Run the user-supplied dialogJs once the template is in the DOM.
  useEffect(() => {
    if (!row) return;
    const trimmed = dialogJs?.trim();
    if (!trimmed) return;
    // Defer one tick so dangerouslySetInnerHTML has flushed.
    const id = window.requestAnimationFrame(() => {
      runCellJs(trimmed, {
        row,
        value: undefined,
        el: contentRef.current,
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [row, dialogJs]);

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
        {row && hasTemplate && (
          <ScrollArea className="max-h-[70vh] pe-2">
            <div
              ref={contentRef}
              // Sanitized in renderRowDialogTemplate (script tags + on*= handlers stripped).
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </ScrollArea>
        )}
        {row && !hasTemplate && (
          <ScrollArea className="max-h-[60vh] pe-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(row).map(([k, v]) => (
                <div
                  key={k}
                  className="p-2.5 rounded-md bg-muted/40 border border-border/50"
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {k}
                  </div>
                  <div className="text-xs font-medium break-words mt-0.5">
                    {typeof v === "object"
                      ? JSON.stringify(v)
                      : String(v ?? "—")}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
