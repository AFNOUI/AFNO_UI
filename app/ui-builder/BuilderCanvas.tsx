import { LayoutTemplate, MousePointerClick } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDropZone } from "@/components/ui/dnd";
import { uiTemplates } from "@/ui-builder/data/uiBuilderTemplates";
import { BuilderNode, Breakpoint } from "@/ui-builder/data/uiBuilderRegistry";

import { SortableNode } from "./RenderNode";
import { Button } from "@/components/ui/button";

const BREAKPOINT_WIDTHS: Record<Breakpoint, string> = {
  base: "100%",
  md: "768px",
  sm: "375px",
};

interface BuilderCanvasProps {
  zoom: number;
  showGrid: boolean;
  nodes: BuilderNode[];
  breakpoint: Breakpoint;
  direction: "ltr" | "rtl";
  selectedId: string | null;
  interactivePreview: boolean;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSelect: (id: string | null) => void;
  onLoadTemplate: (nodes: BuilderNode[]) => void;
}

export function BuilderCanvas({ nodes, breakpoint, selectedId, showGrid, interactivePreview, zoom, direction, onSelect, onDelete, onDuplicate, onLoadTemplate }: BuilderCanvasProps) {
  // Root canvas drop zone — the actual drop handling lives in PageBuilder.tsx
  // via the global DndProvider's onDragEnd; this zone just provides a hit-test
  // region so the provider can resolve insertion index and a hover affordance.
  const { zoneProps, isOver } = useDropZone({
    axis: "y",
    id: "canvas-root",
    data: { type: "canvas" },
    onDrop: () => { /* handled centrally in PageBuilder */ },
  });
  const scale = zoom / 100;

  return (
    <div className="flex-1 overflow-auto bg-muted/20 p-4 flex justify-center" onClick={() => onSelect(null)}>
      <div
        {...(zoneProps as React.HTMLAttributes<HTMLDivElement> & { ref: React.Ref<HTMLDivElement> })}
        dir={direction}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          maxWidth: BREAKPOINT_WIDTHS[breakpoint],
        }}
        className={cn(
          "bg-background border border-border rounded-xl shadow-lg transition-all min-h-[600px] w-full relative",
          isOver && "ring-2 ring-primary/40 bg-primary/5",
          showGrid && "bg-[radial-gradient(circle,hsl(var(--border))_1px,transparent_1px)] bg-[length:20px_20px]"
        )}
      >
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground gap-4 px-6">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
                <MousePointerClick className="h-7 w-7 text-muted-foreground/60" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground/70">Drag components or pick a layout</p>
                <p className="text-xs text-muted-foreground/60">Use Quick Layouts in the sidebar for common arrangements</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {uiTemplates.slice(0, 3).map(t => (
                  <Button
                    size="sm"
                    key={t.id}
                    variant="outline"
                    className="text-xs h-7 gap-1.5"
                    onClick={(e) => { e.stopPropagation(); onLoadTemplate(t.nodes()); }}
                  >
                    <LayoutTemplate className="h-3 w-3" />
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {nodes.map(node => (
                <SortableNode
                  node={node}
                  key={node.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  breakpoint={breakpoint}
                  selectedId={selectedId}
                  onDuplicate={onDuplicate}
                  interactivePreview={interactivePreview}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
