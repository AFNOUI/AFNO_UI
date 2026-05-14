import {
  Plus,
  Trash2,
  Columns3,
  Settings2,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import {
  DndProvider,
  useDropZone,
  useDraggable,
  DropIndicator,
  type DropResult,
} from "@/components/ui/dnd";
import { cn } from "@/lib/utils";
import {
  TableColumnType,
  AggregationType,
  TableColumnConfig,
  TableBuilderConfig,
} from "@/table-builder/data/tableBuilderTemplates";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLUMN_TYPES: TableColumnType[] = [
  "tags",
  "text",
  "link",
  "date",
  "email",
  "badge",
  "radio",
  "number",
  "switch",
  "avatar",
  "rating",
  "boolean",
  "actions",
  "currency",
  "progress",
  "dropdown",
  "status-dot",
  "avatar-image",
];

const AGGREGATIONS: AggregationType[] = [
  "none",
  "sum",
  "avg",
  "min",
  "max",
  "count",
];

interface DraggableColData extends Record<string, unknown> {
  colId: string;
}

function SortableColumnCard({
  col,
  index,
  onUpdate,
  onRemove,
}: {
  index: number;
  col: TableColumnConfig;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, updates: Partial<TableColumnConfig>) => void;
}) {
  const [open, setOpen] = useState(false);
  const dragData = useMemo<DraggableColData>(
    () => ({ colId: col.id }),
    [col.id],
  );
  const { dragProps, isDragging } = useDraggable<DraggableColData>({
    id: col.id,
    data: dragData,
    preview: () => (
      <div className="w-[300px] rounded-lg border border-primary/40 bg-background p-2 shadow-lg">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{col.label || col.key}</span>
          <span className="ms-auto text-[10px] text-muted-foreground">
            {col.type}
          </span>
        </div>
      </div>
    ),
  });

  const hasOptions =
    col.type === "dropdown" ||
    col.type === "radio" ||
    col.type === "status-dot";

  return (
    <div
      className={cn(
        "border border-border rounded-lg bg-background transition-shadow",
        isDragging && "opacity-30",
      )}
    >
      <div className="flex items-center gap-1.5 p-2">
        <button
          {...dragProps}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1 rounded hover:bg-muted shrink-0"
          aria-label="Drag to reorder column"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <Input
          value={col.label}
          onChange={(e) => onUpdate(index, { label: e.target.value })}
          className="h-7 text-xs flex-1 min-w-0"
          placeholder="Label"
        />
        <Select
          value={col.type}
          onValueChange={(v) => onUpdate(index, { type: v as TableColumnType })}
        >
          <SelectTrigger className="h-7 text-xs w-[88px] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLUMN_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="text-xs">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive shrink-0"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-2.5 pb-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <span className="flex items-center gap-1">
              <Settings2 className="h-2.5 w-2.5" /> Advanced
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2.5 pb-2.5 space-y-2 border-t border-border/50 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Key</Label>
              <Input
                value={col.key}
                onChange={(e) => onUpdate(index, { key: e.target.value })}
                className="h-6 text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Align</Label>
              <Select
                value={col.align || "left"}
                onValueChange={(v) =>
                  onUpdate(index, { align: v as "left" | "center" | "right" })
                }
              >
                <SelectTrigger className="h-6 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left" className="text-xs">
                    Left
                  </SelectItem>
                  <SelectItem value="center" className="text-xs">
                    Center
                  </SelectItem>
                  <SelectItem value="right" className="text-xs">
                    Right
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                Width (px)
              </Label>
              <Input
                type="number"
                value={col.width || ""}
                onChange={(e) =>
                  onUpdate(index, {
                    width: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-6 text-[11px]"
                placeholder="Auto"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                Aggregation
              </Label>
              <Select
                value={col.aggregation || "none"}
                onValueChange={(v) =>
                  onUpdate(index, { aggregation: v as AggregationType })
                }
              >
                <SelectTrigger className="h-6 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGGREGATIONS.map((a) => (
                    <SelectItem key={a} value={a} className="text-xs">
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">
              Pin Column
            </Label>
            <Select
              value={col.pinned ?? "none"}
              onValueChange={(v) =>
                onUpdate(index, {
                  pinned: v === "none" ? null : (v as "start" | "end"),
                })
              }
            >
              <SelectTrigger className="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">
                  None
                </SelectItem>
                <SelectItem value="start" className="text-xs">
                  Pin to start (left in LTR)
                </SelectItem>
                <SelectItem value="end" className="text-xs">
                  Pin to end (right in LTR)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[9px] text-muted-foreground/80 leading-snug">
              Requires <span className="font-medium">Pinned Columns</span> in
              Settings → Advanced.
            </p>
          </div>

          {hasOptions && (
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">
                Options (comma-separated)
              </Label>
              <Input
                value={(col.options || []).map((o) => o.label).join(", ")}
                onChange={(e) =>
                  onUpdate(index, {
                    options: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((label) => ({ label, value: label })),
                  })
                }
                className="h-6 text-[11px]"
                placeholder="Active, Pending, Inactive"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
            <label className="flex items-center justify-between gap-1 text-[11px]">
              <span>Visible</span>
              <Switch
                checked={col.visible}
                onCheckedChange={(v) => onUpdate(index, { visible: v })}
                className="scale-[0.6]"
              />
            </label>
            <label className="flex items-center justify-between gap-1 text-[11px]">
              <span>Sortable</span>
              <Switch
                checked={col.sortable}
                onCheckedChange={(v) => onUpdate(index, { sortable: v })}
                className="scale-[0.6]"
              />
            </label>
            <label className="flex items-center justify-between gap-1 text-[11px]">
              <span>Filterable</span>
              <Switch
                checked={col.filterable}
                onCheckedChange={(v) => onUpdate(index, { filterable: v })}
                className="scale-[0.6]"
              />
            </label>
            <label className="flex items-center justify-between gap-1 text-[11px]">
              <span>Resizable</span>
              <Switch
                checked={col.resizable !== false}
                onCheckedChange={(v) => onUpdate(index, { resizable: v })}
                className="scale-[0.6]"
              />
            </label>
            <label className="flex items-center justify-between gap-1 text-[11px]">
              <span>Groupable</span>
              <Switch
                checked={Boolean(col.groupable)}
                onCheckedChange={(v) => onUpdate(index, { groupable: v })}
                className="scale-[0.6]"
              />
            </label>
            <label
              className="flex items-center justify-between gap-1 text-[11px]"
              title="Render the cell value with an underline (good hint for clickable values)"
            >
              <span>Underline</span>
              <Switch
                checked={Boolean(col.underline)}
                onCheckedChange={(v) => onUpdate(index, { underline: v })}
                className="scale-[0.6]"
              />
            </label>
          </div>

          {/* Cell click action */}
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <Label className="text-[10px] text-muted-foreground">
              On cell click
            </Label>
            <Select
              value={col.clickAction?.type ?? "none"}
              onValueChange={(v) =>
                onUpdate(index, {
                  clickAction: {
                    type: v as
                      | "none"
                      | "dialog"
                      | "route-same"
                      | "route-new"
                      | "js",
                    urlTemplate: col.clickAction?.urlTemplate,
                    code: col.clickAction?.code,
                  },
                })
              }
            >
              <SelectTrigger className="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">
                  None
                </SelectItem>
                <SelectItem value="dialog" className="text-xs">
                  Open row dialog
                </SelectItem>
                <SelectItem value="route-same" className="text-xs">
                  Route — same tab
                </SelectItem>
                <SelectItem value="route-new" className="text-xs">
                  Route — new tab
                </SelectItem>
                <SelectItem value="js" className="text-xs">
                  Run custom JS (sandboxed)
                </SelectItem>
              </SelectContent>
            </Select>
            {(col.clickAction?.type === "route-same" ||
              col.clickAction?.type === "route-new") && (
              <>
                <Input
                  value={col.clickAction?.urlTemplate ?? ""}
                  onChange={(e) =>
                    onUpdate(index, {
                      clickAction: {
                        type: col.clickAction!.type,
                        urlTemplate: e.target.value,
                      },
                    })
                  }
                  placeholder="/users/{id}"
                  className="h-6 text-[11px] font-mono"
                />
                <p className="text-[9px] text-muted-foreground/80 leading-snug">
                  Tokens: <code className="text-[9px]">{"{id}"}</code>,{" "}
                  <code className="text-[9px]">{"{<field>}"}</code> — e.g.{" "}
                  <code className="text-[9px]">/users/{"{id}"}</code>.
                </p>
              </>
            )}
            {col.clickAction?.type === "js" && (
              <>
                <textarea
                  value={col.clickAction?.code ?? ""}
                  onChange={(e) =>
                    onUpdate(index, {
                      clickAction: {
                        type: "js",
                        code: e.target.value,
                        urlTemplate: col.clickAction?.urlTemplate,
                      },
                    })
                  }
                  placeholder={`helpers.toast('Clicked ' + row.name);\nhelpers.copy(value);`}
                  rows={4}
                  className="w-full text-[10px] font-mono p-1.5 rounded border border-border bg-background resize-y"
                />
                <p className="text-[9px] text-muted-foreground/80 leading-snug">
                  Sandboxed. Available: <code>row</code>, <code>value</code>,{" "}
                  <code>helpers.toast / copy / open</code>. No DOM / network
                  access.
                </p>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface ColumnEditorProps {
  config: TableBuilderConfig;
  onChange: (c: TableBuilderConfig) => void;
}

interface ZoneData extends Record<string, unknown> {
  zoneId: "columns";
}

export function ColumnEditor({ config, onChange }: ColumnEditorProps) {
  const addColumn = useCallback(() => {
    const id = `col-${Date.now()}`;
    onChange({
      ...config,
      columns: [
        ...config.columns,
        {
          id,
          key: `field_${config.columns.length + 1}`,
          label: `Column ${config.columns.length + 1}`,
          type: "text",
          sortable: true,
          filterable: false,
          visible: true,
          align: "left",
        },
      ],
    });
  }, [config, onChange]);

  const updateCol = useCallback(
    (idx: number, updates: Partial<TableColumnConfig>) => {
      const cols = [...config.columns];
      cols[idx] = { ...cols[idx], ...updates };
      onChange({ ...config, columns: cols });
    },
    [config, onChange],
  );

  const removeCol = useCallback(
    (idx: number) => {
      onChange({
        ...config,
        columns: config.columns.filter((_, i) => i !== idx),
      });
    },
    [config, onChange],
  );

  const handleDrop = useCallback(
    (result: DropResult<DraggableColData, ZoneData>) => {
      const { colId } = result.item.data;
      const oldIndex = config.columns.findIndex((c) => c.id === colId);
      if (oldIndex < 0) return;
      const without = config.columns.filter((c) => c.id !== colId);
      const insertAt = Math.max(0, Math.min(result.index, without.length));
      const next = [...without];
      next.splice(insertAt, 0, config.columns[oldIndex]);
      if (next.every((c, i) => c.id === config.columns[i]?.id)) return;
      onChange({ ...config, columns: next });
    },
    [config, onChange],
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Columns3 className="h-4 w-4" /> Columns
            <span className="text-[10px] text-muted-foreground font-normal">
              ({config.columns.length})
            </span>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={addColumn}
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <DndProvider>
          <ColumnsZone onDrop={handleDrop}>
            {config.columns.map((col, i) => (
              <SortableColumnCard
                key={col.id}
                col={col}
                index={i}
                onUpdate={updateCol}
                onRemove={removeCol}
              />
            ))}
          </ColumnsZone>
        </DndProvider>
        {config.columns.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No columns yet. Click "Add" to create one.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ColumnsZone({
  onDrop,
  children,
}: {
  onDrop: (r: DropResult<DraggableColData, ZoneData>) => void;
  children: React.ReactNode;
}) {
  const zoneData = useMemo<ZoneData>(() => ({ zoneId: "columns" }), []);
  const { zoneProps, hoverIndex } = useDropZone<ZoneData, DraggableColData>({
    id: "columns-zone",
    data: zoneData,
    onDrop,
    axis: "y",
  });
  const items = Array.isArray(children) ? children : [children];
  const out: React.ReactNode[] = [];
  items.forEach((child, idx) => {
    if (hoverIndex === idx) out.push(<DropIndicator key={`ind-${idx}`} />);
    out.push(child);
  });
  if (hoverIndex === items.length) out.push(<DropIndicator key="ind-end" />);
  return (
    <div {...zoneProps} className="space-y-2">
      {out}
    </div>
  );
}
