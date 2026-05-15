"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone, useDndContext } from "@/components/ui/dnd";

import { SortableDropShadow } from "@/components/lab/dnd/shared/SortableDropShadow";

export interface ListItem {
  id: string;
  label: string;
}

export function SortableRow({
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
      <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-lg">
        {item.label}
      </div>
    ),
  });
  const isCollapsed = isDragging && collapseWhenDragging;
  return (
    <div
      {...dragProps}
      style={{
        ...dragProps.style,
        height: isCollapsed ? 0 : undefined,
        paddingTop: isCollapsed ? 0 : undefined,
        paddingBottom: isCollapsed ? 0 : undefined,
        opacity: isDragging ? 0.45 : 1,
      }}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-all duration-150",
        isCollapsed && "overflow-hidden border-transparent",
        isDragging && !isCollapsed
          ? "border-primary/40 shadow-sm"
          : "hover:border-primary/40",
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="truncate">{item.label}</span>
    </div>
  );
}

export function SortableListDemo() {
  const [items, setItems] = useState<ListItem[]>([
    { id: "a", label: "Write product spec" },
    { id: "b", label: "Design system audit" },
    { id: "c", label: "Refactor DnD primitives" },
    { id: "d", label: "Ship release notes" },
    { id: "e", label: "Sync with design" },
  ]);

  const { active } = useDndContext();
  const { zoneProps, isOver, hoverIndex, slotSize, animationsEnabled } =
    useDropZone<{ list: "sort" }, { id: string; fromIndex: number }>({
      id: "sortable-list",
      data: { list: "sort" },
      axis: "y",
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
    ? items.findIndex((item) => item.id === active.data.id)
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
        "flex flex-col gap-2 rounded-lg border-2 border-dashed p-3 transition min-h-[260px]",
        isOver
          ? "border-primary/60 bg-primary/5"
          : "border-transparent bg-muted/10",
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            "space-y-2",
            shouldShowTarget && item.id === active?.data.id && "hidden",
          )}
        >
          {shouldShowTarget && targetIndex === i && (
            <SortableDropShadow
              height={slotSize.height}
              animated={animationsEnabled}
            />
          )}
          <SortableRow
            item={item}
            index={i}
            collapseWhenDragging={shouldShowTarget}
          />
        </div>
      ))}
      {shouldShowTarget && targetIndex === items.length && (
        <SortableDropShadow
          height={slotSize.height}
          animated={animationsEnabled}
        />
      )}
      {!active && (
        <p className="text-xs text-muted-foreground">
          Drag any row to reorder. Cards shift to make room at the drop
          position.
        </p>
      )}
    </div>
  );
}

/**
 * Standalone copy-pasteable example shipped via `afnoui add dnd/sortable-list`
 * and shown in the in-app "Snippet" tab. Imports are written relative so the
 * file resolves from `<root>/dnd/sortable-list/SortableListDemo.tsx` to the
 * consumer's `components/dnd` + `lib/utils` regardless of app-dir / src-dir /
 * flat layout.
 *
 * Generics are passed to `useDraggable<TData>` and `useDropZone<TZone, TItem>`
 * so `item.data.x` is statically typed when the snippet is compiled inside the
 * consumer's strict `tsc --noEmit`.
 */
export const sortableListSnippet = `import { useState } from "react";
import { GripVertical } from "lucide-react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone, useDndContext } from "../../components/dnd";

interface ListItem { id: string; label: string }
type RowDragData = { id: string; fromIndex: number } & Record<string, unknown>;
type SortZoneData = { list: "sort" } & Record<string, unknown>;

function SortableRow({ item, index, collapsed }: { item: ListItem; index: number; collapsed: boolean }) {
  const { dragProps, isDragging } = useDraggable<RowDragData>({
    id: item.id,
    data: { id: item.id, fromIndex: index },
    preview: () => (
      <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-lg">{item.label}</div>
    ),
  });
  const isCollapsed = isDragging && collapsed;
  return (
    <div
      {...dragProps}
      style={{
        ...dragProps.style,
        height: isCollapsed ? 0 : undefined,
        paddingTop: isCollapsed ? 0 : undefined,
        paddingBottom: isCollapsed ? 0 : undefined,
        opacity: isDragging ? 0.45 : 1,
      }}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-all duration-150",
        isCollapsed && "overflow-hidden border-transparent",
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="truncate">{item.label}</span>
    </div>
  );
}

export default function SortableList() {
  const [items, setItems] = useState<ListItem[]>([
    { id: "a", label: "Write product spec" },
    { id: "b", label: "Design system audit" },
    { id: "c", label: "Refactor DnD primitives" },
    { id: "d", label: "Ship release notes" },
  ]);

  const { active } = useDndContext();
  const { zoneProps, isOver, hoverIndex, slotSize } = useDropZone<SortZoneData, RowDragData>({
    id: "sortable-list",
    data: { list: "sort" },
    axis: "y",
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

  const activeData = active?.data as RowDragData | undefined;
  const activeIndex = activeData ? items.findIndex((i) => i.id === activeData.id) : -1;
  const targetIndex = hoverIndex == null || activeIndex === -1
    ? null
    : hoverIndex > activeIndex ? hoverIndex + 1 : hoverIndex;
  const showTarget = isOver && targetIndex !== null && targetIndex !== activeIndex;

  return (
    <div {...zoneProps} className="flex flex-col gap-2 p-3">
      {items.map((item, i) => (
        <div key={item.id} className={cn("space-y-2", showTarget && item.id === activeData?.id && "hidden")}>
          {showTarget && targetIndex === i && (
            <div className="rounded-md border border-primary/60 bg-primary/10" style={{ height: slotSize.height }} />
          )}
          <SortableRow item={item} index={i} collapsed={showTarget} />
        </div>
      ))}
      {showTarget && targetIndex === items.length && (
        <div className="rounded-md border border-primary/60 bg-primary/10" style={{ height: slotSize.height }} />
      )}
    </div>
  );
}
`;
