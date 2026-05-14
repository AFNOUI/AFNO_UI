"use client";

import { Panel } from "reactflow";
import "reactflow/dist/style.css";
import { Target } from "lucide-react";
import "@/schema-engine/styles/schema-engine.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  useReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeTypes,
  type NodeTypes,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type OnNodesChange,
  type OnEdgesChange,
  type ReactFlowInstance,
} from "reactflow";

import type { VirtualSchema } from "@/schema-engine/types/types";
import { useDagreLayout } from "@/schema-engine/hooks/useDagreLayout";
import { schemaEngineStore, useSchemaEngineState } from "@/schema-engine/store/schemaEngineStore";

import { TableNode } from "./TableNode";
import { RelationEdge } from "./RelationEdge";
import { schemaToFlow, type TableNodeData, type RelationEdgeData } from "@/schema-engine/index";

const NODE_TYPES: NodeTypes = { tableNode: TableNode };
const EDGE_TYPES: EdgeTypes = { relation: RelationEdge };

interface Props {
  schema: VirtualSchema;
  /** Direction of dagre layout. */
  direction?: "LR" | "TB";
  /** Called when a table node is clicked. */
  onSelectTable: (table: string | null) => void;
}

export function SchemaCanvas(props: Props) {
  // The advanced MiniMap needs access to the React Flow instance, which is
  // only available inside a ReactFlowProvider. Wrap once at the top level.
  return (
    <ReactFlowProvider>
      <SchemaCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

const FIT_OPTIONS = { padding: 0.15, maxZoom: 1.25, duration: 220 } as const;

function SchemaCanvasInner({ schema, direction = "LR", onSelectTable }: Props) {
  const initial = useMemo(() => schemaToFlow(schema), [schema]);
  const laidOutNodes = useDagreLayout(initial.nodes, initial.edges, direction);

  const [nodes, setNodes] = useState<Node<TableNodeData>[]>(laidOutNodes);
  const [edges, setEdges] = useState<Edge<RelationEdgeData>[]>(initial.edges);
  const { setCenter, getNode, fitView } = useReactFlow();

  const runFit = useCallback(
    (instance: Pick<ReactFlowInstance, "fitView">, animate: boolean) => {
      const opts = animate ? FIT_OPTIONS : { ...FIT_OPTIONS, duration: 0 };
      void instance.fitView(opts);
    },
    [],
  );

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      if (laidOutNodes.length === 0) return;
      // First paint: viewport often has no measured size yet — fit twice (immediate
      // + next frame) so the first navigation to this page matches the manual
      // "fit view" control without requiring a click.
      runFit(instance, false);
      requestAnimationFrame(() => runFit(instance, true));
    },
    [laidOutNodes.length, runFit],
  );

  // Re-sync when the parsed schema or layout direction changes.
  useEffect(() => {
    setNodes(laidOutNodes);
    setEdges(initial.edges);
  }, [laidOutNodes, initial.edges]);

  // Re-fit when Dagre layout or direction changes — not when the user drags nodes
  // (local `nodes` state updates on drag; `laidOutNodes` stays tied to the schema).
  useEffect(() => {
    if (laidOutNodes.length === 0) return;
    const id = requestAnimationFrame(() => {
      void fitView(FIT_OPTIONS);
    });
    const t = window.setTimeout(() => {
      void fitView(FIT_OPTIONS);
    }, 80);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [laidOutNodes, initial.edges, direction, fitView]);

  const onNodesChange = useCallback<OnNodesChange>(
    (changes) => setNodes(ns => applyNodeChanges(changes, ns) as Node<TableNodeData>[]),
    [],
  );
  const onEdgesChange = useCallback<OnEdgesChange>(
    (changes) => setEdges(es => applyEdgeChanges(changes, es) as Edge<RelationEdgeData>[]),
    [],
  );

  // Hover — pulse all edges where the hovered table is source or target.
  const onNodeMouseEnter = useCallback<NodeMouseHandler>((_, node) => {
    const connected = edges.filter(e => e.source === node.id || e.target === node.id).map(e => e.id);
    schemaEngineStore.setHover(node.id, connected);
  }, [edges]);
  const onNodeMouseLeave = useCallback<NodeMouseHandler>(() => {
    schemaEngineStore.setHover(null, []);
  }, []);
  const onNodeClick = useCallback<NodeMouseHandler>((_, node) => {
    schemaEngineStore.setSelected(node.id);
    onSelectTable(node.id);
  }, [onSelectTable]);

  // Per-table relationship degree (in + out) used to colour the minimap.
  const degreeMap = useMemo(() => {
    const m = new Map<string, number>();
    edges.forEach(e => {
      m.set(e.source, (m.get(e.source) ?? 0) + 1);
      m.set(e.target, (m.get(e.target) ?? 0) + 1);
    });
    return m;
  }, [edges]);
  const maxDegree = useMemo(
    () => Math.max(1, ...Array.from(degreeMap.values())),
    [degreeMap],
  );

  const hoveredTable = useSchemaEngineState(s => s.hoveredTable);
  const selectedTable = useSchemaEngineState(s => s.selectedTable);

  const minimapNodeColor = useCallback((n: Node) => {
    if (n.id === selectedTable) return "hsl(var(--primary))";
    if (n.id === hoveredTable)  return "hsl(var(--primary) / 0.7)";
    const deg = degreeMap.get(n.id) ?? 0;
    if (deg === 0) return "hsl(var(--muted))";
    // Lerp between a cool and a warm hue based on relationship density.
    const t = deg / maxDegree;
    // Cool teal → warm orange via mix.
    return `color-mix(in oklab, hsl(180 65% 55%) ${(1 - t) * 100}%, hsl(20 90% 60%) ${t * 100}%)`;
  }, [degreeMap, maxDegree, hoveredTable, selectedTable]);

  const minimapStrokeColor = useCallback((n: Node) => {
    if (n.id === selectedTable || n.id === hoveredTable) return "hsl(var(--primary))";
    return "hsl(var(--border))";
  }, [hoveredTable, selectedTable]);

  // Click on a minimap node → centre & select it.
  const onMinimapNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const n = getNode(node.id);
    if (!n) return;
    setCenter(n.position.x + 140, n.position.y + 120, { zoom: 1.2, duration: 600 });
    schemaEngineStore.setSelected(node.id);
    onSelectTable(node.id);
  }, [getNode, setCenter, onSelectTable]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onInit={onInit}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onNodeClick={onNodeClick}
      onPaneClick={() => { schemaEngineStore.setSelected(null); onSelectTable(null); }}
      minZoom={0.15}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: "relation" }}
      className="min-h-0 min-w-0"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-muted/20" />

      {/* ───────────── MiniMap — simple, clean, native React Flow positioning ───────────── */}
      <MiniMap
        pannable
        zoomable
        onNodeClick={onMinimapNodeClick}
        nodeColor={minimapNodeColor}
        nodeStrokeColor={minimapStrokeColor}
        nodeStrokeWidth={3}
        nodeBorderRadius={3}
        maskColor="hsl(var(--background) / 0.6)"
        maskStrokeColor="hsl(var(--primary) / 0.7)"
        maskStrokeWidth={2}
        position="bottom-right"
        className="schema-engine-minimap"
        style={{ width: 200, height: 140 }}
      />

      {/* Legend chip — width matches the MiniMap (200px) and sits flush above it */}
      <Panel position="bottom-right" className="!mb-[160px] !mr-3 !mt-0">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/95 backdrop-blur border border-border text-[10px] text-muted-foreground shadow-sm"
          style={{ width: 200 }}
        >
          <Target size={11} className="text-primary shrink-0" />
          <span className="font-semibold text-foreground">Map</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="tabular-nums">{nodes.length}t · {edges.length}r</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="schema-engine-swatch schema-engine-swatch-cool" />
            <span>sparse</span>
            <span className="schema-engine-swatch schema-engine-swatch-warm" />
            <span>dense</span>
          </span>
        </div>
      </Panel>

      <Controls
        className="!bg-card !border-border !rounded-md !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button:hover]:!bg-primary/10 [&>button:hover]:!text-primary"
      />

    </ReactFlow>
  );
}
