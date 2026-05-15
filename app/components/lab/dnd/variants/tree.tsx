"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone, useDndContext } from "@/components/ui/dnd";

import { SortableDropShadow } from "@/components/lab/dnd/shared/SortableDropShadow";

interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
}

function TreeChild({
  child,
  index,
  collapseWhenDragging,
}: {
  child: TreeNode;
  index: number;
  collapseWhenDragging: boolean;
}) {
  const { dragProps, isDragging } = useDraggable({
    id: child.id,
    data: { id: child.id, fromIndex: index },
    preview: () => (
      <div className="rounded border bg-card px-2 py-1 text-xs shadow">
        {child.label}
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
        opacity: isDragging ? 0.45 : 1,
      }}
      className={cn(
        "rounded border bg-card px-2 py-1 text-xs truncate transition-all duration-150",
        isCollapsed && "overflow-hidden border-transparent",
      )}
    >
      {child.label}
    </div>
  );
}

function TreeBranch({
  node,
  onReorder,
}: {
  node: TreeNode;
  onReorder: (parentId: string, childId: string, toIndex: number) => void;
}) {
  const { active } = useDndContext();
  const { zoneProps, isOver, hoverIndex, slotSize, animationsEnabled } =
    useDropZone<{ parentId: string }, { id: string; fromIndex: number }>({
      id: `branch-${node.id}`,
      data: { parentId: node.id },
      axis: "y",
      getItemIndex: (drag) =>
        node.children.findIndex((c) => c.id === drag.data.id),
      onDrop: ({ item, index }) => onReorder(node.id, item.data.id, index),
    });
  const activeIndex = active
    ? node.children.findIndex((c) => c.id === active.data.id)
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
    <div className="rounded-lg border bg-muted/20 p-2">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
        <FolderOpen className="h-3.5 w-3.5 text-primary" />
        {node.label}
      </div>
      <div {...zoneProps} className="space-y-1.5 pl-4">
        {node.children.map((c, i) => (
          <div
            key={c.id}
            className={cn(
              "space-y-1.5",
              shouldShowTarget && c.id === active?.data.id && "hidden",
            )}
          >
            {shouldShowTarget && targetIndex === i && (
              <SortableDropShadow
                height={slotSize.height}
                animated={animationsEnabled}
              />
            )}
            <TreeChild
              child={c}
              index={i}
              collapseWhenDragging={shouldShowTarget}
            />
          </div>
        ))}
        {shouldShowTarget && targetIndex === node.children.length && (
          <SortableDropShadow
            height={slotSize.height}
            animated={animationsEnabled}
          />
        )}
      </div>
    </div>
  );
}

export function TreeDemo() {
  const [tree, setTree] = useState<TreeNode[]>([
    {
      id: "frontend",
      label: "Frontend",
      children: [
        { id: "f1", label: "Components", children: [] },
        { id: "f2", label: "Hooks", children: [] },
        { id: "f3", label: "Pages", children: [] },
      ],
    },
    {
      id: "backend",
      label: "Backend",
      children: [
        { id: "b1", label: "Routes", children: [] },
        { id: "b2", label: "Services", children: [] },
      ],
    },
  ]);

  const handleReorder = (
    parentId: string,
    childId: string,
    toIndex: number,
  ) => {
    setTree((cur) =>
      cur.map((branch) => {
        if (branch.id !== parentId) return branch;
        const from = branch.children.findIndex((c) => c.id === childId);
        if (from < 0) return branch;
        const next = branch.children.slice();
        const [moved] = next.splice(from, 1);
        const insertAt = toIndex > from ? toIndex - 1 : toIndex;
        next.splice(insertAt, 0, moved);
        return { ...branch, children: next };
      }),
    );
  };

  return (
    <div className="space-y-3">
      {tree.map((branch) => (
        <TreeBranch key={branch.id} node={branch} onReorder={handleReorder} />
      ))}
    </div>
  );
}

export const treeSnippet = `import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone } from "../../components/dnd";

interface TreeNode { id: string; label: string; children?: TreeNode[] }
type NodeDragData = { id: string; parentId: string } & Record<string, unknown>;
type BranchZoneData = { parentId: string } & Record<string, unknown>;

function Branch({ nodes, parentId, onReorder }: {
  nodes: TreeNode[]; parentId: string;
  onReorder: (parentId: string, fromId: string, toIndex: number) => void;
}) {
  const { zoneProps, isOver, getItemSlotStyle } = useDropZone<BranchZoneData, NodeDragData>({
    id: \`tree-\${parentId}\`, data: { parentId }, axis: "y",
    getItemIndex: (drag) =>
      drag.data.parentId === parentId ? nodes.findIndex((n) => n.id === drag.data.id) : null,
    onDrop: ({ item, index }) => onReorder(parentId, item.data.id, index),
  });
  return (
    <ul {...zoneProps} className={cn("space-y-1 pl-4", isOver && "rounded bg-primary/5")}>
      {nodes.map((node, i) => {
        const D = () => {
          const { dragProps, isDragging } = useDraggable<NodeDragData>({
            id: node.id, data: { id: node.id, parentId },
            preview: () => <div className="rounded border bg-card px-2 py-1 text-sm shadow">{node.label}</div>,
          });
          return (
            <li {...dragProps} style={getItemSlotStyle(i)} className={cn("rounded", isDragging && "opacity-30")}>
              <div className="flex items-center gap-1 px-2 py-1 text-sm">
                <ChevronRight className="h-3 w-3" />{node.label}
              </div>
              {node.children && <Branch nodes={node.children} parentId={node.id} onReorder={onReorder} />}
            </li>
          );
        };
        return <D key={node.id} />;
      })}
    </ul>
  );
}

export default function TreeReorder() {
  const [tree, setTree] = useState<TreeNode>({
    id: "root", label: "Root",
    children: [
      { id: "a", label: "Alpha", children: [{ id: "a1", label: "Alpha 1" }, { id: "a2", label: "Alpha 2" }] },
      { id: "b", label: "Beta" },
    ],
  });
  const reorder = (parentId: string, fromId: string, toIndex: number) => {
    const recur = (n: TreeNode): TreeNode => {
      if (n.id === parentId && n.children) {
        const next = n.children.slice();
        const from = next.findIndex((c) => c.id === fromId);
        if (from < 0) return n;
        const [moved] = next.splice(from, 1);
        next.splice(toIndex > from ? toIndex - 1 : toIndex, 0, moved);
        return { ...n, children: next };
      }
      return n.children ? { ...n, children: n.children.map(recur) } : n;
    };
    setTree(recur(tree));
  };
  return <Branch nodes={tree.children ?? []} parentId={tree.id} onReorder={reorder} />;
}
`;
