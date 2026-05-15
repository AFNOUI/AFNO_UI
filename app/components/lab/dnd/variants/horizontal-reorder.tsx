"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone, useDndContext } from "@/components/ui/dnd";

import type { ListItem } from "@/components/lab/dnd/variants/sortable-list";

function PillDropShadow({
  width,
  animated,
}: {
  width: number;
  animated: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block rounded-full border border-primary/60 bg-primary/10 ring-1 ring-primary/20 align-middle",
        animated && "animate-in fade-in zoom-in-95 duration-150",
      )}
      style={{ width: Math.max(width, 60), height: 26 }}
    />
  );
}

function PillItem({
  item,
  index,
  collapseWhenDragging = false,
}: {
  item: ListItem;
  index: number;
  collapseWhenDragging?: boolean;
}) {
  const { dragProps, isDragging } = useDraggable({
    id: item.id,
    data: { id: item.id, fromIndex: index },
    preview: () => (
      <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow">
        {item.label}
      </span>
    ),
  });
  const isCollapsed = isDragging && collapseWhenDragging;
  return (
    <span
      {...dragProps}
      style={{
        ...dragProps.style,
        width: isCollapsed ? 0 : undefined,
        paddingLeft: isCollapsed ? 0 : undefined,
        paddingRight: isCollapsed ? 0 : undefined,
        opacity: isDragging ? 0.45 : 1,
      }}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border bg-card px-3 py-1 text-xs font-medium transition-all duration-150",
        isCollapsed && "overflow-hidden border-transparent",
        isDragging && !isCollapsed
          ? "border-primary/40 shadow-sm"
          : "hover:border-primary/50",
      )}
    >
      {item.label}
    </span>
  );
}

export function HorizontalReorderDemo() {
  const [items, setItems] = useState<ListItem[]>([
    { id: "p1", label: "TypeScript" },
    { id: "p2", label: "React" },
    { id: "p3", label: "Vite" },
    { id: "p4", label: "Tailwind" },
    { id: "p5", label: "Vitest" },
    { id: "p6", label: "Bun" },
  ]);

  const { active } = useDndContext();
  const { zoneProps, isOver, hoverIndex, slotSize, animationsEnabled } =
    useDropZone<{ list: "pills" }, { id: string; fromIndex: number }>({
      id: "pill-bar",
      data: { list: "pills" },
      axis: "grid",
      getItemIndex: (drag) => items.findIndex((i) => i.id === drag.data.id),
      onDrop: ({ item, index }) => {
        const from = items.findIndex((i) => i.id === item.data.id);
        if (from < 0) return;
        const next = items.slice();
        const [moved] = next.splice(from, 1);
        const insertAt = Math.max(0, Math.min(index, next.length));
        next.splice(insertAt, 0, moved);
        setItems(next);
      },
    });

  const activeIndex = active
    ? items.findIndex((i) => i.id === active.data.id)
    : -1;
  const targetIndex =
    hoverIndex === null || activeIndex === -1
      ? null
      : hoverIndex > activeIndex
        ? hoverIndex + 1
        : hoverIndex;
  const shouldShowTarget =
    isOver && targetIndex !== null && targetIndex !== activeIndex;

  return (
    <div
      {...zoneProps}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border-2 border-dashed p-3 transition min-h-[120px]",
        isOver
          ? "border-primary/60 bg-primary/5"
          : "border-transparent bg-muted/10",
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-2",
            shouldShowTarget && item.id === active?.data.id && "hidden",
          )}
        >
          {shouldShowTarget && targetIndex === i && (
            <PillDropShadow
              width={slotSize.width}
              animated={animationsEnabled}
            />
          )}
          <PillItem
            item={item}
            index={i}
            collapseWhenDragging={shouldShowTarget}
          />
        </div>
      ))}
      {shouldShowTarget && targetIndex === items.length && (
        <PillDropShadow width={slotSize.width} animated={animationsEnabled} />
      )}
    </div>
  );
}

export const horizontalReorderSnippet = `import { useState } from "react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone, useDndContext } from "../../components/dnd";

interface ListItem { id: string; label: string }
type PillDragData = { id: string; fromIndex: number } & Record<string, unknown>;
type PillsZoneData = { list: "pills" } & Record<string, unknown>;

function PillItem({ item, index, collapsed }: { item: ListItem; index: number; collapsed: boolean }) {
  const { dragProps, isDragging } = useDraggable<PillDragData>({
    id: item.id,
    data: { id: item.id, fromIndex: index },
    preview: () => (
      <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow">
        {item.label}
      </span>
    ),
  });
  const isCollapsed = isDragging && collapsed;
  return (
    <span
      {...dragProps}
      style={{
        ...dragProps.style,
        width: isCollapsed ? 0 : undefined,
        paddingLeft: isCollapsed ? 0 : undefined,
        paddingRight: isCollapsed ? 0 : undefined,
        opacity: isDragging ? 0.45 : 1,
      }}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border bg-card px-3 py-1 text-xs font-medium transition-all duration-150",
        isCollapsed && "overflow-hidden border-transparent",
      )}
    >
      {item.label}
    </span>
  );
}

export default function HorizontalReorder() {
  const [items, setItems] = useState<ListItem[]>([
    { id: "p1", label: "TypeScript" },
    { id: "p2", label: "React" },
    { id: "p3", label: "Vite" },
    { id: "p4", label: "Tailwind" },
  ]);

  const { active } = useDndContext();
  const { zoneProps, isOver, hoverIndex, slotSize } = useDropZone<PillsZoneData, PillDragData>({
    id: "pill-bar",
    data: { list: "pills" },
    axis: "x",
    getItemIndex: (drag) => items.findIndex((i) => i.id === drag.data.id),
    onDrop: ({ item, index }) => {
      const from = items.findIndex((i) => i.id === item.data.id);
      if (from < 0) return;
      const next = items.slice();
      const [moved] = next.splice(from, 1);
      next.splice(Math.max(0, Math.min(index, next.length)), 0, moved);
      setItems(next);
    },
  });

  const activeData = active?.data as PillDragData | undefined;
  const activeIndex = activeData ? items.findIndex((i) => i.id === activeData.id) : -1;
  const targetIndex = hoverIndex == null || activeIndex === -1
    ? null
    : hoverIndex > activeIndex ? hoverIndex + 1 : hoverIndex;
  const showTarget = isOver && targetIndex !== null && targetIndex !== activeIndex;

  return (
    <div {...zoneProps} className="flex flex-wrap items-center gap-2">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={cn("flex items-center gap-2", showTarget && item.id === activeData?.id && "hidden")}
        >
          {showTarget && targetIndex === i && (
            <span className="inline-block rounded-full border border-primary/60 bg-primary/10" style={{ width: slotSize.width, height: 26 }} />
          )}
          <PillItem item={item} index={i} collapsed={showTarget} />
        </div>
      ))}
      {showTarget && targetIndex === items.length && (
        <span className="inline-block rounded-full border border-primary/60 bg-primary/10" style={{ width: slotSize.width, height: 26 }} />
      )}
    </div>
  );
}
`;
