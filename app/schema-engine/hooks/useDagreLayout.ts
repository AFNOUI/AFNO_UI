/**
 * Auto-layout hook — runs dagre on the current nodes/edges and returns
 * positioned copies. Memoized on (count, edge fingerprint) so repeated renders
 * don't recompute the layout.
 */
import dagre from "dagre";
import { useMemo } from "react";
import type { Edge, Node } from "reactflow";

import type { TableNodeData } from "@/schema-engine/index";

const NODE_WIDTH = 280;
const HEADER_H = 44;
const ROW_H = 26;

export function useDagreLayout(
  nodes: Node<TableNodeData>[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR",
): Node<TableNodeData>[] {
  return useMemo(() => {
    if (nodes.length === 0) return nodes;
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 120, marginx: 24, marginy: 24 });

    nodes.forEach(n => {
      const h = HEADER_H + (n.data.table.columns.length * ROW_H) + 16;
      g.setNode(n.id, { width: NODE_WIDTH, height: h });
    });
    edges.forEach(e => g.setEdge(e.source, e.target));

    dagre.layout(g);

    return nodes.map(n => {
      const pos = g.node(n.id);
      if (!pos) return n;
      return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - (HEADER_H + n.data.table.columns.length * ROW_H + 16) / 2 } };
    });
  }, [nodes, edges, direction]);
}
