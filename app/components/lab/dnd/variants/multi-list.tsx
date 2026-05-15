"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone, useDndContext } from "@/components/ui/dnd";

import { SortableDropShadow } from "@/components/lab/dnd/shared/SortableDropShadow";
import type { ListItem } from "@/components/lab/dnd/variants/sortable-list";

function TransferRow({
  listId,
  item,
  collapseWhenDragging,
}: {
  listId: string;
  item: ListItem;
  collapseWhenDragging: boolean;
}) {
  const { dragProps, isDragging } = useDraggable({
    id: `${listId}:${item.id}`,
    data: { id: item.id, fromList: listId },
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
        marginTop: isCollapsed ? 0 : undefined,
        opacity: isDragging ? 0.45 : 1,
      }}
      className={cn(
        "rounded-md border bg-card px-3 py-2 text-sm truncate transition-all duration-150",
        isCollapsed && "overflow-hidden border-transparent",
      )}
    >
      {item.label}
    </div>
  );
}

function TransferList({
  id,
  title,
  items,
  onDrop,
}: {
  id: string;
  title: string;
  items: ListItem[];
  onDrop: (itemId: string, fromList: string, index: number) => void;
}) {
  const { active } = useDndContext();
  const { zoneProps, isOver, hoverIndex, slotSize, animationsEnabled } =
    useDropZone<{ list: string }, { id: string; fromList: string }>({
      id,
      data: { list: id },
      axis: "y",
      getItemIndex: (drag) =>
        drag.data.fromList === id
          ? items.findIndex((i) => i.id === drag.data.id)
          : null,
      onDrop: ({ item, index }) => {
        const insertAt = Math.max(
          0,
          Math.min(index, items.length + (item.data.fromList === id ? 0 : 1)),
        );
        onDrop(item.data.id, item.data.fromList, insertAt);
      },
    });

  const isSameListDrag = active?.data?.fromList === id;
  const activeIndex = isSameListDrag
    ? items.findIndex((i) => i.id === active?.data.id)
    : -1;
  const targetIndex =
    hoverIndex === null
      ? null
      : isSameListDrag && activeIndex !== -1
        ? hoverIndex > activeIndex
          ? hoverIndex + 1
          : hoverIndex
        : hoverIndex;
  const shouldShowTarget =
    isOver &&
    targetIndex !== null &&
    !(isSameListDrag && targetIndex === activeIndex);

  return (
    <div className="flex-1 min-w-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({items.length})
      </p>
      <div
        {...zoneProps}
        className={cn(
          "min-h-[180px] space-y-2 rounded-lg border-2 border-dashed p-3 transition",
          isOver ? "border-primary bg-primary/5" : "border-border bg-muted/20",
        )}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "space-y-2",
              shouldShowTarget &&
                isSameListDrag &&
                item.id === active?.data.id &&
                "hidden",
            )}
          >
            {shouldShowTarget && targetIndex === i && (
              <SortableDropShadow
                height={slotSize.height}
                animated={animationsEnabled}
              />
            )}
            <TransferRow
              listId={id}
              item={item}
              collapseWhenDragging={shouldShowTarget && isSameListDrag}
            />
          </div>
        ))}
        {shouldShowTarget && targetIndex === items.length && (
          <SortableDropShadow
            height={slotSize.height}
            animated={animationsEnabled}
          />
        )}
        {items.length === 0 && !isOver && (
          <p className="text-center text-xs text-muted-foreground">
            Drop items here
          </p>
        )}
      </div>
    </div>
  );
}

export function MultiListDemo() {
  const [available, setAvailable] = useState<ListItem[]>([
    { id: "u1", label: "Alice Chen" },
    { id: "u2", label: "Marcus Lee" },
    { id: "u3", label: "Priya Patel" },
    { id: "u4", label: "Diego Ruiz" },
  ]);
  const [selected, setSelected] = useState<ListItem[]>([
    { id: "u5", label: "Hana Suzuki" },
  ]);

  const lists = { available, selected } as Record<string, ListItem[]>;
  const setters = { available: setAvailable, selected: setSelected } as Record<
    string,
    React.Dispatch<React.SetStateAction<ListItem[]>>
  >;

  const handleDrop =
    (itemId: string, fromList: string, index: number) => (toList: string) => {
      const sourceArr = lists[fromList];
      const targetArr = lists[toList];
      const item = sourceArr.find((i) => i.id === itemId);
      if (!item) return;

      if (fromList === toList) {
        const from = sourceArr.findIndex((i) => i.id === itemId);
        const next = sourceArr.slice();
        const [m] = next.splice(from, 1);
        const insertAt = index > from ? index - 1 : index;
        next.splice(insertAt, 0, m);
        setters[toList](next);
      } else {
        setters[fromList](sourceArr.filter((i) => i.id !== itemId));
        const next = targetArr.slice();
        next.splice(index, 0, item);
        setters[toList](next);
      }
    };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <TransferList
        id="available"
        title="Available"
        items={available}
        onDrop={(id, from, idx) => handleDrop(id, from, idx)("available")}
      />
      <div className="hidden items-center justify-center sm:flex">
        <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
      </div>
      <TransferList
        id="selected"
        title="Selected"
        items={selected}
        onDrop={(id, from, idx) => handleDrop(id, from, idx)("selected")}
      />
    </div>
  );
}

export const multiListSnippet = `import { useState } from "react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone } from "../../components/dnd";

interface Item { id: string; label: string }
type TransferDragData = { id: string; fromList: string } & Record<string, unknown>;
type TransferZoneData = { list: string } & Record<string, unknown>;

function TransferList({ id, title, items, onDrop }: {
  id: string; title: string; items: Item[];
  onDrop: (itemId: string, fromList: string, index: number) => void;
}) {
  const { zoneProps, isOver, getItemSlotStyle } = useDropZone<TransferZoneData, TransferDragData>({
    id, data: { list: id }, axis: "y",
    getItemIndex: (drag) =>
      drag.data.fromList === id ? items.findIndex((i) => i.id === drag.data.id) : null,
    onDrop: ({ item, index }) => onDrop(item.data.id, item.data.fromList, index),
  });
  return (
    <div className="flex-1">
      <p className="mb-2 text-xs font-semibold uppercase">{title} ({items.length})</p>
      <div {...zoneProps}
        className={cn("min-h-[180px] space-y-2 rounded-lg border-2 border-dashed p-3",
          isOver ? "border-primary bg-primary/5" : "border-border bg-muted/20")}>
        {items.map((item, i) => {
          const Drag = () => {
            const { dragProps, isDragging } = useDraggable<TransferDragData>({
              id: \`\${id}:\${item.id}\`,
              data: { id: item.id, fromList: id },
              preview: () => <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-lg">{item.label}</div>,
            });
            return (
              <div {...dragProps} className={cn("rounded-md border bg-card px-3 py-2 text-sm", isDragging && "opacity-30")}>
                {item.label}
              </div>
            );
          };
          return <div key={item.id} style={getItemSlotStyle(i)}><Drag /></div>;
        })}
      </div>
    </div>
  );
}

export default function MultiList() {
  const [available, setAvailable] = useState<Item[]>([{ id: "u1", label: "Alice" }, { id: "u2", label: "Marcus" }]);
  const [selected, setSelected] = useState<Item[]>([{ id: "u3", label: "Hana" }]);
  const lists: Record<string, Item[]> = { available, selected };
  const setters: Record<string, React.Dispatch<React.SetStateAction<Item[]>>> = { available: setAvailable, selected: setSelected };

  const handleDrop = (toList: string) => (id: string, from: string, index: number) => {
    const item = lists[from].find((i) => i.id === id);
    if (!item) return;
    if (from === toList) {
      const fromIdx = lists[from].findIndex((i) => i.id === id);
      const next = lists[from].slice();
      const [m] = next.splice(fromIdx, 1);
      next.splice(index > fromIdx ? index - 1 : index, 0, m);
      setters[toList](next);
    } else {
      setters[from](lists[from].filter((i) => i.id !== id));
      const next = lists[toList].slice();
      next.splice(index, 0, item);
      setters[toList](next);
    }
  };

  return (
    <div className="flex gap-4">
      <TransferList id="available" title="Available" items={available} onDrop={handleDrop("available")} />
      <TransferList id="selected" title="Selected" items={selected} onDrop={handleDrop("selected")} />
    </div>
  );
}
`;
