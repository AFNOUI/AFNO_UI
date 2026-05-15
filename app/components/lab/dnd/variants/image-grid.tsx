"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone, useDndContext } from "@/components/ui/dnd";

interface Tile {
  id: string;
  hue: number;
  label: string;
}

function SwapTile({
  tile,
  index,
  isPreview,
  onSwap,
}: {
  tile: Tile;
  index: number;
  isPreview?: boolean;
  onSwap: (fromId: string) => void;
}) {
  const { dragProps, isDragging } = useDraggable({
    id: tile.id,
    data: { id: tile.id, fromIndex: index },
    preview: () => (
      <div
        className="flex h-20 w-20 items-center justify-center rounded-lg shadow-xl"
        style={{ background: `oklch(0.75 0.15 ${tile.hue})` }}
      >
        <ImageIcon className="h-6 w-6 text-white/80" />
      </div>
    ),
  });
  const { zoneProps, isOver } = useDropZone<
    { tileId: string },
    { id: string; fromIndex: number }
  >({
    id: `swap-${tile.id}`,
    data: { tileId: tile.id },
    onDrop: ({ item }) => {
      if (item.data.id !== tile.id) onSwap(item.data.id);
    },
  });
  return (
    <div
      {...zoneProps}
      {...dragProps}
      className={cn(
        "flex aspect-square items-center justify-center rounded-lg text-xs font-medium text-white/90 transition-all duration-200 ease-out",
        isDragging && "opacity-45 ring-2 ring-primary/60",
        isPreview && !isDragging && "ring-1 ring-primary/30",
        isOver && !isDragging && "scale-105 ring-2 ring-primary",
      )}
      style={{ background: `oklch(0.7 0.14 ${tile.hue})` }}
    >
      {tile.label}
    </div>
  );
}

export function ImageGridDemo() {
  const [tiles, setTiles] = useState<Tile[]>(
    Array.from({ length: 8 }, (_, i) => ({
      id: `t${i}`,
      hue: (i * 45) % 360,
      label: `#${i + 1}`,
    })),
  );

  const { active } = useDndContext();
  const { zoneProps } = useDropZone<
    { list: "grid" },
    { id: string; fromIndex: number }
  >({
    id: "image-grid",
    data: { list: "grid" },
    axis: "y",
    // Swap-on-drop: target index is resolved per-tile via each tile's own drop zone.
    getItemIndex: () => -1,
    onDrop: () => {
      // Handled at the tile level for precise swap targeting.
    },
  });

  const activeId = active?.data.id as string | undefined;

  return (
    <div
      {...zoneProps}
      className="grid grid-cols-3 gap-2 sm:grid-cols-4"
    >
      {tiles.map((tile, i) => (
        <SwapTile
          key={tile.id}
          tile={tile}
          index={i}
          isPreview={tile.id === activeId}
          onSwap={(fromId) => {
            setTiles((prev) => {
              const from = prev.findIndex((t) => t.id === fromId);
              const to = prev.findIndex((t) => t.id === tile.id);
              if (from < 0 || to < 0 || from === to) return prev;
              const next = prev.slice();
              [next[from], next[to]] = [next[to], next[from]];
              return next;
            });
          }}
        />
      ))}
    </div>
  );
}

export const imageGridSnippet = `import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone } from "../../components/dnd";

interface Tile { id: string; hue: number; label: string }
type TileDragData = { id: string; fromIndex: number } & Record<string, unknown>;
type GridZoneData = { list: "grid" } & Record<string, unknown>;

function GridTile({ tile, index }: { tile: Tile; index: number }) {
  const { dragProps, isDragging } = useDraggable<TileDragData>({
    id: tile.id,
    data: { id: tile.id, fromIndex: index },
    preview: () => (
      <div className="flex h-20 w-20 items-center justify-center rounded-lg shadow-xl"
        style={{ background: \`oklch(0.75 0.15 \${tile.hue})\` }}>
        <ImageIcon className="h-6 w-6 text-white/80" />
      </div>
    ),
  });
  return (
    <div {...dragProps}
      className={cn("flex aspect-square items-center justify-center rounded-lg text-xs font-medium text-white", isDragging && "opacity-30")}
      style={{ background: \`oklch(0.7 0.14 \${tile.hue})\` }}>
      {tile.label}
    </div>
  );
}

export default function ImageGrid() {
  const [tiles, setTiles] = useState<Tile[]>(
    Array.from({ length: 8 }, (_, i) => ({ id: \`t\${i}\`, hue: (i * 45) % 360, label: \`#\${i + 1}\` }))
  );
  const { zoneProps, isOver, hoverIndex, getItemSlotStyle } = useDropZone<GridZoneData, TileDragData>({
    id: "image-grid", data: { list: "grid" }, axis: "y",
    getItemIndex: (drag) => tiles.findIndex((t) => t.id === drag.data.id),
    onDrop: ({ item, index }) => {
      const from = tiles.findIndex((t) => t.id === item.data.id);
      if (from < 0) return;
      const next = tiles.slice();
      const [moved] = next.splice(from, 1);
      next.splice(index > from ? index - 1 : index, 0, moved);
      setTiles(next);
    },
  });
  return (
    <div {...zoneProps} className="grid grid-cols-4 gap-2">
      {tiles.map((tile, i) => (
        <div key={tile.id} className="relative" style={getItemSlotStyle(i)}>
          {isOver && hoverIndex === i && (
            <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-primary bg-primary/10" />
          )}
          <GridTile tile={tile} index={i} />
        </div>
      ))}
    </div>
  );
}
`;
