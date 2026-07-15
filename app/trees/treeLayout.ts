/**
 * Pure layout algorithms for the TreeCanvas. No external graph library —
 * every layout produces an `id → { x, y, width, height }` map plus a list of
 * connector segments.
 *
 * Coordinates are in canvas-pixel space; the renderer wraps them in a
 * pan/zoomable SVG + absolutely-positioned DOM nodes.
 */
import type { TreeLayout, TreeNode } from "./types";

export interface LayoutNode {
  id: string;
  node: TreeNode;
  parentId: string | null;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutEdge {
  fromId: string;
  toId: string;
  /** Connector path — the renderer chooses how to stroke it. */
  points: { x: number; y: number }[];
  /** Optional label rendered at the midpoint of the edge. */
  label?: string;
}

export interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

interface LayoutOpts {
  siblingGap: number;
  levelGap: number;
  nodeWidth: number;
  nodeHeight: number;
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

function flattenWithDepth(root: TreeNode): { node: TreeNode; depth: number; parentId: string | null }[] {
  const out: { node: TreeNode; depth: number; parentId: string | null }[] = [];
  const walk = (n: TreeNode, d: number, p: string | null) => {
    out.push({ node: n, depth: d, parentId: p });
    n.children?.forEach((c) => walk(c, d + 1, n.id));
  };
  walk(root, 0, null);
  return out;
}

/** Returns the number of leaves under a node — used to size sibling spans. */
function leafCount(n: TreeNode): number {
  if (!n.children?.length) return 1;
  return n.children.reduce((s, c) => s + leafCount(c), 0);
}

/* ------------------------------------------------------------------ */
/*  Horizontal — root on the left, generations marching right.         */
/*  This produces the "pipeline / workflow" feel from the reference.   */
/* ------------------------------------------------------------------ */

function layoutHorizontal(root: TreeNode, o: LayoutOpts): LayoutResult {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const colWidth = o.nodeWidth + o.levelGap;

  // First pass: compute Y center per node by giving each leaf a row, then
  // averaging children's centers up the tree.
  const yCenter = new Map<string, number>();
  let leafCursor = 0;
  const rowHeight = o.nodeHeight + o.siblingGap;
  const computeY = (n: TreeNode): number => {
    if (!n.children?.length) {
      const y = leafCursor * rowHeight + o.nodeHeight / 2;
      leafCursor++;
      yCenter.set(n.id, y);
      return y;
    }
    const childYs = n.children.map(computeY);
    const y = (childYs[0] + childYs[childYs.length - 1]) / 2;
    yCenter.set(n.id, y);
    return y;
  };
  computeY(root);

  flattenWithDepth(root).forEach(({ node, depth, parentId }) => {
    const cy = yCenter.get(node.id) ?? 0;
    const x = depth * colWidth;
    const y = cy - o.nodeHeight / 2;
    nodes.push({ id: node.id, node, parentId, depth, x, y, width: o.nodeWidth, height: o.nodeHeight });
    if (parentId) {
      const parent = nodes.find((n) => n.id === parentId)!;
      edges.push({
        fromId: parentId, toId: node.id,
        points: [
          { x: parent.x + parent.width, y: parent.y + parent.height / 2 },
          { x: x, y: y + o.nodeHeight / 2 },
        ],
      });
    }
  });

  const width = (Math.max(...nodes.map((n) => n.depth)) + 1) * colWidth;
  const height = leafCursor * rowHeight;
  return { nodes, edges, width, height };
}

/* ------------------------------------------------------------------ */
/*  Vertical — top → bottom org chart                                  */
/* ------------------------------------------------------------------ */

function layoutVertical(root: TreeNode, o: LayoutOpts): LayoutResult {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const rowHeight = o.nodeHeight + o.levelGap;
  const colWidth = o.nodeWidth + o.siblingGap;

  const xCenter = new Map<string, number>();
  let leafCursor = 0;
  const computeX = (n: TreeNode): number => {
    if (!n.children?.length) {
      const x = leafCursor * colWidth + o.nodeWidth / 2;
      leafCursor++;
      xCenter.set(n.id, x);
      return x;
    }
    const childXs = n.children.map(computeX);
    const x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    xCenter.set(n.id, x);
    return x;
  };
  computeX(root);

  flattenWithDepth(root).forEach(({ node, depth, parentId }) => {
    const cx = xCenter.get(node.id) ?? 0;
    const y = depth * rowHeight;
    const x = cx - o.nodeWidth / 2;
    nodes.push({ id: node.id, node, parentId, depth, x, y, width: o.nodeWidth, height: o.nodeHeight });
    if (parentId) {
      const parent = nodes.find((n) => n.id === parentId)!;
      edges.push({
        fromId: parentId, toId: node.id,
        points: [
          { x: parent.x + parent.width / 2, y: parent.y + parent.height },
          { x: x + o.nodeWidth / 2, y: y },
        ],
      });
    }
  });

  const width = leafCursor * colWidth;
  const height = (Math.max(...nodes.map((n) => n.depth)) + 1) * rowHeight;
  return { nodes, edges, width, height };
}

/* ------------------------------------------------------------------ */
/*  Radial — root in centre, descendants on concentric rings           */
/* ------------------------------------------------------------------ */

function layoutRadial(root: TreeNode, o: LayoutOpts): LayoutResult {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const ringStep = o.nodeWidth + o.levelGap;
  const totalLeaves = leafCount(root);
  const TAU = Math.PI * 2;

  // Assign each node an angular slice proportional to its leaf count.
  const sliceMap = new Map<string, { start: number; end: number }>();
  sliceMap.set(root.id, { start: 0, end: TAU });
  const assign = (n: TreeNode) => {
    const slice = sliceMap.get(n.id)!;
    if (!n.children?.length) return;
    let cursor = slice.start;
    const span = slice.end - slice.start;
    for (const c of n.children) {
      const portion = span * (leafCount(c) / leafCount(n));
      sliceMap.set(c.id, { start: cursor, end: cursor + portion });
      cursor += portion;
      assign(c);
    }
  };
  assign(root);

  let maxR = 0;
  flattenWithDepth(root).forEach(({ node, depth, parentId }) => {
    const slice = sliceMap.get(node.id)!;
    const angle = (slice.start + slice.end) / 2;
    const r = depth === 0 ? 0 : depth * ringStep;
    maxR = Math.max(maxR, r);
    const cx = r * Math.cos(angle - Math.PI / 2);
    const cy = r * Math.sin(angle - Math.PI / 2);
    nodes.push({
      id: node.id, node, parentId, depth,
      x: cx - o.nodeWidth / 2, y: cy - o.nodeHeight / 2,
      width: o.nodeWidth, height: o.nodeHeight,
    });
    if (parentId) {
      const p = nodes.find((n) => n.id === parentId)!;
      edges.push({
        fromId: parentId, toId: node.id,
        points: [
          { x: p.x + p.width / 2, y: p.y + p.height / 2 },
          { x: cx, y: cy },
        ],
      });
    }
  });

  // Translate so coords are >= 0
  const offset = maxR + o.nodeWidth;
  nodes.forEach((n) => { n.x += offset; n.y += offset; });
  edges.forEach((e) => e.points.forEach((p) => { p.x += offset; p.y += offset; }));
  const size = offset * 2;
  // suppress unused warning
  void totalLeaves;
  return { nodes, edges, width: size, height: size };
}

/* ------------------------------------------------------------------ */
/*  Mindmap — root in middle, branches alternate left/right            */
/* ------------------------------------------------------------------ */

function layoutMindmap(root: TreeNode, o: LayoutOpts): LayoutResult {
  const left: TreeNode = { id: "__l", label: "", children: [] };
  const right: TreeNode = { id: "__r", label: "", children: [] };
  (root.children ?? []).forEach((c, i) => {
    if (i % 2 === 0) right.children!.push(c);
    else left.children!.push(c);
  });

  const r = layoutHorizontal({ ...root, children: right.children }, o);
  const l = layoutHorizontal({ ...root, children: left.children }, o);

  // Mirror left side around root x = 0
  const lNodes = l.nodes.filter((n) => n.id !== root.id).map((n) => ({
    ...n,
    x: -n.x - n.width,
  }));
  const lEdges = l.edges.map((e) => ({
    ...e,
    points: e.points.map((p) => ({ x: -p.x, y: p.y })),
  }));

  const allNodes: LayoutNode[] = [
    ...r.nodes,
    ...lNodes,
  ];
  const allEdges: LayoutEdge[] = [...r.edges, ...lEdges];

  const minX = Math.min(0, ...allNodes.map((n) => n.x));
  const maxX = Math.max(...allNodes.map((n) => n.x + n.width));
  const minY = Math.min(...allNodes.map((n) => n.y));
  const maxY = Math.max(...allNodes.map((n) => n.y + n.height));

  allNodes.forEach((n) => { n.x -= minX; n.y -= minY; });
  allEdges.forEach((e) => e.points.forEach((p) => { p.x -= minX; p.y -= minY; }));

  return { nodes: allNodes, edges: allEdges, width: maxX - minX, height: maxY - minY };
}

/* ------------------------------------------------------------------ */
/*  Org — vertical with extra spacing + boxed connectors               */
/* ------------------------------------------------------------------ */

function layoutOrg(root: TreeNode, o: LayoutOpts): LayoutResult {
  return layoutVertical(root, {
    ...o,
    siblingGap: o.siblingGap + 24,
    levelGap: o.levelGap + 28,
  });
}

/* ------------------------------------------------------------------ */
/*  Public entry                                                       */
/* ------------------------------------------------------------------ */

export function computeLayout(
  root: TreeNode,
  layout: TreeLayout,
  opts: Partial<LayoutOpts> = {},
): LayoutResult {
  const merged: LayoutOpts = {
    siblingGap: opts.siblingGap ?? 24,
    levelGap: opts.levelGap ?? 96,
    nodeWidth: opts.nodeWidth ?? 168,
    nodeHeight: opts.nodeHeight ?? 64,
  };
  let result: LayoutResult;
  switch (layout) {
    case "horizontal": result = layoutHorizontal(root, merged); break;
    case "vertical":   result = layoutVertical(root, merged); break;
    case "radial":     result = layoutRadial(root, merged); break;
    case "mindmap":    result = layoutMindmap(root, merged); break;
    case "org":        result = layoutOrg(root, merged); break;
  }
  // Decorate edges with the child node's `meta.edgeLabel` so the renderer can
  // draw "More than $50K" / "Good / Bad" style midpoint pills (n8n / mindmap).
  const labelByChildId = new Map<string, string>();
  const collect = (n: TreeNode) => {
    if (n.meta?.edgeLabel) labelByChildId.set(n.id, n.meta.edgeLabel);
    n.children?.forEach(collect);
  };
  collect(root);
  result.edges = result.edges.map((e) =>
    labelByChildId.has(e.toId) ? { ...e, label: labelByChildId.get(e.toId) } : e,
  );
  return result;
}
