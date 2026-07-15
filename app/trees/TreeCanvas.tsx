"use client";

/**
 * TreeCanvas — config-driven, zero-dependency tree renderer.
 *
 * Supports five layouts (horizontal · vertical · radial · mindmap · org),
 * pan + zoom, inline label editing, add/remove buttons and native pointer-based
 * drag-and-drop (reparent / make-sibling-before / make-sibling-after).
 *
 * Every mutation fires a separate handler so consumers can wire their own
 * backend without forking the engine:
 *
 *   <TreeCanvas
 *     config={{ layout: "horizontal", editable: true, draggable: true, ... }}
 *     tree={tree}
 *     onTreeChange={setTree}
 *     onNodeAdd={(e)    => api.create(e.parent.id, e.newNode)}
 *     onNodeUpdate={(e) => api.patch(e.node.id, { label: e.node.label })}
 *     onNodeRemove={(e) => api.delete(e.node.id)}
 *     onNodeMove={(e)   => api.move(e.node.id, e.next)}
 *   />
 */
import {
  useCallback, useMemo, useRef, useState, useEffect,
  type CSSProperties, type PointerEvent as ReactPointerEvent,
} from "react";
import { Plus, Pencil, Trash2, Check, X, Lock, GripVertical, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  TreeCanvasConfig, TreeNode, TreeCanvasHandlers, TreeMoveMode,
  NodeRenderer,
} from "./types";
import { computeLayout, type LayoutEdge, type LayoutNode } from "./treeLayout";

interface Props extends TreeCanvasHandlers {
  config: TreeCanvasConfig;
  tree: TreeNode;
  onTreeChange?: (next: TreeNode) => void;
  className?: string;
  /** Set of ids that pass an external filter — non-matches are dimmed. */
  highlightIds?: Set<string>;
}

/* ---------- pure tree utilities (immutable) ---------- */

function findParent(root: TreeNode, id: string, parent: TreeNode | null = null): TreeNode | null {
  if (root.id === id) return parent;
  for (const c of root.children ?? []) {
    const r = findParent(c, id, root);
    if (r !== null) return r;
  }
  return null;
}
function findNode(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root;
  for (const c of root.children ?? []) {
    const r = findNode(c, id);
    if (r) return r;
  }
  return null;
}
function indexInParent(parent: TreeNode | null, id: string): number {
  if (!parent?.children) return -1;
  return parent.children.findIndex((c) => c.id === id);
}
function isDescendant(root: TreeNode, ancestorId: string, candidateId: string): boolean {
  const a = findNode(root, ancestorId);
  if (!a) return false;
  return !!findNode(a, candidateId);
}
function mapTree(root: TreeNode, fn: (n: TreeNode) => TreeNode): TreeNode {
  const next = fn(root);
  return { ...next, children: next.children?.map((c) => mapTree(c, fn)) };
}
function removeFromTree(root: TreeNode, id: string): TreeNode {
  return {
    ...root,
    children: (root.children ?? [])
      .filter((c) => c.id !== id)
      .map((c) => removeFromTree(c, id)),
  };
}
function collectSubtreeIds(n: TreeNode, out: Set<string> = new Set()): Set<string> {
  out.add(n.id);
  n.children?.forEach((c) => collectSubtreeIds(c, out));
  return out;
}
/** Move `nodeId` to become a child / sibling of `targetId` and return the new tree. */
function moveNode(
  root: TreeNode,
  nodeId: string,
  targetId: string,
  mode: TreeMoveMode,
): { tree: TreeNode; next: { parentId: string; index: number } } | null {
  if (nodeId === targetId) return null;
  if (nodeId === root.id) return null;
  if (isDescendant(root, nodeId, targetId)) return null; // can't drop into own subtree

  const node = findNode(root, nodeId);
  if (!node) return null;

  // Detach
  const stripped = removeFromTree(root, nodeId);

  if (mode === "child") {
    const next = mapTree(stripped, (n) =>
      n.id === targetId ? { ...n, children: [...(n.children ?? []), node] } : n,
    );
    const parent = findNode(next, targetId);
    return { tree: next, next: { parentId: targetId, index: (parent?.children?.length ?? 1) - 1 } };
  }

  // before / after — insert as sibling of target
  const targetParent = findParent(stripped, targetId);
  if (!targetParent) return null; // target was root
  const insertIdx = indexInParent(targetParent, targetId) + (mode === "after" ? 1 : 0);
  const next = mapTree(stripped, (n) => {
    if (n.id !== targetParent.id) return n;
    const kids = [...(n.children ?? [])];
    kids.splice(insertIdx, 0, node);
    return { ...n, children: kids };
  });
  return { tree: next, next: { parentId: targetParent.id, index: insertIdx } };
}
function uid(): string {
  return `n_${Math.random().toString(36).slice(2, 9)}`;
}

/* ---------- main component ---------- */

export function TreeCanvas({
  config, tree, onTreeChange,
  onNodeAdd, onNodeUpdate, onNodeRemove, onNodeMove, onNodeClick,
  highlightIds, className,
}: Props) {
  const rawLayout = useMemo(
    () => computeLayout(tree, config.layout, {
      siblingGap: config.siblingGap,
      levelGap: config.levelGap,
    }),
    [tree, config.layout, config.siblingGap, config.levelGap],
  );

  // Resolve direction (explicit config wins, otherwise the document direction).
  const dir: "ltr" | "rtl" = config.dir
    ?? (typeof document !== "undefined" && document.dir === "rtl" ? "rtl" : "ltr");
  const horizontalAxisLayout = config.layout === "horizontal" || config.layout === "mindmap";

  /**
   * Apply RTL mirror (horizontal layouts only) + per-node free-position offsets.
   * Edges are mirrored/shifted by the same amount so connectors stay glued.
   */
  const layout = useMemo(() => {
    const offsetById = new Map<string, { dx: number; dy: number }>();
    const collect = (n: TreeNode) => {
      if (n.meta?.positionOffset) offsetById.set(n.id, n.meta.positionOffset);
      n.children?.forEach(collect);
    };
    collect(tree);
    const mirror = dir === "rtl" && horizontalAxisLayout;
    const w = rawLayout.width;
    const adjust = (x: number, width: number) => mirror ? w - x - width : x;
    const adjustPt = (x: number) => mirror ? w - x : x;
    return {
      ...rawLayout,
      nodes: rawLayout.nodes.map((n) => {
        const off = offsetById.get(n.id) ?? { dx: 0, dy: 0 };
        return { ...n, x: adjust(n.x, n.width) + off.dx, y: n.y + off.dy };
      }),
      edges: rawLayout.edges.map((e) => {
        const fromOff = offsetById.get(e.fromId) ?? { dx: 0, dy: 0 };
        const toOff = offsetById.get(e.toId) ?? { dx: 0, dy: 0 };
        const pts = e.points.map((p, i) => {
          const off = i === 0 ? fromOff : toOff;
          return { x: adjustPt(p.x) + off.dx, y: p.y + off.dy };
        });
        // RTL horizontal: swap parent/child endpoint ordering so curves still point outward.
        return { ...e, points: mirror ? [pts[pts.length - 1], pts[0]] : pts };
      }),
    };
  }, [rawLayout, tree, dir, horizontalAxisLayout]);

  const readOnly = config.readOnly === true;
  const allowAdd    = !readOnly && (config.allowAdd    ?? true);
  const allowEdit   = !readOnly && (config.allowEdit   ?? true);
  const allowDelete = !readOnly && (config.allowDelete ?? true);
  const allowDragG  = !readOnly && (config.allowDrag   ?? true);
  const editable    = !readOnly && config.editable !== false && (allowAdd || allowEdit || allowDelete);
  const draggable   = !readOnly && config.draggable === true && allowDragG;
  const structuredDndEnabled = !readOnly && allowDragG && (["child", "before", "after"] as const)
    .some((mode) => (config.dragModes?.[mode] ?? true) !== false);

  /** Per-node permission resolver — global flag wins, node `meta.permissions` can only further restrict. */
  const nodeCan = (n: TreeNode, kind: "add" | "edit" | "delete" | "drag"): boolean => {
    const globalOk = kind === "add" ? allowAdd : kind === "edit" ? allowEdit : kind === "delete" ? allowDelete : allowDragG;
    if (!globalOk) return false;
    if (n.meta?.locked) return false;
    const perm = n.meta?.permissions?.[kind];
    return perm !== false;
  };

  /* ---- pan + zoom (only when enabled) ---- */
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 24, y: 24 });
  const panRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const onCanvasPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!config.panZoom) return;
    if ((e.target as HTMLElement).closest("[data-tree-node]")) return;
    panRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onCanvasPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!panRef.current) return;
    setOffset({
      x: panRef.current.ox + (e.clientX - panRef.current.x),
      y: panRef.current.oy + (e.clientY - panRef.current.y),
    });
  };
  const onCanvasPointerUp = () => { panRef.current = null; };
  useEffect(() => {
    if (!config.panZoom) { setZoom(1); setOffset({ x: 24, y: 24 }); }
  }, [config.panZoom, config.layout]);

  /* ---- wheel / pinch zoom (touchpad pinch fires wheel + ctrlKey) ---- */
  const wheelHostRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = wheelHostRef.current;
    if (!el || !config.panZoom) return;
    const onWheel = (e: WheelEvent) => {
      // Touchpad pinch (Mac/Win) emits wheel with ctrlKey; Ctrl/Cmd+wheel = explicit zoom.
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setZoom((z) => {
        const factor = Math.exp(-e.deltaY * 0.0015);
        const next = Math.min(2, Math.max(0.4, z * factor));
        // Keep the point under the cursor stable.
        setOffset((o) => ({
          x: px - ((px - o.x) * next) / z,
          y: py - ((py - o.y) * next) / z,
        }));
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [config.panZoom]);

  /* ---- mutations ---- */

  const commit = useCallback((next: TreeNode) => {
    onTreeChange?.(next);
    return next;
  }, [onTreeChange]);

  // Plain functions (no useCallback): the React Compiler auto-memoizes them.
  // Manual memoization can't be preserved here because `nodeCan` is a render-scope
  // helper, so we let the compiler handle it (repo convention).
  const handleAddChild = (parentId: string, blueprintId?: string) => {
    const parent = findNode(tree, parentId);
    if (!parent || !nodeCan(parent, "add")) return;
    const max = parent.meta?.maxChildren;
    if (max != null && (parent.children?.length ?? 0) >= max) return;
    const blueprint = blueprintId ? config.nodeBlueprints?.[blueprintId] : undefined;
    const newNode: TreeNode = blueprint
      ? {
          id: uid(),
          label: blueprint.label,
          meta: { ...(blueprint.meta ?? {}), blueprintId },
        }
      : { id: uid(), label: "New Step" };
    const next = mapTree(tree, (n) =>
      n.id === parentId ? { ...n, children: [...(n.children ?? []), newNode] } : n,
    );
    commit(next);
    const updatedParent = findNode(next, parentId)!;
    onNodeAdd?.({ parent: updatedParent, newNode, tree: next });
  };


  /** Reorder a node within its current parent by ±1 (chevron controls). */
  const handleReorder = useCallback((id: string, dir: -1 | 1) => {
    const parent = findParent(tree, id);
    if (!parent?.children) return;
    const idx = parent.children.findIndex((c) => c.id === id);
    const targetIdx = idx + dir;
    if (idx < 0 || targetIdx < 0 || targetIdx >= parent.children.length) return;
    const next = mapTree(tree, (n) => {
      if (n.id !== parent.id) return n;
      const kids = [...(n.children ?? [])];
      [kids[idx], kids[targetIdx]] = [kids[targetIdx], kids[idx]];
      return { ...n, children: kids };
    });
    commit(next);
    const node = findNode(next, id);
    if (node) {
      onNodeMove?.({
        node,
        prev: { parentId: parent.id, index: idx },
        next: { parentId: parent.id, index: targetIdx, mode: dir > 0 ? "after" : "before" },
        tree: next,
      });
    }
  }, [tree, commit, onNodeMove]);


  const handleUpdateLabel = (id: string, label: string) => {
    const prev = findNode(tree, id);
    if (!prev || !nodeCan(prev, "edit")) return;
    const next = mapTree(tree, (n) => (n.id === id ? { ...n, label } : n));
    commit(next);
    const updated = findNode(next, id)!;
    onNodeUpdate?.({ node: updated, prev, tree: next });
  };

  const handleRemove = (id: string) => {
    if (id === tree.id) return;
    const node = findNode(tree, id);
    const parent = findParent(tree, id);
    if (!node || !nodeCan(node, "delete")) return;
    const next = removeFromTree(tree, id);
    commit(next);
    onNodeRemove?.({ node, parent, tree: next });
  };

  /* ---- drag-and-drop (whole-node grab with 5px activation distance) ----
   *
   * Two distinct interactions share one pointer pipeline:
   *
   *   • "free"       — grab the node BODY. The whole subtree follows the
   *                    cursor as a rigid unit and, on drop, the delta is
   *                    persisted into `meta.positionOffset`. NO reparenting,
   *                    NO drop-child/before/after indicators.
   *
   *   • "structured" — grab the six-dot HANDLE. The node stays visually in
   *                    place; only drop-child/before/after logic runs, and
   *                    on drop the node is reparented / reordered. Any
   *                    accumulated `positionOffset` is reset so the node
   *                    lands cleanly at its new layout slot.
   */
  type DragMode = "free" | "structured";

  const horizontalAxis = horizontalAxisLayout;
  const [drag, setDrag] = useState<{
    id: string;
    mode: DragMode;
    pointer: { x: number; y: number };
    start: { x: number; y: number };
    subtreeIds: string[];
    over: { id: string; mode: TreeMoveMode } | null;
  } | null>(null);
  /** Pending drag — captured pointer-down state, promoted to active drag once
   *  the pointer moves >5px. Plain clicks (no movement) fire onNodeClick. */
  const pendingRef = useRef<{
    id: string; mode: DragMode; canDrag: boolean;
    startX: number; startY: number; pointerId: number; el: HTMLElement;
  } | null>(null);

  /** Suppresses left/top/transform transitions for exactly one paint frame
   *  right after a drop. This prevents the "slide-back" flicker where the
   *  browser interpolates from the pre-drag origin (`ln.x`) to the freshly
   *  persisted origin (`ln.x + dx`) while `transform` snaps to zero in the
   *  same commit. Cleared on the next rAF so subsequent layout changes
   *  (e.g. structured reparenting further away) still animate smoothly. */
  const [suppressTransitions, setSuppressTransitions] = useState(false);
  const snapshotThenClear = useCallback(() => {
    setSuppressTransitions(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSuppressTransitions(false));
    });
  }, []);

  const beginPointerDown = (id: string, mode: DragMode) =>
    (e: ReactPointerEvent<HTMLElement>) => {
      if (id === tree.id) return; // root not draggable / clickable as a target
      if ((e.target as HTMLElement).closest("button, input")) return;
      if (typeof window !== "undefined") {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) sel.removeAllRanges();
      }
      const node = findNode(tree, id);
      // Per-node drag permission (`meta.permissions.drag` / `meta.locked`)
      // controls only FREE (body) drag, which physically repositions the
      // node. STRUCTURED (handle) drag never moves the node visually — it
      // only computes drop targets — so it stays enabled even when a node
      // has "drag" turned off, matching the whole-flow drag/drop split.
      const lockedNode = !!node?.meta?.locked;
      const canDrag = mode === "free"
        ? (!!node && nodeCan(node, "drag"))
        : (!!node && !lockedNode);
      // Global capability by mode.
      const globallyCapable = mode === "free" ? draggable : structuredDndEnabled;
      const dragEligible = canDrag && globallyCapable;
      // Record the pending pointer regardless so a plain click still fires
      // onNodeClick. `canDrag` short-circuits promotion in the move handler.
      pendingRef.current = {
        id, mode, canDrag: dragEligible,
        startX: e.clientX, startY: e.clientY, pointerId: e.pointerId,
        el: e.currentTarget as HTMLElement,
      };
      if (!dragEligible) return;
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

  const handleNodePointerDown = (id: string) => beginPointerDown(id, "free");
  const handleHandlePointerDown = (id: string) => beginPointerDown(id, "structured");


  // Drop-axis inversion: when ON, drop indicators flip perpendicular to the
  // flow axis (horizontal flow → top/bottom, vertical flow → left/right).
  const siblingAxisInverted = config.siblingDndAxisInverted === true;
  const computeOverFromEvent = useCallback((e: PointerEvent | ReactPointerEvent): { id: string; mode: TreeMoveMode } | null => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const nodeEl = el?.closest("[data-tree-node]") as HTMLElement | null;
    if (!nodeEl) return null;
    const targetId = nodeEl.getAttribute("data-tree-node");
    if (!targetId || targetId === drag?.id) return null;
    if (drag && isDescendant(tree, drag.id, targetId)) return null;
    const rect = nodeEl.getBoundingClientRect();
    // Drop axis: perpendicular to flow axis by default (see siblingAxisInverted above).
    const useHorizontalAxisForDrop = siblingAxisInverted ? !horizontalAxis : horizontalAxis;
    let ratio = useHorizontalAxisForDrop
      ? (e.clientX - rect.left) / rect.width
      : (e.clientY - rect.top) / rect.height;
    // RTL on horizontal: flip so the "left" half maps to "after" (visually earlier in RTL = later in source order).
    if (useHorizontalAxisForDrop && dir === "rtl" && horizontalAxisLayout) ratio = 1 - ratio;
    let mode: TreeMoveMode = ratio < 0.3 ? "before" : ratio > 0.7 ? "after" : "child";
    // Per-node + global dragModes gating — fall back to an allowed mode when
    // the computed one is disabled; return null if none of them are allowed.
    const targetNode = findNode(tree, targetId);
    const globalModes = config.dragModes ?? {};
    const nodeModes = targetNode?.meta?.dragModes ?? {};
    const allowed = {
      child:  (nodeModes.child  ?? globalModes.child  ?? true),
      before: (nodeModes.before ?? globalModes.before ?? true),
      after:  (nodeModes.after  ?? globalModes.after  ?? true),
    };
    if (!allowed[mode]) {
      // Try a graceful fallback: keep insertion side if possible, else flip.
      const order: TreeMoveMode[] = mode === "child"
        ? (ratio < 0.5 ? ["before", "after"] : ["after", "before"])
        : mode === "before" ? ["child", "after"] : ["child", "before"];
      const fallback = order.find((m) => allowed[m]);
      if (!fallback) return null;
      mode = fallback;
    }
    return { id: targetId, mode };
  }, [drag, tree, horizontalAxis, siblingAxisInverted, dir, horizontalAxisLayout, config.dragModes]);


  /** Persist a free-position offset onto a node (Alt+drag drop). */
  const handleFreeMove = useCallback((id: string, delta: { dx: number; dy: number }) => {
    if (delta.dx === 0 && delta.dy === 0) return;
    const prev = findNode(tree, id);
    if (!prev) return;
    const existing = prev.meta?.positionOffset ?? { dx: 0, dy: 0 };
    const newOff = { dx: existing.dx + delta.dx, dy: existing.dy + delta.dy };
    const next = mapTree(tree, (n) =>
      n.id === id ? { ...n, meta: { ...n.meta, positionOffset: newOff } } : n,
    );
    commit(next);
    const updated = findNode(next, id)!;
    onNodeUpdate?.({ node: updated, prev, tree: next });
  }, [tree, commit, onNodeUpdate]);

  /** Promote a pending pointer-down to an active drag once the pointer has
   *  travelled >5px. If the pointer comes up first, treat it as a click. */
  useEffect(() => {
    const ACTIVATION = 5;
    const onMove = (e: PointerEvent) => {
      if (drag) {
        // Structured mode → hit-test for drop target. Free mode → just track pointer.
        const over = drag.mode === "structured" ? computeOverFromEvent(e) : null;
        setDrag((d) => d ? { ...d, pointer: { x: e.clientX, y: e.clientY }, over } : d);
        return;
      }
      const p = pendingRef.current;
      if (!p) return;
      const dx = e.clientX - p.startX;
      const dy = e.clientY - p.startY;
      if (dx * dx + dy * dy > ACTIVATION * ACTIVATION) {
        if (!p.canDrag) return; // per-node drag disabled — never promote
        const capable = p.mode === "free" ? draggable : structuredDndEnabled;
        if (!capable) return;
        const node = findNode(tree, p.id);
        const subtreeIds = node ? Array.from(collectSubtreeIds(node)) : [p.id];
        setDrag({
          id: p.id,
          mode: p.mode,
          pointer: { x: e.clientX, y: e.clientY },
          start: { x: p.startX, y: p.startY },
          subtreeIds,
          over: null,
        });
      }
    };
    const onUp = (e: PointerEvent) => {
      const p = pendingRef.current;
      if (drag) {
        if (drag.mode === "free") {
          // Free reposition — persist the pointer delta as a positionOffset.
          const dx = (e.clientX - drag.start.x) / zoom;
          const dy = (e.clientY - drag.start.y) / zoom;
          const ids = new Set(drag.subtreeIds);
          if (dx === 0 && dy === 0) {
            setDrag(null);
            pendingRef.current = null;
            return;
          }
          const prev = findNode(tree, drag.id);
          if (!prev) { setDrag(null); pendingRef.current = null; return; }
          const next = mapTree(tree, (n) => {
            if (!ids.has(n.id)) return n;
            const existing = n.meta?.positionOffset ?? { dx: 0, dy: 0 };
            return { ...n, meta: { ...n.meta, positionOffset: { dx: existing.dx + dx, dy: existing.dy + dy } } };
          });
          // Suppress transitions BEFORE the commit so the new left/top lands
          // atomically with the removal of the transform — no slide-back.
          snapshotThenClear();
          commit(next);
          setDrag(null);
          pendingRef.current = null;
          const updated = findNode(next, drag.id)!;
          onNodeUpdate?.({ node: updated, prev, tree: next });
          return;
        }
        // Structured reparent / reorder.
        const target = computeOverFromEvent(e);
        if (!target) {
          setDrag(null);
          pendingRef.current = null;
          return;
        }
        const prevParent = findParent(tree, drag.id);
        const prevIndex = indexInParent(prevParent, drag.id);
        const node = findNode(tree, drag.id);
        const moveResult = moveNode(tree, drag.id, target.id, target.mode);
        if (!moveResult || !node) {
          setDrag(null);
          pendingRef.current = null;
          return;
        }
        // Reset positionOffset on the moved node so it snaps to its new
        // layout slot cleanly — no double-offset flicker.
        const cleared = mapTree(moveResult.tree, (n) =>
          n.id === drag.id && n.meta?.positionOffset
            ? { ...n, meta: { ...n.meta, positionOffset: undefined } }
            : n,
        );
        // Structured drops: also suppress the one-frame transition kick so
        // the node lands cleanly. Subsequent layout shifts of siblings still
        // animate because the flag clears on the next rAF.
        snapshotThenClear();
        commit(cleared);
        setDrag(null);
        pendingRef.current = null;
        onNodeMove?.({
          node,
          prev: { parentId: prevParent?.id ?? null, index: prevIndex },
          next: { ...moveResult.next, mode: target.mode },
          tree: cleared,
        });
        return;
      }
      if (p) {
        const dx = e.clientX - p.startX;
        const dy = e.clientY - p.startY;
        if (dx * dx + dy * dy <= ACTIVATION * ACTIVATION) {
          const node = findNode(tree, p.id);
          if (node) onNodeClick?.(node);
        }
        pendingRef.current = null;
      }
    };
    const onCancel = () => { setDrag(null); pendingRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [drag, draggable, structuredDndEnabled, computeOverFromEvent, tree, commit, onNodeMove, onNodeClick, onNodeUpdate, zoom, snapshotThenClear]);


  /* ---- auto-scroll the window while dragging near a viewport edge ---- */
  useEffect(() => {
    if (!drag) return;
    const EDGE = 80;       // px from edge that triggers scroll
    const MAX_SPEED = 24;  // px per frame
    let raf = 0;
    const tick = () => {
      const { x, y } = drag.pointer;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let dx = 0, dy = 0;
      if (y < EDGE)             dy = -MAX_SPEED * (1 - y / EDGE);
      else if (y > vh - EDGE)   dy =  MAX_SPEED * (1 - (vh - y) / EDGE);
      if (x < EDGE)             dx = -MAX_SPEED * (1 - x / EDGE);
      else if (x > vw - EDGE)   dx =  MAX_SPEED * (1 - (vw - x) / EDGE);
      if (dx !== 0 || dy !== 0) {
        // Scroll the nearest scrollable ancestor (canvas container, panel,
        // or window) so users can drag onto offscreen nodes.
        const target = document.elementFromPoint(x, y) as HTMLElement | null;
        let scrolled = false;
        let el: HTMLElement | null = target;
        while (el && el !== document.body) {
          const cs = getComputedStyle(el);
          const oy = cs.overflowY, ox = cs.overflowX;
          const scrollableY = (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight;
          const scrollableX = (ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth;
          if (scrollableY || scrollableX) {
            if (scrollableY) el.scrollTop += dy;
            if (scrollableX) el.scrollLeft += dx;
            scrolled = true;
            break;
          }
          el = el.parentElement;
        }
        if (!scrolled) window.scrollBy(dx, dy);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drag]);

  /* ---- render ---- */

  const padding = 48;
  const canvasW = Math.max(layout.width + padding * 2, 320);
  const canvasH = Math.max(layout.height + padding * 2, config.minHeight ?? 320);

  // Live visual delta — ONLY applied in "free" drags. Structured (handle)
  // drags leave the node visually pinned and instead show drop indicators
  // on the hovered target.
  const liveFreeDelta = drag && drag.mode === "free"
    ? { dx: (drag.pointer.x - drag.start.x) / zoom, dy: (drag.pointer.y - drag.start.y) / zoom }
    : null;
  const liveSubtreeIds = liveFreeDelta && drag ? new Set(drag.subtreeIds) : null;

  const resolveEdgePoints = useCallback((edge: LayoutEdge) => {
    let a = edge.points[0];
    let b = edge.points[edge.points.length - 1];
    if (!liveFreeDelta || !liveSubtreeIds) return { a, b };

    const fromInDraggedSubtree = liveSubtreeIds.has(edge.fromId);
    const toInDraggedSubtree = liveSubtreeIds.has(edge.toId);
    if (fromInDraggedSubtree) a = { x: a.x + liveFreeDelta.dx, y: a.y + liveFreeDelta.dy };
    if (toInDraggedSubtree) b = { x: b.x + liveFreeDelta.dx, y: b.y + liveFreeDelta.dy };
    return { a, b };
  }, [liveFreeDelta, liveSubtreeIds]);

  const bgClass = config.background === "dots"
    ? "bg-[radial-gradient(circle,_hsl(var(--border))_1px,_transparent_1px)] [background-size:18px_18px]"
    : config.background === "grid"
    ? "bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:24px_24px]"
    : config.background === "cross"
    ? "bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:40px_40px] [background-position:center]"
    : config.background === "diagonal"
    ? "bg-[repeating-linear-gradient(45deg,hsl(var(--border))_0_1px,transparent_1px_14px)]"
    : config.background === "blueprint"
    ? "bg-[linear-gradient(to_right,hsl(var(--primary)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.18)_1px,transparent_1px)] [background-size:24px_24px] bg-[hsl(var(--primary)/0.04)]"
    : "";

  return (
    <div ref={wheelHostRef} dir={dir} className={cn("relative w-full overflow-hidden rounded-lg border border-border bg-card",
      bgClass, className)}
      style={{ height: canvasH }}
    >
      {/* zoom controls */}
      {config.panZoom && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-md border border-border bg-background/90 backdrop-blur px-1 py-0.5 shadow-sm">
          <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
            className="h-7 w-7 rounded hover:bg-muted text-sm">−</button>
          <span className="text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="h-7 w-7 rounded hover:bg-muted text-sm">+</button>
          <button onClick={() => { setZoom(1); setOffset({ x: 24, y: 24 }); }}
            className="h-7 px-2 rounded hover:bg-muted text-xs">Reset</button>
        </div>
      )}

      {/* read-only badge */}
      {readOnly && (
        <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-md border border-border bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Lock className="h-3 w-3" /> Read-only
        </div>
      )}

      <div
        className={cn("absolute inset-0", config.panZoom && "cursor-grab active:cursor-grabbing")}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: canvasW, height: canvasH,
            position: "relative",
          }}
        >
          {/* edges */}
          <svg
            width={canvasW} height={canvasH}
            className="absolute inset-0 pointer-events-none"
            style={{ overflow: "visible" }}
          >
            {layout.edges.map((e) => (
              (() => {
                const { a, b } = resolveEdgePoints(e);
                return (
                  <ConnectorPath
                    key={`${e.fromId}-${e.toId}`}
                    a={a}
                    b={b}
                    style={config.connector ?? "curved"}
                    axis={config.layout}
                  />
                );
              })()
            ))}
          </svg>

          {/* edge labels — rendered as absolutely positioned pills above edges */}
          {layout.edges.filter((e) => e.label).map((e) => {
            const { a, b } = resolveEdgePoints(e);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <div
                key={`label-${e.fromId}-${e.toId}`}
                className="absolute z-[1] pointer-events-none px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-medium text-foreground shadow-sm whitespace-nowrap"
                style={{ left: mx, top: my, transform: "translate(-50%, -50%)" }}
              >
                {e.label}
              </div>
            );
          })}

          {/* nodes */}
          {layout.nodes.map((ln) => {
            const parent = ln.parentId ? findNode(tree, ln.parentId) : null;
            const siblings = parent?.children ?? [];
            const idxInParent = siblings.findIndex((c) => c.id === ln.id);
            const canMovePrev = idxInParent > 0;
            const canMoveNext = idxInParent >= 0 && idxInParent < siblings.length - 1;
            const max = ln.node.meta?.maxChildren;
            const childCount = ln.node.children?.length ?? 0;
            const canAddChild = (max == null || childCount < max) && nodeCan(ln.node, "add");
            const overLimit = max != null && childCount > max;
            const canEditNode = nodeCan(ln.node, "edit");
            const canDeleteNode = nodeCan(ln.node, "delete");
            const canDragNode = nodeCan(ln.node, "drag");
            const canStartDragNode = canDragNode && (draggable || structuredDndEnabled);
            // Resolve blueprint picker options for this node (if any).
            const allowed = ln.node.meta?.allowedChildren;
            const blueprints = config.nodeBlueprints;
            const blueprintOptions =
              allowed && blueprints
                ? allowed
                    .map((id) => (blueprints[id] ? { id, ...blueprints[id] } : null))
                    .filter((x): x is { id: string; label: string; meta?: Partial<import("./types").TreeNodeMeta>; description?: string } => x !== null)
                : undefined;
            // Drop indicator axis: flip perpendicular to flow when invert is on,
            // independent of sibling-only mode.
            const chevronAxis: "horizontal" | "vertical" =
              siblingAxisInverted ? (horizontalAxis ? "vertical" : "horizontal") : (horizontalAxis ? "horizontal" : "vertical");
            // Resolution order: per-node override → flow default → built-in.
            const renderer: NodeRenderer | null =
              ln.node.meta?.render ?? config.renderNode ?? null;
            return (
              <NodeView
                key={ln.id}
                ln={ln}
                editable={editable && (canAddChild || canEditNode || canDeleteNode)}
                canEdit={canEditNode}
                canDelete={canDeleteNode}
                draggable={canStartDragNode}
                clickable={!!onNodeClick}
                shape={ln.node.meta?.shape ?? config.nodeShape ?? "rounded"}
                renderer={renderer}
                showLevelLabel={config.showLevelLabels !== false}
                isRoot={ln.id === tree.id}
                isDragging={drag?.id === ln.id}
                suppressTransition={suppressTransitions}
                freeMoveDelta={liveFreeDelta && liveSubtreeIds?.has(ln.id) ? liveFreeDelta : null}
                dimmed={highlightIds ? !highlightIds.has(ln.id) && ln.id !== tree.id : false}
                dropMode={drag?.over?.id === ln.id ? drag.over.mode : null}
                dropAxis={chevronAxis}
                showPositionControls={config.showPositionControls === true && !readOnly && !ln.node.meta?.locked}
                canMovePrev={canMovePrev}
                canMoveNext={canMoveNext}
                canAddChild={canAddChild}
                maxChildren={max ?? null}
                childCount={childCount}
                overLimit={overLimit}
                depth={ln.depth}
                blueprintOptions={blueprintOptions}
                onReorder={(d) => handleReorder(ln.id, d)}
                onPointerDown={handleNodePointerDown(ln.id)}
                onHandlePointerDown={handleHandlePointerDown(ln.id)}
                structuredDndEnabled={structuredDndEnabled}
                onAdd={(blueprintId) => handleAddChild(ln.id, blueprintId)}
                onUpdate={(label) => handleUpdateLabel(ln.id, label)}
                onRemove={() => handleRemove(ln.id)}

              />
            );
          })}


        </div>
      </div>

      {/* Drag ghost intentionally omitted — the dragged subtree itself
          (nodes + connector branches) now follows the pointer via
          liveFreeDelta, so a floating label pill would be redundant. */}
    </div>
  );
}

/* ---------- helpers ---------- */

function ConnectorPath({
  a, b, style, axis,
}: {
  a: { x: number; y: number };
  b: { x: number; y: number };
  style: "straight" | "stepped" | "curved" | "dashed";
  axis: TreeCanvasConfig["layout"];
}) {
  const stroke = "hsl(var(--border))";
  const dash = style === "dashed" ? "4 4" : undefined;

  let d = "";
  if (style === "straight" || style === "dashed") {
    d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  } else if (style === "stepped") {
    const mid = axis === "vertical" || axis === "org"
      ? (a.y + b.y) / 2
      : (a.x + b.x) / 2;
    d = axis === "vertical" || axis === "org"
      ? `M ${a.x} ${a.y} L ${a.x} ${mid} L ${b.x} ${mid} L ${b.x} ${b.y}`
      : `M ${a.x} ${a.y} L ${mid} ${a.y} L ${mid} ${b.y} L ${b.x} ${b.y}`;
  } else {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const c1 = axis === "vertical" || axis === "org"
      ? { x: a.x, y: a.y + dy * 0.5 }
      : { x: a.x + dx * 0.5, y: a.y };
    const c2 = axis === "vertical" || axis === "org"
      ? { x: b.x, y: b.y - dy * 0.5 }
      : { x: b.x - dx * 0.5, y: b.y };
    d = `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
  }
  return <path d={d} stroke={stroke} strokeWidth={1.5} fill="none" strokeDasharray={dash} />;
}

function NodeView({
  ln, editable, canEdit, canDelete, draggable, clickable, dimmed, shape, showLevelLabel, isRoot,
  renderer,
  isDragging, suppressTransition, freeMoveDelta, dropMode, dropAxis,
  showPositionControls, canMovePrev, canMoveNext, canAddChild, maxChildren, childCount, overLimit, depth,
  blueprintOptions,
  onReorder, onPointerDown, onHandlePointerDown, structuredDndEnabled, onAdd, onUpdate, onRemove,
}: {
  ln: LayoutNode;
  editable: boolean;
  canEdit: boolean;
  canDelete: boolean;
  draggable: boolean;
  clickable: boolean;
  dimmed: boolean;
  shape: "rect" | "rounded" | "pill" | "diamond" | "circle";
  renderer: NodeRenderer | null;
  showLevelLabel: boolean;
  isRoot: boolean;
  isDragging: boolean;
  suppressTransition: boolean;
  freeMoveDelta: { dx: number; dy: number } | null;
  dropMode: TreeMoveMode | null;
  dropAxis: "horizontal" | "vertical";
  showPositionControls: boolean;
  canMovePrev: boolean;
  canMoveNext: boolean;
  canAddChild: boolean;
  maxChildren: number | null;
  childCount: number;
  overLimit: boolean;
  depth: number;
  blueprintOptions?: { id: string; label: string; description?: string }[];
  onReorder: (dir: -1 | 1) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onHandlePointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  structuredDndEnabled: boolean;
  onAdd: (blueprintId?: string) => void;
  onUpdate: (label: string) => void;
  onRemove: () => void;

}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(ln.node.label);
  useEffect(() => setDraft(ln.node.label), [ln.node.label]);

  const locked = ln.node.meta?.locked;
  const accent = ln.node.meta?.color ?? "hsl(var(--primary))";

  const shapeClass =
    shape === "rect" ? "rounded-none"
    : shape === "rounded" ? "rounded-md"
    : shape === "pill" ? "rounded-full"
    : shape === "circle" ? "rounded-full"
    : "rounded-md";

  const baseStyle: CSSProperties = {
    left: ln.x, top: ln.y,
    width: ln.width, height: ln.height,
    borderColor: isRoot ? accent : undefined,
    transform: freeMoveDelta ? `translate3d(${freeMoveDelta.dx}px, ${freeMoveDelta.dy}px, 0)` : undefined,
    zIndex: freeMoveDelta ? 30 : undefined,
    // Smooth the layout snap that follows a structured reparent / reorder.
    // During an active drag we disable it so the pointer feels 1:1.
    transition: freeMoveDelta || isDragging || suppressTransition
      ? "none"
      : "left 180ms cubic-bezier(0.2,0,0,1), top 180ms cubic-bezier(0.2,0,0,1), box-shadow 150ms, opacity 150ms, transform 150ms",
    willChange: freeMoveDelta ? "transform" : undefined,
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
  };

  const transform = shape === "diamond" ? "rotate(45deg)" : undefined;
  const innerTransform = shape === "diamond" ? "rotate(-45deg)" : undefined;

  const interactive = (draggable || clickable) && !isRoot && !locked && !editing;

  // Render-function output (per-node override → flow default → built-in body).
  const customBody = renderer
    ? renderer({ node: ln.node, childCount, depth, isRoot })
    : null;

  return (
    <div
      data-tree-node={ln.id}
      style={baseStyle}
      onPointerDown={interactive ? onPointerDown : undefined}
      className={cn(
        "absolute group flex items-center justify-center shadow-sm border bg-card",
        "select-none",
        shapeClass,
        isRoot && "border-2",
        isDragging && !freeMoveDelta && "opacity-40 scale-95",
        dimmed && "opacity-25",
        interactive && (draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"),
        dropMode === "child" && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >

      {/* drop indicators (before / after) */}
      {dropMode === "before" && (
        <span className={cn(
          "absolute bg-primary rounded-full",
          dropAxis === "horizontal" ? "left-[-6px] top-0 bottom-0 w-[3px]" : "top-[-6px] left-0 right-0 h-[3px]",
        )} />
      )}
      {dropMode === "after" && (
        <span className={cn(
          "absolute bg-primary rounded-full",
          dropAxis === "horizontal" ? "right-[-6px] top-0 bottom-0 w-[3px]" : "bottom-[-6px] left-0 right-0 h-[3px]",
        )} />
      )}

      {showLevelLabel && ln.node.meta?.badge && (
        <div className="absolute -top-5 left-0 right-0 text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {ln.node.meta.badge}
        </div>
      )}

      {/* Structured-DnD handle — dragging THIS icon activates reparent /
          reorder logic without moving the node's visual position. Body drags
          remain free-reposition-only. */}
      {structuredDndEnabled && !isRoot && !locked && (
        <span
          onPointerDown={(e) => { e.stopPropagation(); onHandlePointerDown(e); }}
          title="Drag from here to reparent or reorder"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-6 w-5 rounded border border-border bg-background grid place-items-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing shadow-sm"
          style={{ touchAction: "none" }}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      )}


      <div
        style={{ transform }}
        className={cn("flex h-full w-full items-center justify-center", shapeClass,
          shape === "diamond" && "border bg-card")}
      >
        <div style={{ transform: innerTransform }} className="flex flex-col items-center justify-center px-2 text-center w-full">
          {editing ? (
            <div className="flex items-center gap-1 w-full">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { onUpdate(draft); setEditing(false); }
                  if (e.key === "Escape") { setDraft(ln.node.label); setEditing(false); }
                }}
                autoFocus
                className="flex-1 min-w-0 text-xs px-1 py-0.5 rounded border bg-background"
              />
              <button onClick={() => { onUpdate(draft); setEditing(false); }}
                className="p-0.5 rounded hover:bg-muted"><Check className="h-3 w-3 text-emerald-600" /></button>
              <button onClick={() => { setDraft(ln.node.label); setEditing(false); }}
                className="p-0.5 rounded hover:bg-muted"><X className="h-3 w-3 text-muted-foreground" /></button>
            </div>
          ) : customBody !== null && customBody !== undefined ? (
            customBody
          ) : (
            <>
              <p className="text-xs font-semibold leading-tight line-clamp-2 break-words">{ln.node.label}</p>
              {ln.node.meta?.description && (
                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1 mt-0.5">
                  {ln.node.meta.description}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {locked && (
        <span className="absolute top-1 right-1 text-muted-foreground"><Lock className="h-3 w-3" /></span>
      )}

      {/* over-limit warning chip — appears when a parent has more children
          than its current maxChildren allows. Non-blocking; informational. */}
      {overLimit && maxChildren != null && (
        <span
          title={`This node has ${childCount} children but the limit is ${maxChildren}. Remove ${childCount - maxChildren} to comply.`}
          className="absolute -top-2 -right-2 z-20 inline-flex items-center gap-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-400 shadow-sm"
        >
          <AlertTriangle className="h-2.5 w-2.5" />
          {childCount}/{maxChildren}
        </span>
      )}

      {/* hover toolbar */}
      {editable && !editing && !locked && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 rounded-md border border-border bg-background text-foreground shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          {blueprintOptions && blueprintOptions.length > 0 ? (
            <BlueprintPicker
              options={blueprintOptions}
              disabled={!canAddChild}
              maxChildren={maxChildren}
              childCount={childCount}
              onPick={(id) => onAdd(id)}
            />
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); if (canAddChild) onAdd(); }}
              disabled={!canAddChild}
              title={canAddChild ? "Add child" : maxChildren != null ? `Max ${maxChildren} children reached (${childCount}/${maxChildren})` : "Add disabled"}
              className="h-6 w-6 grid place-items-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
          {canEdit && (
            <button onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              title="Rename"
              className="h-6 w-6 grid place-items-center hover:bg-muted">
              <Pencil className="h-3 w-3" />
            </button>
          )}
          {!isRoot && canDelete && (
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
              title="Remove"
              className="h-6 w-6 grid place-items-center hover:bg-muted text-destructive">
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* position controls — sibling reorder without DnD */}
      {showPositionControls && !isRoot && !editing && (
        <div className={cn(
          "absolute z-10 flex items-center gap-0.5 rounded-md border border-border bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity",
          dropAxis === "horizontal"
            ? "-top-3 left-1/2 -translate-x-1/2"
            : "top-1/2 -translate-y-1/2 -right-3",
        )}>
          <button
            onClick={(e) => { e.stopPropagation(); if (canMovePrev) onReorder(-1); }}
            disabled={!canMovePrev}
            title="Move earlier"
            className="h-6 w-6 grid place-items-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {dropAxis === "horizontal" ? <ChevronUp className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (canMoveNext) onReorder(1); }}
            disabled={!canMoveNext}
            title="Move later"
            className="h-6 w-6 grid place-items-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {dropAxis === "horizontal" ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        </div>
      )}

    </div>
  );
}


/**
 * Typed add-child picker — used when a node's `meta.allowedChildren` resolves
 * to one or more blueprints from `config.nodeBlueprints`. Click the + button
 * to open the menu; pick a blueprint to insert a new child of that type with
 * the blueprint's default label and meta.
 */
function BlueprintPicker({
  options, disabled, maxChildren, childCount, onPick,
}: {
  options: { id: string; label: string; description?: string }[];
  disabled: boolean;
  maxChildren: number | null;
  childCount: number;
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);
  const title = disabled
    ? maxChildren != null
      ? `Max ${maxChildren} children reached (${childCount}/${maxChildren})`
      : "Add disabled"
    : "Add child";
  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); if (!disabled) setOpen((v) => !v); }}
        disabled={disabled}
        title={title}
        className="h-6 w-6 grid place-items-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus className="h-3 w-3" />
      </button>
      {open && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 min-w-[180px] rounded-md border border-border bg-popover text-popover-foreground shadow-md overflow-hidden"
        >
          <div className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            Add child
          </div>
          {options.map((o) => (
            <button
              key={o.id}
              onClick={(e) => { e.stopPropagation(); onPick(o.id); setOpen(false); }}
              className="w-full text-left px-2 py-1.5 text-xs hover:bg-muted transition-colors"
            >
              <div className="font-medium">{o.label}</div>
              {o.description && (
                <div className="text-[10px] text-muted-foreground leading-tight">{o.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
