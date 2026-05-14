"use client";

import { useCallback, useEffect, useState } from "react";

import { useUiBuilder } from "@/ui-builder/hooks/useUiBuilder";
import { createNode } from "@/ui-builder/data/uiBuilderRegistry";
import { DndProvider, type DragSnapshot } from "@/components/ui/dnd";

import { TooltipProvider } from "@/components/ui/tooltip";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

import { LayerPanel } from "@/ui-builder/LayerPanel";
import { BuilderCanvas } from "@/ui-builder/BuilderCanvas";
import { CanvasToolbar } from "@/ui-builder/CanvasToolbar";
import { InspectorPanel } from "@/ui-builder/InspectorPanel";
import { CodePreviewPanel } from "@/ui-builder/CodePreviewPanel";
import { ComponentPalette, LayoutPreset } from "@/ui-builder/ComponentPalette";

export default function PageBuilder() {
  const builder = useUiBuilder();
  const {
    clearCanvas, loadNodes, copyNode, pasteNode,
    toggleNodeVisibility, toggleNodeLock, renameNode,
    undo, redo, canUndo, canRedo, exportJSON, importJSON,
    toggleCode, toggleLayers, toggleGrid, togglePreview, setZoom, setDirection,
    state, selectedNode, addNode, insertNode, deleteNode, moveNode, duplicateNode, selectNode,
    updateNodeProps, updateNodeStyles, updateNodeStylesAtBreakpoint, moveNodeByOffset, setBreakpoint,
  } = builder;
  const [activeId, setActiveId] = useState<string | null>(null);
  void activeId; // referenced for future overlay; setter is what we use

  const handleInsertLayout = useCallback((preset: LayoutPreset) => {
    const items = preset.create();
    let insertIndex = state.nodes.length;
    for (const item of items) {
      const node = createNode(item.type);
      if (!node) continue;
      if (item.propsOverride) {
        Object.assign(node.props, item.propsOverride);
      }
      if (item.stylesOverride) {
        Object.assign(node.styles.base, item.stylesOverride);
      }
      insertNode(node, null, insertIndex++);
    }
  }, [insertNode, state.nodes.length]);

  // The provider hands us a complete snapshot at drop-end (after global hit
  // testing). We read the active snapshot once and route by source.
  // Find the deepest hovered drop zone by querying the provider's hover state
  // is unnecessary — instead, the global pointermove already wrote the
  // [data-dnd-over="true"] attribute on the winning zone. We pick that zone
  // and read its data-dnd-zone id, then map to parentId.
  const handleDragEnd = useCallback((snap: DragSnapshot, dropped: boolean) => {
    setActiveId(null);
    if (!dropped) return;

    // Find the deepest drop zone that won the drop.
    const overEls = document.querySelectorAll<HTMLElement>('[data-dnd-zone][data-dnd-over="true"]');
    if (overEls.length === 0) return;
    // Pick the smallest (deepest) of the matched zones.
    let target = overEls[0];
    for (const el of overEls) {
      const a = target.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      if (b.width * b.height < a.width * a.height) target = el;
    }
    const zoneId = target.getAttribute("data-dnd-zone") || "";
    const data = snap.data as { source?: string; type?: string; nodeId?: string };
    const source = data?.source;
    const type = data?.type;

    // Resolve parent container id from the zone id convention used in
    // RenderNode/BuilderCanvas: "canvas-root" or "droppable-<id>".
    const parentId = zoneId === "canvas-root"
      ? null
      : zoneId.startsWith("droppable-") ? zoneId.slice("droppable-".length) : null;

    if (source === "palette" && type) {
      // The provider's resolveDropIndex already gave us the insertion index
      // — but we don't receive it here directly. Use children length as
      // append-by-default; for in-canvas zones the user typically drops to
      // append a new component. (Insertion-mid-list for palette is rare.)
      if (parentId === null) {
        addNode(type, null, state.nodes.length);
      } else {
        addNode(type, parentId);
      }
      return;
    }

    if (source === "canvas" && data?.nodeId) {
      const movingId = data.nodeId;
      // Don't allow dropping a node into itself.
      if (movingId === parentId) return;
      if (parentId === null) {
        moveNode(movingId, null, state.nodes.length);
      } else {
        moveNode(movingId, parentId, 0);
      }
    }
  }, [addNode, moveNode, state.nodes.length]);

  const handleDragStart = useCallback((snap: DragSnapshot) => {
    setActiveId(snap.id);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === "y" && (e.ctrlKey || e.metaKey)) || (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)) { e.preventDefault(); redo(); }
      if ((e.key === "Delete" || e.key === "Backspace") && state.selectedId) { e.preventDefault(); deleteNode(state.selectedId); }
      if (e.key === "d" && (e.ctrlKey || e.metaKey) && state.selectedId) { e.preventDefault(); duplicateNode(state.selectedId); }
      if (e.key === "c" && (e.ctrlKey || e.metaKey) && state.selectedId) { e.preventDefault(); copyNode(state.selectedId); }
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); pasteNode(); }
      if (e.key === "Escape") { selectNode(null); }
      if (e.key === "L" && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); toggleLayers(); }
      if (e.key === "C" && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); toggleCode(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, deleteNode, duplicateNode, copyNode, pasteNode, selectNode, toggleLayers, toggleCode, state.selectedId]);

  // Scroll zoom
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(state.zoom + (e.deltaY < 0 ? 10 : -10));
      }
    };
    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, [setZoom, state.zoom]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-4 py-1.5 border-b border-border">
          <PageBreadcrumb items={[{ label: "Page Builder" }]} />
        </div>

        <CanvasToolbar
          onUndo={undo}
          onRedo={redo}
          onZoom={setZoom}
          zoom={state.zoom}
          canUndo={canUndo}
          canRedo={canRedo}
          onClear={clearCanvas}
          showCode={state.showCode}
          showGrid={state.showGrid}
          onToggleCode={toggleCode}
          onToggleGrid={toggleGrid}
          onExportJSON={exportJSON}
          onImportJSON={importJSON}
          onLoadTemplate={loadNodes}
          onDirection={setDirection}
          direction={state.direction}
          onBreakpoint={setBreakpoint}
          breakpoint={state.breakpoint}
          showLayers={state.showLayers}
          onToggleLayers={toggleLayers}
          onTogglePreview={togglePreview}
          interactivePreview={state.interactivePreview}
        />

        <DndProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 90px)" }}>
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel defaultSize={14} minSize={10} maxSize={22}>
                <ComponentPalette onInsertLayout={handleInsertLayout} />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={state.showCode ? 45 : (state.showLayers ? 50 : 60)}>
                <div className="flex h-full">
                  {state.showLayers && (
                    <LayerPanel
                      nodes={state.nodes}
                      onSelect={selectNode}
                      onRename={renameNode}
                      onToggleLock={toggleNodeLock}
                      selectedId={state.selectedId}
                      onToggleVisibility={toggleNodeVisibility}
                    />
                  )}
                  <BuilderCanvas
                    nodes={state.nodes}
                    breakpoint={state.breakpoint}
                    selectedId={state.selectedId}
                    showGrid={state.showGrid}
                    interactivePreview={state.interactivePreview}
                    zoom={state.zoom}
                    direction={state.direction}
                    onSelect={selectNode}
                    onDelete={deleteNode}
                    onDuplicate={duplicateNode}
                    onLoadTemplate={loadNodes}
                  />
                </div>
              </ResizablePanel>

              {state.showCode && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                    <CodePreviewPanel nodes={state.nodes} />
                  </ResizablePanel>
                </>
              )}

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <InspectorPanel
                  selectedNode={selectedNode}
                  breakpoint={state.breakpoint}
                  onUpdateProps={updateNodeProps}
                  onUpdateStyles={updateNodeStyles}
                  onUpdateStylesAtBreakpoint={updateNodeStylesAtBreakpoint}
                  onMoveNode={moveNodeByOffset}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </DndProvider>
      </div>
    </TooltipProvider>
  );
}
