"use client";

/**
 * Generic searchable / sortable / filterable table for the per-node `dataset`
 * payload — opens in a Dialog when a node is clicked.
 */
import { useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeDataset } from "@/components/ui/graph/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataset: NodeDataset | null;
  nodeLabel?: string;
}

export function NodeDataTable({ open, onOpenChange, dataset, nodeLabel }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [topN, setTopN] = useState<number | "">("");
  const [filterKey, setFilterKey] = useState<string>("");
  const [filterOp, setFilterOp] = useState<">=" | "<=" | "=" | "starts">(">=");
  const [filterVal, setFilterVal] = useState("");

  const rows = useMemo(() => {
    if (!dataset) return [];
    let r = [...dataset.rows];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      r = r.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(s)),
      );
    }
    if (filterKey && filterVal) {
      const target = filterVal.trim();
      r = r.filter((row) => {
        const raw = row[filterKey];
        if (filterOp === "starts") {
          return String(raw ?? "").toLowerCase().startsWith(target.toLowerCase());
        }
        const num = Number(raw);
        const t = Number(target);
        if (Number.isNaN(num) || Number.isNaN(t)) return String(raw) === target;
        if (filterOp === ">=") return num >= t;
        if (filterOp === "<=") return num <= t;
        return num === t;
      });
    }
    if (sort) {
      r.sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const an = Number(av); const bn = Number(bv);
        const dir = sort.dir === "asc" ? 1 : -1;
        if (!Number.isNaN(an) && !Number.isNaN(bn)) return (an - bn) * dir;
        return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
      });
    }
    if (topN && Number(topN) > 0) r = r.slice(0, Number(topN));
    return r;
  }, [dataset, search, sort, topN, filterKey, filterOp, filterVal]);

  if (!dataset) return null;
  const cols = dataset.columns;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {dataset.title ?? nodeLabel ?? "Node data"}
            <Badge variant="secondary" className="text-[10px]">{rows.length}/{dataset.rows.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rows…" className="h-8 pl-7 text-xs" />
            </div>
            <Input
              type="number" min={0}
              value={topN}
              onChange={(e) => setTopN(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Top N"
              className="h-8 w-[88px] text-xs"
            />
          </div>

          <div className="grid grid-cols-[1fr_80px_1fr] gap-2">
            <select
              value={filterKey}
              onChange={(e) => setFilterKey(e.target.value)}
              className="h-8 text-xs rounded border border-border bg-background px-2"
            >
              <option value="">Filter column…</option>
              {cols.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <select
              value={filterOp}
              onChange={(e) => setFilterOp(e.target.value as typeof filterOp)}
              className="h-8 text-xs rounded border border-border bg-background px-2"
            >
              <option value=">=">≥</option>
              <option value="<=">≤</option>
              <option value="=">=</option>
              <option value="starts">starts with</option>
            </select>
            <Input value={filterVal} onChange={(e) => setFilterVal(e.target.value)} placeholder="value (e.g. 80, A)" className="h-8 text-xs" />
          </div>

          <div className="border border-border rounded-lg overflow-auto max-h-[420px]">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  {cols.map((c) => (
                    <th
                      key={c.key}
                      onClick={() => setSort((s) =>
                        s?.key === c.key
                          ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" }
                          : { key: c.key, dir: "asc" },
                      )}
                      className="text-left px-3 py-2 font-semibold cursor-pointer hover:bg-muted"
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {sort?.key === c.key && (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={cn("border-t border-border", i % 2 && "bg-muted/20")}>
                    {cols.map((c) => (
                      <td key={c.key} className="px-3 py-2">
                        {c.type === "badge"
                          ? <Badge variant="outline" className="text-[10px]">{String(row[c.key] ?? "")}</Badge>
                          : String(row[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={cols.length} className="px-3 py-6 text-center text-muted-foreground">No rows match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
