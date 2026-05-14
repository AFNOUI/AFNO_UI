"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BuilderNode, Breakpoint, createNode, generateId, getDerivedLayoutStyles } from "@/ui-builder/data/uiBuilderRegistry";

const STORAGE_KEY = "afnoui-page-builder-state";
const MAX_HISTORY = 50;

export interface PageBuilderState {
  nodes: BuilderNode[];
  selectedId: string | null;
  breakpoint: Breakpoint;
  showCode: boolean;
  showLayers: boolean;
  showGrid: boolean;
  interactivePreview: boolean;
  zoom: number;
  direction: "ltr" | "rtl";
}

function loadState(): PageBuilderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
        return {
          ...parsed,
          nodes: normalizeNodes(parsed.nodes || []),
          selectedId: null,
          showCode: false,
          showLayers: false,
          showGrid: parsed.showGrid ?? false,
          interactivePreview: parsed.interactivePreview ?? false,
          zoom: parsed.zoom ?? 100,
          direction: parsed.direction ?? "ltr",
        };
    }
  } catch {}
  return { nodes: [], selectedId: null, breakpoint: "base", showCode: false, showLayers: false, showGrid: false, interactivePreview: false, zoom: 100, direction: "ltr" };
}

// ─── Deep tree helpers ───
function findNode(nodes: BuilderNode[], id: string): BuilderNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

function removeNode(nodes: BuilderNode[], id: string): BuilderNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: removeNode(n.children, id) }));
}

function insertAtIndex(nodes: BuilderNode[], parentId: string | null, index: number, node: BuilderNode): BuilderNode[] {
  if (!parentId) {
    const copy = [...nodes];
    copy.splice(index, 0, node);
    return copy;
  }
  return nodes.map(n => {
    if (n.id === parentId) {
      const children = [...n.children];
      children.splice(index, 0, node);
      return { ...n, children };
    }
    return { ...n, children: insertAtIndex(n.children, parentId, index, node) };
  });
}

function updateNode(nodes: BuilderNode[], id: string, updater: (n: BuilderNode) => BuilderNode): BuilderNode[] {
  return nodes.map(n => {
    if (n.id === id) return updater(n);
    return { ...n, children: updateNode(n.children, id, updater) };
  });
}

function findParentId(nodes: BuilderNode[], id: string): string | null {
  for (const n of nodes) {
    if (n.children.some(c => c.id === id)) return n.id;
    const found = findParentId(n.children, id);
    if (found) return found;
  }
  return null;
}

function getIndex(nodes: BuilderNode[], id: string): number {
  return nodes.findIndex(n => n.id === id);
}

function getSiblings(nodes: BuilderNode[], id: string): BuilderNode[] {
  const parentId = findParentId(nodes, id);
  if (!parentId) return nodes;
  const parent = findNode(nodes, parentId);
  return parent?.children || [];
}

function cloneWithNewIds(n: BuilderNode): BuilderNode {
  return {
    ...n,
    id: generateId(),
    props: { ...n.props },
    styles: JSON.parse(JSON.stringify(n.styles)),
    children: n.children.map(cloneWithNewIds),
  };
}

function normalizeNode(node: BuilderNode): BuilderNode {
  const derived = getDerivedLayoutStyles(node.type, node.props);
  return {
    ...node,
    styles: {
      ...node.styles,
      base: {
        ...node.styles.base,
        ...derived,
      },
    },
    children: node.children.map(normalizeNode),
  };
}

function normalizeNodes(nodes: BuilderNode[]): BuilderNode[] {
  return nodes.map(normalizeNode);
}

export function useUiBuilder() {
  const [state, setState] = useState<PageBuilderState>(loadState);
  const [historyMeta, setHistoryMeta] = useState({ index: 0, length: 1 });
  const historyRef = useRef<BuilderNode[][]>([state.nodes]);
  const historyIndexRef = useRef(0);
  const clipboardRef = useRef<BuilderNode | null>(null);

  const updateStylesForBreakpoint = useCallback((
    nodes: BuilderNode[],
    id: string,
    breakpoint: Breakpoint,
    styleKey: string,
    value: string
  ) => updateNode(nodes, id, n => ({
    ...n,
    styles: {
      ...n.styles,
      [breakpoint]: { ...(n.styles[breakpoint] || {}), [styleKey]: value },
    },
  })), []);

  // Persist
  useEffect(() => {
    const {
      selectedId: _selectedId,
      showCode: _showCode,
      showLayers: _showLayers,
      ...persist
    } = state;
    void _selectedId;
    void _showCode;
    void _showLayers;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }, [state]);

  const pushHistory = useCallback((nodes: BuilderNode[]) => {
    const h = historyRef.current;
    const idx = historyIndexRef.current;
    historyRef.current = [...h.slice(0, idx + 1), nodes].slice(-MAX_HISTORY);
    historyIndexRef.current = historyRef.current.length - 1;
    setHistoryMeta({
      index: historyIndexRef.current,
      length: historyRef.current.length,
    });
  }, []);

  // ─── Actions ───
  const addNode = useCallback((type: string, parentId?: string | null, index?: number) => {
    const node = createNode(type);
    if (!node) return;
    setState(prev => {
      const idx = index ?? (parentId ? (findNode(prev.nodes, parentId)?.children.length ?? 0) : prev.nodes.length);
      const newNodes = insertAtIndex(prev.nodes, parentId ?? null, idx, node);
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes, selectedId: node.id };
    });
  }, [pushHistory]);

  const insertNode = useCallback((node: BuilderNode, parentId?: string | null, index?: number) => {
    setState(prev => {
      const prepared = normalizeNode(node);
      const idx = index ?? (parentId ? (findNode(prev.nodes, parentId)?.children.length ?? 0) : prev.nodes.length);
      const newNodes = insertAtIndex(prev.nodes, parentId ?? null, idx, prepared);
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes, selectedId: prepared.id };
    });
  }, [pushHistory]);

  const deleteNode = useCallback((id: string) => {
    setState(prev => {
      const newNodes = removeNode(prev.nodes, id);
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes, selectedId: prev.selectedId === id ? null : prev.selectedId };
    });
  }, [pushHistory]);

  const moveNode = useCallback((nodeId: string, newParentId: string | null, newIndex: number) => {
    setState(prev => {
      const node = findNode(prev.nodes, nodeId);
      if (!node) return prev;
      let newNodes = removeNode(prev.nodes, nodeId);
      newNodes = insertAtIndex(newNodes, newParentId, newIndex, node);
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes };
    });
  }, [pushHistory]);

  const updateNodeProps = useCallback((id: string, props: Record<string, unknown>) => {
    setState(prev => {
      const newNodes = updateNode(prev.nodes, id, n => {
        const nextProps = { ...n.props, ...props };
        const derived = getDerivedLayoutStyles(n.type, nextProps);
        return {
          ...n,
          props: nextProps,
          styles: {
            ...n.styles,
            base: {
              ...n.styles.base,
              ...derived,
            },
          },
        };
      });
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes };
    });
  }, [pushHistory]);

  const updateNodeStyles = useCallback((id: string, styleKey: string, value: string) => {
    setState(prev => {
      const newNodes = updateStylesForBreakpoint(prev.nodes, id, prev.breakpoint, styleKey, value);
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes };
    });
  }, [pushHistory, updateStylesForBreakpoint]);

  const updateNodeStylesAtBreakpoint = useCallback((id: string, breakpoint: Breakpoint, styleKey: string, value: string) => {
    setState(prev => {
      const newNodes = updateStylesForBreakpoint(prev.nodes, id, breakpoint, styleKey, value);
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes };
    });
  }, [pushHistory, updateStylesForBreakpoint]);

  const duplicateNode = useCallback((id: string) => {
    setState(prev => {
      const node = findNode(prev.nodes, id);
      if (!node) return prev;
      const clone = cloneWithNewIds(node);
      const parentId = findParentId(prev.nodes, id);
      const siblings = getSiblings(prev.nodes, id);
      const idx = getIndex(siblings, id);
      const newNodes = insertAtIndex(prev.nodes, parentId, idx + 1, clone);
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes, selectedId: clone.id };
    });
  }, [pushHistory]);

  const selectNode = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedId: id }));
  }, []);

  const moveNodeByOffset = useCallback((id: string, offset: number) => {
    setState(prev => {
      const parentId = findParentId(prev.nodes, id);
      const siblings = parentId ? (findNode(prev.nodes, parentId)?.children || []) : prev.nodes;
      const currentIndex = siblings.findIndex(node => node.id === id);

      if (currentIndex === -1) return prev;

      const nextIndex = Math.max(0, Math.min(siblings.length - 1, currentIndex + offset));
      if (nextIndex === currentIndex) return prev;

      const node = findNode(prev.nodes, id);
      if (!node) return prev;

      let newNodes = removeNode(prev.nodes, id);
      newNodes = insertAtIndex(newNodes, parentId, nextIndex, node);
      pushHistory(newNodes);

      return { ...prev, nodes: newNodes, selectedId: id };
    });
  }, [pushHistory]);

  const setBreakpoint = useCallback((bp: Breakpoint) => {
    setState(prev => ({ ...prev, breakpoint: bp }));
  }, []);

  const toggleCode = useCallback(() => {
    setState(prev => ({ ...prev, showCode: !prev.showCode }));
  }, []);

  const toggleLayers = useCallback(() => {
    setState(prev => ({ ...prev, showLayers: !prev.showLayers }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, interactivePreview: !prev.interactivePreview, selectedId: null }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom: Math.max(50, Math.min(200, zoom)) }));
  }, []);

  const setDirection = useCallback((dir: "ltr" | "rtl") => {
    setState(prev => ({ ...prev, direction: dir }));
  }, []);

  const clearCanvas = useCallback(() => {
    pushHistory([]);
    setState(prev => ({ ...prev, nodes: [], selectedId: null }));
  }, [pushHistory]);

  const loadNodes = useCallback((nodes: BuilderNode[]) => {
    const normalized = normalizeNodes(nodes);
    pushHistory(normalized);
    setState(prev => ({ ...prev, nodes: normalized, selectedId: null }));
  }, [pushHistory]);

  // Copy / Paste
  const copyNode = useCallback((id: string) => {
    const node = findNode(state.nodes, id);
    if (node) clipboardRef.current = JSON.parse(JSON.stringify(node));
  }, [state.nodes]);

  const pasteNode = useCallback(() => {
    if (!clipboardRef.current) return;
    const clone = cloneWithNewIds(clipboardRef.current);
    setState(prev => {
      const newNodes = [...prev.nodes, clone];
      pushHistory(newNodes);
      return { ...prev, nodes: newNodes, selectedId: clone.id };
    });
  }, [pushHistory]);

  // Toggle visibility / lock
  const toggleNodeVisibility = useCallback((id: string) => {
    setState(prev => {
      const newNodes = updateNode(prev.nodes, id, n => ({ ...n, hidden: !n.hidden }));
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const toggleNodeLock = useCallback((id: string) => {
    setState(prev => {
      const newNodes = updateNode(prev.nodes, id, n => ({ ...n, locked: !n.locked }));
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const renameNode = useCallback((id: string, name: string) => {
    setState(prev => {
      const newNodes = updateNode(prev.nodes, id, n => ({ ...n, layerName: name }));
      return { ...prev, nodes: newNodes };
    });
  }, []);

  // Undo / Redo
  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    historyIndexRef.current = idx - 1;
    const nodes = historyRef.current[idx - 1];
    setHistoryMeta({
      index: historyIndexRef.current,
      length: historyRef.current.length,
    });
    setState(prev => ({ ...prev, nodes, selectedId: null }));
  }, []);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return;
    historyIndexRef.current = idx + 1;
    const nodes = historyRef.current[idx + 1];
    setHistoryMeta({
      index: historyIndexRef.current,
      length: historyRef.current.length,
    });
    setState(prev => ({ ...prev, nodes, selectedId: null }));
  }, []);

  const canUndo = historyMeta.index > 0;
  const canRedo = historyMeta.index < historyMeta.length - 1;

  const selectedNode = state.selectedId ? findNode(state.nodes, state.selectedId) : null;

  // Export / Import JSON
  const exportJSON = useCallback(() => {
    const data = JSON.stringify(state.nodes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page-builder-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state.nodes]);

  const importJSON = useCallback((json: string) => {
    try {
        const nodes = normalizeNodes(JSON.parse(json) as BuilderNode[]);
      if (Array.isArray(nodes)) {
        pushHistory(nodes);
        setState(prev => ({ ...prev, nodes, selectedId: null }));
      }
    } catch {}
  }, [pushHistory]);

  return {
    state,
    selectedNode,
    addNode,
    insertNode,
    deleteNode,
    moveNode,
    moveNodeByOffset,
    updateNodeProps,
    updateNodeStyles,
    updateNodeStylesAtBreakpoint,
    duplicateNode,
    selectNode,
    setBreakpoint,
    toggleCode,
    toggleLayers,
    toggleGrid,
    togglePreview,
    setZoom,
    setDirection,
    clearCanvas,
    loadNodes,
    copyNode,
    pasteNode,
    toggleNodeVisibility,
    toggleNodeLock,
    renameNode,
    undo,
    redo,
    canUndo,
    canRedo,
    exportJSON,
    importJSON,
  };
}
