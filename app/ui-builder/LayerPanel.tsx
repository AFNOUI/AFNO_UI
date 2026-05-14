"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Unlock, ChevronRight, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { BuilderNode, componentRegistry } from "@/ui-builder/data/uiBuilderRegistry";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayerPanelProps {
  nodes: BuilderNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function LayerPanel({ nodes, selectedId, onSelect, onToggleVisibility, onToggleLock, onRename }: LayerPanelProps) {
  return (
    <div className="w-[220px] border-e border-border bg-card/30 flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Layers</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {nodes.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3">No layers yet</p>
          ) : (
            nodes.map(node => (
              <LayerItem
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedId}
                onSelect={onSelect}
                onToggleVisibility={onToggleVisibility}
                onToggleLock={onToggleLock}
                onRename={onRename}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface LayerItemProps {
  node: BuilderNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

function LayerItem({ node, depth, selectedId, onSelect, onToggleVisibility, onToggleLock, onRename }: LayerItemProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.layerName || "");

  const entry = componentRegistry.find(c => c.type === node.type);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;
  const displayName = node.layerName || entry?.label || node.type;

  const handleDoubleClick = () => {
    setEditing(true);
    setEditName(displayName);
  };

  const handleRenameSubmit = () => {
    setEditing(false);
    if (editName.trim() && editName !== displayName) {
      onRename(node.id, editName.trim());
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-0.5 px-1 py-0.5 mx-1 rounded text-xs cursor-pointer transition-colors group",
          isSelected ? "bg-primary/15 text-primary" : "hover:bg-accent/50 text-foreground/80",
          node.hidden && "opacity-40"
        )}
        style={{ paddingInlineStart: `${depth * 16 + 4}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-accent rounded shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {entry && <entry.icon className="h-3 w-3 shrink-0 text-muted-foreground" />}

        {editing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") setEditing(false); }}
            className="h-5 text-[10px] px-1 py-0 border-primary"
            autoFocus
          />
        ) : (
          <span className="truncate flex-1 text-[11px]" onDoubleClick={handleDoubleClick}>
            {displayName}
          </span>
        )}

        <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            className="p-0.5 hover:bg-accent rounded"
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(node.id); }}
          >
            {node.hidden ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
          </button>
          <button
            className="p-0.5 hover:bg-accent rounded"
            onClick={(e) => { e.stopPropagation(); onToggleLock(node.id); }}
          >
            {node.locked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map(child => (
            <LayerItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onRename={onRename}
            />
          ))}
        </div>
      )}
    </div>
  );
}
