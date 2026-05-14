/**
 * Inferred-relations summary — collapsible footer panel that lists every
 * foreign-key edge and the suggested join paths between the tables that
 * appear in the user's pasted JSON / CSV / DDL input.
 *
 * Why this lives at the bottom of the canvas:
 *   - The graph already shows edges visually; this surface is for the
 *     user who pasted a multi-table CSV/JSON and wants to verify the
 *     auto-inferred FK edges in plain text before trusting them.
 */
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, GitBranch, Link2 } from "lucide-react";

import type { VirtualSchema } from "@/schema-engine/types/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FkEdge {
  toTable: string;
  toColumn: string;
  fromTable: string;
  fromColumn: string;
}

interface JoinPath {
  /** Edges traversed in order, one per hop. */
  edges: FkEdge[];
  /** Sequence of tables joined together. */
  tables: string[];
}

function collectEdges(schema: VirtualSchema): FkEdge[] {
  const out: FkEdge[] = [];
  schema.tables.forEach(t => {
    t.columns.forEach(c => {
      if (c.references) out.push({
        fromTable: t.name, fromColumn: c.name,
        toTable: c.references.table, toColumn: c.references.column,
      });
    });
  });
  return out;
}

/**
 * Walk every FK edge as an undirected graph and surface 2- and 3-hop join
 * paths starting from the most-connected table. Capped to keep the UI tidy.
 */
function suggestJoinPaths(schema: VirtualSchema, edges: FkEdge[], limit = 8): JoinPath[] {
  if (edges.length === 0) return [];
  const adj = new Map<string, FkEdge[]>();
  for (const e of edges) {
    if (!adj.has(e.fromTable)) adj.set(e.fromTable, []);
    if (!adj.has(e.toTable)) adj.set(e.toTable, []);
    adj.get(e.fromTable)!.push(e);
    adj.get(e.toTable)!.push(e);
  }
  // Rank tables by degree (most relationships first) — they make the best roots.
  const roots = [...adj.keys()].sort((a, b) => (adj.get(b)!.length - adj.get(a)!.length));
  const out: JoinPath[] = [];
  const seen = new Set<string>();

  const dfs = (table: string, depth: number, path: string[], used: FkEdge[]) => {
    if (out.length >= limit) return;
    if (depth >= 2) {
      const key = path.join(">");
      const reverse = [...path].reverse().join(">");
      if (!seen.has(key) && !seen.has(reverse)) {
        seen.add(key);
        out.push({ tables: [...path], edges: [...used] });
      }
      if (depth >= 3) return;
    }
    for (const e of adj.get(table) ?? []) {
      const next = e.fromTable === table ? e.toTable : e.fromTable;
      if (path.includes(next)) continue;
      dfs(next, depth + 1, [...path, next], [...used, e]);
    }
  };

  for (const root of roots) {
    if (out.length >= limit) break;
    dfs(root, 0, [root], []);
  }
  return out;
}

interface Props {
  schema: VirtualSchema;
}

export function RelationsSummary({ schema }: Props) {
  const [open, setOpen] = useState(true);
  const edges = useMemo(() => collectEdges(schema), [schema]);
  const paths = useMemo(() => suggestJoinPaths(schema, edges), [schema, edges]);

  if (schema.tables.length < 2) return null;

  return (
    <div className="border-t border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold">
          <GitBranch size={12} className="text-primary" />
          Inferred relations
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">
            {edges.length} FK · {paths.length} path{paths.length === 1 ? "" : "s"}
          </Badge>
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border-t border-border/50">
          {/* Foreign keys */}
          <section>
            <h5 className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
              <Link2 size={10} /> Foreign keys ({edges.length})
            </h5>
            {edges.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">
                No foreign keys inferred. Use a column suffix like <code className="font-mono">user_id</code> matching another table to auto-detect.
              </p>
            ) : (
              <ScrollArea className="max-h-44 rounded border border-border bg-muted/20">
                <ul className="text-[11px] font-mono divide-y divide-border/50">
                  {edges.map((e, i) => (
                    <li key={i} className="px-2 py-1 flex items-center gap-2">
                      <span className="truncate">
                        <span className="text-foreground">{e.fromTable}</span>
                        <span className="text-muted-foreground">.</span>
                        <span className="text-primary">{e.fromColumn}</span>
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="truncate">
                        <span className="text-foreground">{e.toTable}</span>
                        <span className="text-muted-foreground">.</span>
                        <span className="text-primary">{e.toColumn}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </section>
          {/* Join paths */}
          <section>
            <h5 className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
              <GitBranch size={10} /> Suggested join paths
            </h5>
            {paths.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">
                Join paths appear once at least two tables share a foreign-key edge.
              </p>
            ) : (
              <ScrollArea className="max-h-44 rounded border border-border bg-muted/20">
                <ul className="text-[11px] font-mono divide-y divide-border/50">
                  {paths.map((p, i) => (
                    <li key={i} className="px-2 py-1 truncate" title={p.tables.join(" → ")}>
                      {p.tables.map((t, j) => (
                        <span key={j}>
                          {j > 0 && <span className="text-muted-foreground"> ⨝ </span>}
                          <span className="text-foreground">{t}</span>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </section>
        </div>
      )}
    </div>
  );
}