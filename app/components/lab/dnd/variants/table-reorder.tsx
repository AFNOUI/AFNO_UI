"use client";

import { useState } from "react";
import { GripVertical, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone, useDndContext } from "@/components/ui/dnd";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface TableRow {
  id: string;
  key: string;
  display: string;
  status: boolean;
  type: string;
  usage: string;
}

function TableReorderRow({
  row,
  index,
  collapsed,
  slotHeight,
  showSlot,
  onToggle,
}: {
  row: TableRow;
  index: number;
  collapsed: boolean;
  slotHeight: number;
  showSlot: boolean;
  onToggle: (id: string) => void;
}) {
  const { dragProps, isDragging } = useDraggable({
    id: row.id,
    data: { id: row.id, fromIndex: index },
    preview: () => (
      <div className="rounded-md border bg-card shadow-xl ring-1 ring-primary/30 grid grid-cols-[28px_1.2fr_1.2fr_0.8fr_1fr_0.6fr_0.6fr_0.6fr] items-center gap-3 px-3 py-2.5 text-sm w-[920px] max-w-[95vw]">
        <div className="flex h-6 w-6 items-center justify-center text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="font-medium truncate">{row.key}</div>
        <div className="uppercase tracking-wide text-xs text-muted-foreground truncate">
          {row.display}
        </div>
        <div>
          <Switch checked={row.status} />
        </div>
        <div>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-0 text-[10px]"
          >
            {row.type}
          </Badge>
        </div>
        <div className="font-mono text-xs">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="text-muted-foreground text-xs">{row.usage}</div>
        <div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    ),
  });

  // The source row must fully collapse the moment a drag starts — not only when
  // the pointer reaches a valid target index. Otherwise a thin 40%-opacity strip
  // stays visible (the "small portion remains" bug).
  const hidden = isDragging || collapsed;

  return (
    <>
      {showSlot && (
        <div
          aria-hidden
          className="rounded-md border border-primary/60 bg-primary/10"
          style={{ height: slotHeight }}
        />
      )}
      <div
        style={{
          height: hidden ? 0 : undefined,
          opacity: hidden ? 0 : 1,
          overflow: hidden ? "hidden" : undefined,
          paddingTop: hidden ? 0 : undefined,
          paddingBottom: hidden ? 0 : undefined,
          borderBottomWidth: hidden ? 0 : undefined,
        }}
        className={cn(
          "grid grid-cols-[28px_1.2fr_1.2fr_0.8fr_1fr_0.6fr_0.6fr_0.6fr] items-center gap-3 border-b px-3 py-2.5 text-sm hover:bg-muted/30",
        )}
      >
        <div
          {...dragProps}
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="font-medium truncate">{row.key}</div>
        <div className="uppercase tracking-wide text-xs text-muted-foreground truncate">
          {row.display}
        </div>
        <div>
          <Switch
            checked={row.status}
            onCheckedChange={() => onToggle(row.id)}
          />
        </div>
        <div>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-0 text-[10px]"
          >
            {row.type}
          </Badge>
        </div>
        <div className="font-mono text-xs">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="text-muted-foreground text-xs">{row.usage}</div>
        <div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function TableRowReorderDemo() {
  const [rows, setRows] = useState<TableRow[]>([
    {
      id: "owner",
      key: "owner",
      display: "OWNER",
      status: true,
      type: "System Default",
      usage: "—",
    },
    {
      id: "3pl",
      key: "3pl",
      display: "3PL",
      status: true,
      type: "System Default",
      usage: "—",
    },
    {
      id: "both",
      key: "both",
      display: "BOTH",
      status: true,
      type: "System Default",
      usage: "—",
    },
    {
      id: "vendor",
      key: "vendor",
      display: "VENDOR",
      status: false,
      type: "Custom",
      usage: "—",
    },
  ]);

  const { active } = useDndContext();
  const { zoneProps, isOver, hoverIndex, slotSize } = useDropZone({
    id: "table-reorder",
    data: { list: "table" },
    axis: "y",
    getItemIndex: (drag) => rows.findIndex((r) => r.id === drag.data.id),
    onDrop: ({ item, index }) => {
      const from = rows.findIndex((r) => r.id === item.data.id);
      if (from < 0) return;
      const next = rows.slice();
      const [moved] = next.splice(from, 1);
      next.splice(Math.max(0, Math.min(index, next.length)), 0, moved);
      setRows(next);
    },
  });

  const activeIndex = active
    ? rows.findIndex((r) => r.id === active.data.id)
    : -1;
  const targetIndex =
    hoverIndex == null || activeIndex === -1
      ? null
      : hoverIndex > activeIndex
        ? hoverIndex + 1
        : hoverIndex;
  const showTarget = isOver && targetIndex !== null;

  const toggle = (id: string) =>
    setRows((cur) =>
      cur.map((r) => (r.id === id ? { ...r, status: !r.status } : r)),
    );

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-start justify-between p-5 pb-3">
        <div>
          <h3 className="text-base font-bold text-primary">Company Type</h3>
          <p className="text-xs text-muted-foreground">
            Company field configuration
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <span className="text-base leading-none">+</span> Add Value
        </Button>
      </div>
      <div className="grid grid-cols-[28px_1.2fr_1.2fr_0.8fr_1fr_0.6fr_0.6fr_0.6fr] items-center gap-3 border-y bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div />
        <div>Key</div>
        <div>Display Value</div>
        <div>Status</div>
        <div>Type</div>
        <div>Position</div>
        <div>Usage</div>
        <div>Actions</div>
      </div>
      <div {...zoneProps}>
        {rows.map((row, i) => (
          <TableReorderRow
            key={row.id}
            row={row}
            index={i}
            collapsed={showTarget && row.id === active?.data.id}
            slotHeight={slotSize.height}
            showSlot={showTarget && targetIndex === i}
            onToggle={toggle}
          />
        ))}
        {showTarget && targetIndex === rows.length && (
          <div
            aria-hidden
            className="rounded-md border border-primary/60 bg-primary/10"
            style={{ height: slotSize.height }}
          />
        )}
      </div>
    </div>
  );
}

export const tableReorderSnippet = `import { useState } from "react";
import { GripVertical, Pencil } from "lucide-react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone, useDndContext } from "../../components/dnd";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface TableRow {
  id: string; key: string; display: string;
  status: boolean; type: string; usage: string;
}
type TableRowDragData = { id: string; fromIndex: number } & Record<string, unknown>;

function ReorderRow({ row, index, collapsed, onToggle }: {
  row: TableRow; index: number; collapsed: boolean; onToggle: (id: string) => void;
}) {
  const { dragProps, isDragging } = useDraggable<TableRowDragData>({
    id: row.id,
    data: { id: row.id, fromIndex: index },
  });
  return (
    <div
      style={{ height: collapsed ? 0 : undefined, opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        "grid grid-cols-[28px_1.2fr_1.2fr_0.8fr_1fr_0.6fr_0.6fr_0.6fr] items-center gap-3 border-b px-3 py-2.5 text-sm hover:bg-muted/30 transition-all",
        collapsed && "overflow-hidden border-transparent",
      )}
    >
      <div {...dragProps} className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="font-medium">{row.key}</div>
      <div className="uppercase text-xs text-muted-foreground">{row.display}</div>
      <div><Switch checked={row.status} onCheckedChange={() => onToggle(row.id)} /></div>
      <div><Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px]">{row.type}</Badge></div>
      <div className="font-mono text-xs">{String(index + 1).padStart(2, "0")}</div>
      <div className="text-muted-foreground text-xs">{row.usage}</div>
      <div><Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button></div>
    </div>
  );
}

export default function TableRowReorder() {
  const [rows, setRows] = useState<TableRow[]>([
    { id: "owner", key: "owner", display: "OWNER", status: true, type: "System Default", usage: "—" },
    { id: "3pl", key: "3pl", display: "3PL", status: true, type: "System Default", usage: "—" },
    { id: "both", key: "both", display: "BOTH", status: true, type: "System Default", usage: "—" },
  ]);

  const { active } = useDndContext();
  const { zoneProps, isOver, hoverIndex, slotSize } = useDropZone<Record<string, unknown>, TableRowDragData>({
    id: "table-reorder", axis: "y",
    getItemIndex: (drag) => rows.findIndex((r) => r.id === drag.data.id),
    onDrop: ({ item, index }) => {
      const from = rows.findIndex((r) => r.id === item.data.id);
      if (from < 0) return;
      const next = rows.slice();
      const [m] = next.splice(from, 1);
      next.splice(Math.max(0, Math.min(index, next.length)), 0, m);
      setRows(next);
    },
  });

  const activeData = active?.data as TableRowDragData | undefined;
  const activeIndex = activeData ? rows.findIndex((r) => r.id === activeData.id) : -1;
  const targetIndex = hoverIndex == null || activeIndex === -1
    ? null : hoverIndex > activeIndex ? hoverIndex + 1 : hoverIndex;
  const showTarget = isOver && targetIndex !== null;

  return (
    <div {...zoneProps} className="rounded-xl border bg-card">
      {rows.map((row, i) => (
        <div key={row.id}>
          {showTarget && targetIndex === i && (
            <div className="rounded-md border border-primary/60 bg-primary/10" style={{ height: slotSize.height }} />
          )}
          <ReorderRow row={row} index={i} collapsed={showTarget && row.id === activeData?.id}
            onToggle={(id) => setRows((c) => c.map((r) => r.id === id ? { ...r, status: !r.status } : r))} />
        </div>
      ))}
    </div>
  );
}
`;
