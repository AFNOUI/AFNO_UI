"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDropZone, useDndContext } from "@/components/ui/dnd";

import { SortableDropShadow } from "@/components/lab/dnd/shared/SortableDropShadow";
import {
  SortableRow,
  type ListItem,
} from "@/components/lab/dnd/variants/sortable-list";

export function TrashDemo() {
  const [items, setItems] = useState<ListItem[]>(
    Array.from({ length: 6 }, (_, i) => ({
      id: `tr${i}`,
      label: `Item ${i + 1}`,
    })),
  );
  const [trashed, setTrashed] = useState(0);

  const Source = () => {
    const { active } = useDndContext();
    const { zoneProps, isOver, hoverIndex, slotSize, animationsEnabled } =
      useDropZone<{ list: "trash-source" }, { id: string }>({
        id: "trash-source",
        data: { list: "trash-source" },
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
        className="flex-1 min-w-0 space-y-2 rounded-lg border-2 border-dashed border-transparent bg-muted/10 p-3 min-h-[220px]"
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
        {items.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">
            All items deleted.
          </p>
        )}
      </div>
    );
  };

  const Trash = () => {
    const { zoneProps, isOver, isDragging } = useDropZone<
      { list: "trash" },
      { id: string }
    >({
      id: "trash",
      data: { list: "trash" },
      onDrop: ({ item }) => {
        setItems((cur) => cur.filter((i) => i.id !== item.data.id));
        setTrashed((c) => c + 1);
      },
    });
    return (
      <div
        {...zoneProps}
        className={cn(
          "flex h-32 w-full shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition sm:h-40 sm:w-40",
          isOver
            ? "border-destructive bg-destructive/10 text-destructive scale-105"
            : isDragging
              ? "border-destructive/50 text-destructive/70"
              : "border-border text-muted-foreground",
        )}
      >
        <Trash2 className={cn("h-8 w-8 transition", isOver && "scale-110")} />
        <span className="text-xs font-medium">
          {isOver ? "Release to delete" : "Drop here to delete"}
        </span>
        <span className="text-[10px] uppercase tracking-wider">
          {trashed} removed
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Source />
      <Trash />
    </div>
  );
}

export const trashSnippet = `import { useState } from "react";
import { Trash2, GripVertical } from "lucide-react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone } from "../../components/dnd";

interface Item { id: string; label: string }
type TrashItemData = { id: string } & Record<string, unknown>;
type TrashZoneData = { list: "trash" } & Record<string, unknown>;

export default function TrashZone() {
  const [items, setItems] = useState<Item[]>(
    Array.from({ length: 6 }, (_, i) => ({ id: \`tr\${i}\`, label: \`Item \${i + 1}\` }))
  );
  const [trashed, setTrashed] = useState(0);

  const Trash = () => {
    const { zoneProps, isOver } = useDropZone<TrashZoneData, TrashItemData>({
      id: "trash", data: { list: "trash" },
      onDrop: ({ item }) => {
        setItems((prev) => prev.filter((i) => i.id !== item.data.id));
        setTrashed((n) => n + 1);
      },
    });
    return (
      <div {...zoneProps}
        className={cn("flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed p-3",
          isOver ? "border-destructive bg-destructive/10" : "border-border bg-muted/20")}>
        <Trash2 className={cn("h-8 w-8", isOver ? "text-destructive" : "text-muted-foreground")} />
        <p className="mt-2 text-xs">Trashed: {trashed}</p>
      </div>
    );
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-2 rounded-lg border-2 border-dashed border-transparent bg-muted/10 p-3">
        {items.map((item) => {
          const D = () => {
            const { dragProps, isDragging } = useDraggable<TrashItemData>({
              id: item.id, data: { id: item.id },
              preview: () => <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-lg">{item.label}</div>,
            });
            return (
              <div {...dragProps} className={cn("flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm", isDragging && "opacity-30")}>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </div>
            );
          };
          return <D key={item.id} />;
        })}
      </div>
      <div className="w-48"><Trash /></div>
    </div>
  );
}
`;
