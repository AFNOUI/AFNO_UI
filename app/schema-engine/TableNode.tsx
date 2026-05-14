import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { KeyRound, Link2, Hash, Type, Calendar, ToggleLeft, FileJson, Fingerprint, Database } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SqlBaseType } from "@/schema-engine/types/types";

import type { TableNodeData } from "@/schema-engine/index";
import { useSchemaEngineState } from "@/schema-engine/store/schemaEngineStore";

const TYPE_ICON: Record<SqlBaseType, typeof Hash> = {
  INTEGER: Hash, BIGINT: Hash, FLOAT: Hash, DECIMAL: Hash,
  TEXT: Type, BOOLEAN: ToggleLeft, DATE: Calendar, TIMESTAMP: Calendar,
  UUID: Fingerprint, JSON: FileJson,
};

export const TableNode = memo(function TableNode({ id, data }: NodeProps<TableNodeData>) {
  const hoveredTable = useSchemaEngineState(s => s.hoveredTable);
  const selectedTable = useSchemaEngineState(s => s.selectedTable);
  const isHovered = hoveredTable === id;
  const isSelected = selectedTable === id;
  const pkCount = data.table.columns.filter(c => c.isPrimaryKey).length;
  const fkCount = data.table.columns.filter(c => c.references).length;

  return (
    <div
      className={cn(
        "rounded-xl bg-card border-2 shadow-md transition-all duration-150 select-none w-[280px] overflow-hidden",
        "ring-0",
        isSelected
          ? "border-primary shadow-xl shadow-primary/20 ring-2 ring-primary/30"
          : isHovered
            ? "border-primary/60 shadow-lg"
            : "border-border hover:border-primary/40 hover:shadow-lg",
      )}
      data-testid={`table-node-${id}`}
    >
      {/* Header */}
      <div className={cn(
        "px-3 py-2.5 font-semibold text-sm flex items-center justify-between gap-2",
        "bg-gradient-to-br from-primary/15 via-primary/8 to-transparent border-b border-border",
      )}>
        <span className="flex items-center gap-1.5 truncate">
          <Database size={12} className="text-primary shrink-0" />
          <span className="truncate font-mono">{data.table.name}</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {pkCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
              <KeyRound size={8} />{pkCount}
            </span>
          )}
          {fkCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 flex items-center gap-0.5">
              <Link2 size={8} />{fkCount}
            </span>
          )}
        </div>
      </div>

      {/* Source ribbon */}
      <div className="px-3 py-1 bg-muted/40 border-b border-border text-[9px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
        <span>{data.table.columns.length} column{data.table.columns.length === 1 ? "" : "s"}</span>
        <span className="font-semibold">{data.table.source}</span>
      </div>

      {/* Columns */}
      <ul className="py-1">
        {data.table.columns.map((col, idx) => {
          const Icon = TYPE_ICON[col.type] ?? Type;
          return (
            <li
              key={col.name}
              className={cn(
                "relative flex items-center justify-between gap-2 px-3 py-1.5 text-[11px] font-mono",
                "transition-colors",
                idx % 2 === 1 ? "bg-muted/20" : "",
                "hover:bg-primary/5",
              )}
            >
              {/* Left handle (target) — incoming FK arrows land here. */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${col.name}-target`}
                className="!w-2 !h-2 !bg-primary/60 !border-card"
                style={{ left: -4 }}
                isConnectable={false}
              />
              <span className="flex items-center gap-1.5 min-w-0">
                {col.isPrimaryKey
                  ? <KeyRound size={10} className="text-amber-500 shrink-0" />
                  : col.references
                    ? <Link2 size={10} className="text-blue-500 shrink-0" />
                    : <Icon size={10} className="text-muted-foreground/70 shrink-0" />}
                <span className={cn("truncate", col.isPrimaryKey && "font-bold text-foreground")}>{col.name}</span>
                {!col.nullable && !col.isPrimaryKey && (
                  <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">*</span>
                )}
                {col.isUnique && !col.isPrimaryKey && (
                  <span className="text-[8px] text-violet-600 dark:text-violet-400 font-bold shrink-0">U</span>
                )}
              </span>
              <span className="text-[9px] uppercase text-muted-foreground tracking-wider shrink-0">{col.type}</span>
              {/* Right handle (source) — outgoing FK arrows leave from here. */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${col.name}-source`}
                className="!w-2 !h-2 !bg-primary/60 !border-card"
                style={{ right: -4 }}
                isConnectable={false}
              />
            </li>
          );
        })}
      </ul>

      {/* Footer legend - tiny */}
      {(data.table.columns.some(c => !c.nullable && !c.isPrimaryKey) || data.table.columns.some(c => c.isUnique)) && (
        <div className="px-3 py-1 border-t border-border bg-muted/30 text-[8px] text-muted-foreground/80 flex gap-2">
          <span><span className="text-emerald-500 font-bold">*</span> required</span>
          <span><span className="text-violet-500 font-bold">U</span> unique</span>
        </div>
      )}
    </div>
  );
});
