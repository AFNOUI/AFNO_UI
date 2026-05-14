import { useCallback, useMemo } from "react";
import { Plus, Trash2, Layers, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { TableBuilderConfig, TableColumnGroup } from "@/table-builder/data/tableBuilderTemplates";

interface ColumnGroupsEditorProps {
  config: TableBuilderConfig;
  onChange: (c: TableBuilderConfig) => void;
}

/**
 * Visual editor for grouped (super) headers. Lets the user create labeled groups
 * and assign columns to each via a multi-add picker. The generated config writes
 * into `config.columnGroups`, which TablePreview reads when `enableNestedHeaders`
 * is true.
 */
export function ColumnGroupsEditor({ config, onChange }: ColumnGroupsEditorProps) {
  const groups = useMemo(() => config.columnGroups ?? [], [config.columnGroups]);
  const visibleColumns = useMemo(
    () => config.columns.filter(c => c.visible),
    [config.columns],
  );

  // For each column id → which group it belongs to (so we can mark "used" in pickers)
  const colToGroup = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) for (const id of g.columns) map.set(id, g.id);
    return map;
  }, [groups]);

  const updateGroups = useCallback(
    (next: TableColumnGroup[]) => onChange({ ...config, columnGroups: next }),
    [config, onChange],
  );

  const addGroup = useCallback(() => {
    const id = `grp-${Date.now()}`;
    updateGroups([...groups, { id, label: `Group ${groups.length + 1}`, columns: [], align: "center" }]);
  }, [groups, updateGroups]);

  const removeGroup = useCallback(
    (id: string) => updateGroups(groups.filter(g => g.id !== id)),
    [groups, updateGroups],
  );

  const updateGroup = useCallback(
    (id: string, patch: Partial<TableColumnGroup>) =>
      updateGroups(groups.map(g => (g.id === id ? { ...g, ...patch } : g))),
    [groups, updateGroups],
  );

  const addColumnToGroup = useCallback(
    (groupId: string, colId: string) => {
      // Strip the column from any other group first to enforce 1:1.
      const next = groups.map(g => ({
        ...g,
        columns: g.id === groupId
          ? Array.from(new Set([...g.columns, colId]))
          : g.columns.filter(c => c !== colId),
      }));
      updateGroups(next);
    },
    [groups, updateGroups],
  );

  const removeColumnFromGroup = useCallback(
    (groupId: string, colId: string) => {
      updateGroups(groups.map(g => g.id === groupId ? { ...g, columns: g.columns.filter(c => c !== colId) } : g));
    },
    [groups, updateGroups],
  );

  const labelFor = (colId: string) =>
    config.columns.find(c => c.id === colId)?.label || colId;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] text-muted-foreground leading-snug flex-1">
          Define labeled super-headers above your columns. Each column can belong to one group.
          Requires <span className="font-medium text-foreground">Grouped Headers</span> to render.
        </p>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0" onClick={addGroup}>
          <Plus className="h-3 w-3" /> Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-6 px-3 text-[11px] text-muted-foreground border border-dashed border-border rounded-lg">
          No groups yet. Click <span className="font-medium text-foreground">Group</span> to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(group => {
            const assigned = group.columns;
            const available = visibleColumns.filter(c => {
              const owner = colToGroup.get(c.id);
              return !owner || owner === group.id ? !assigned.includes(c.id) : false;
            });
            return (
              <div key={group.id} className="border border-border rounded-lg p-2.5 space-y-2 bg-background">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-muted-foreground shrink-0" />
                  <Input
                    value={group.label}
                    onChange={e => updateGroup(group.id, { label: e.target.value })}
                    className="h-7 text-xs flex-1 min-w-0"
                    placeholder="Group label"
                  />
                  <Select
                    value={group.align ?? "center"}
                    onValueChange={v => updateGroup(group.id, { align: v as "left" | "center" | "right" })}
                  >
                    <SelectTrigger className="h-7 text-[11px] w-[78px] shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left" className="text-xs">Left</SelectItem>
                      <SelectItem value="center" className="text-xs">Center</SelectItem>
                      <SelectItem value="right" className="text-xs">Right</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive shrink-0"
                    onClick={() => removeGroup(group.id)}
                    aria-label="Remove group"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Assigned columns chips */}
                <div className={cn("flex flex-wrap gap-1", assigned.length === 0 && "min-h-[20px]")}>
                  {assigned.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground italic">No columns assigned</span>
                  ) : (
                    assigned.map(colId => (
                      <Badge key={colId} variant="secondary" className="text-[10px] gap-1 ps-2 pe-1 py-0.5">
                        {labelFor(colId)}
                        <button
                          onClick={() => removeColumnFromGroup(group.id, colId)}
                          className="hover:text-destructive transition-colors"
                          aria-label={`Remove ${labelFor(colId)}`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>

                {/* Add-column picker */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Add column</Label>
                  <Select
                    value=""
                    onValueChange={(v) => v && addColumnToGroup(group.id, v)}
                    disabled={available.length === 0}
                  >
                    <SelectTrigger className="h-7 text-[11px]">
                      <SelectValue placeholder={available.length === 0 ? "All visible columns assigned" : "Select column…"} />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.label || c.key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
