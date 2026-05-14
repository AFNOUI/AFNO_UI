/**
 * Slide-in inspector — opens from the right when a table node is clicked.
 *
 * Layout:
 *  1. Header   — table name, source badge, column count.
 *  2. Summary  — chips for PK / FK / UNIQUE / INDEX / NULLABLE counts.
 *  3. Plain-English overview — generated sentences like
 *       "This table has 4 outgoing relationships and is referenced by 3 others."
 *       "Each issue belongs to exactly one project (many-to-one)."
 *  4. Columns  — every column with full constraint metadata.
 *  5. Relationships — incoming AND outgoing, each annotated with
 *       cardinality (1-1, 1-N, N-1, N-N), participation (total / partial),
 *       a natural-language sentence, and FK cascade rules.
 *
 * The cardinality is derived the same way the canvas edges derive theirs, so
 * what the user sees in the diagram matches what they read here.
 */
import { memo, useMemo } from "react";
import {
  ArrowRight, ArrowLeft, Info, GitBranch, Hash,
  KeyRound, Link2, Lock, Database, Snowflake, ShieldCheck, AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { VirtualSchema, VirtualTable, VirtualColumn } from "@/schema-engine/types/types";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface Props {
  schema: VirtualSchema;
  selectedTable: string | null;
  onClose: () => void;
}

type Cardinality = "1-1" | "1-N" | "N-1" | "N-N";

interface Relationship {
  /** "outgoing" = this table references another. "incoming" = another references this. */
  direction: "outgoing" | "incoming";
  /** The other table involved. */
  otherTable: string;
  /** Column on this table that participates. */
  thisCol: VirtualColumn;
  /** Column on the other table. */
  otherCol: VirtualColumn;
  cardinality: Cardinality;
  /** True if the FK-side column is NULLABLE (partial participation). */
  optional: boolean;
}

export const InspectorSidebar = memo(function InspectorSidebar({ schema, selectedTable, onClose }: Props) {
  const table = useMemo(
    () => schema.tables.find(t => t.name === selectedTable),
    [schema, selectedTable],
  );

  const relationships = useMemo(
    () => (table ? collectRelationships(schema, table) : []),
    [schema, table],
  );

  return (
    <Sheet open={!!selectedTable} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[480px] p-0 flex flex-col">
        {table ? (
          <>
            <SheetHeader className="p-4 border-b border-border space-y-1 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
              <SheetTitle className="flex items-center gap-2">
                <Database size={16} className="text-primary" />
                <span className="font-mono">{table.name}</span>
              </SheetTitle>
              <SheetDescription className="text-xs">
                {table.columns.length} column{table.columns.length === 1 ? "" : "s"} • Source: <strong className="text-foreground/90">{table.source.toUpperCase()}</strong>
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-5">
                <ConstraintSummary table={table} />
                <Overview table={table} relationships={relationships} />
                <ColumnList table={table} />
                <RelationshipList relationships={relationships} />
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">No table selected.</div>
        )}
      </SheetContent>
    </Sheet>
  );
});

/* ───────────────────────── Sections ───────────────────────── */

function ConstraintSummary({ table }: { table: VirtualTable }) {
  const pks = table.columns.filter(c => c.isPrimaryKey);
  const uniques = table.columns.filter(c => c.isUnique && !c.isPrimaryKey);
  const nullable = table.columns.filter(c => c.nullable);
  const required = table.columns.filter(c => !c.nullable);
  const fks = table.columns.filter(c => c.references);
  const indexed = table.columns.filter(c => c.isIndexed);
  const isComposite = pks.length > 1;

  return (
    <section>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
        <ShieldCheck size={11} /> Constraints
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {pks.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            <KeyRound size={10} className="text-amber-500" />
            {pks.length} PK{isComposite ? " (composite)" : ""}
          </Badge>
        )}
        {fks.length > 0 && <Badge variant="secondary" className="gap-1"><Link2 size={10} className="text-blue-500" />{fks.length} FK</Badge>}
        {uniques.length > 0 && <Badge variant="secondary" className="gap-1"><Lock size={10} />{uniques.length} UNIQUE</Badge>}
        {indexed.length > 0 && <Badge variant="secondary" className="gap-1"><Database size={10} />{indexed.length} INDEX</Badge>}
        <Badge variant="outline" className="gap-1"><AlertCircle size={10} className="text-emerald-500" />{required.length} required</Badge>
        <Badge variant="outline" className="gap-1"><Snowflake size={10} />{nullable.length} nullable</Badge>
      </div>
      {isComposite && (
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Composite key: <span className="font-mono">{pks.map(c => c.name).join(" + ")}</span>
        </p>
      )}
    </section>
  );
}

/** Plain-English overview — the most useful new section. */
function Overview({ table, relationships }: { table: VirtualTable; relationships: Relationship[] }) {
  const out = relationships.filter(r => r.direction === "outgoing");
  const inc = relationships.filter(r => r.direction === "incoming");
  const isJunction =
    table.columns.filter(c => c.references).length >= 2 &&
    table.columns.filter(c => c.isPrimaryKey).length >= 2;

  const sentences: string[] = [];
  if (relationships.length === 0) {
    sentences.push(`${table.name} is a standalone table with no foreign-key relationships.`);
  } else {
    sentences.push(
      `${table.name} has ${out.length} outgoing relationship${out.length === 1 ? "" : "s"} ` +
      `and is referenced by ${inc.length} other table${inc.length === 1 ? "" : "s"}.`,
    );
  }
  if (isJunction) {
    sentences.push(
      `This looks like a junction (many-to-many) table — it links its parents through composite keys.`,
    );
  }
  // Highlight up to 3 most informative outgoing/incoming sentences.
  relationships.slice(0, 3).forEach(r => sentences.push(naturalSentence(table.name, r)));

  return (
    <section className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-1">
        <Info size={11} /> Overview
      </h4>
      <ul className="space-y-1.5 text-xs text-foreground/85 leading-relaxed">
        {sentences.map((s, i) => <li key={i}>• {s}</li>)}
      </ul>
    </section>
  );
}

function ColumnList({ table }: { table: VirtualTable }) {
  return (
    <section>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
        <Hash size={11} /> Columns
      </h4>
      <div className="space-y-1.5">
        {table.columns.map(col => <ColumnRow key={col.name} col={col} />)}
      </div>
    </section>
  );
}

function ColumnRow({ col }: { col: VirtualColumn }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2.5 text-xs space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-semibold flex items-center gap-1.5 min-w-0">
          {col.isPrimaryKey && <KeyRound size={11} className="text-amber-500 shrink-0" />}
          {col.references && <Link2 size={11} className="text-blue-500 shrink-0" />}
          <span className="truncate">{col.name}</span>
        </span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider shrink-0">{col.type}</span>
      </div>
      <div className="flex flex-wrap gap-1 text-[10px]">
        {col.isPrimaryKey && (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">PRIMARY KEY</span>
        )}
        {!col.nullable && !col.isPrimaryKey && (
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">NOT NULL</span>
        )}
        {col.nullable && (
          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">NULLABLE</span>
        )}
        {col.isUnique && !col.isPrimaryKey && (
          <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300">UNIQUE</span>
        )}
        {col.defaultValue && (
          <span className="px-1.5 py-0.5 rounded bg-background text-muted-foreground font-mono">DEFAULT {col.defaultValue}</span>
        )}
        {col.isIndexed && (
          <span className="px-1.5 py-0.5 rounded bg-background text-muted-foreground">INDEX (B-TREE)</span>
        )}
        {col.references && (
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">
            FK → {col.references.table}.{col.references.column}
          </span>
        )}
      </div>
    </div>
  );
}

function RelationshipList({ relationships }: { relationships: Relationship[] }) {
  if (relationships.length === 0) return null;
  const outgoing = relationships.filter(r => r.direction === "outgoing");
  const incoming = relationships.filter(r => r.direction === "incoming");

  return (
    <section>
      <Separator className="mb-3" />
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
        <GitBranch size={11} /> Relationships ({relationships.length})
      </h4>
      <div className="space-y-3 text-xs">
        {outgoing.length > 0 && (
          <RelationshipGroup
            title="Outgoing — this table references"
            icon={<ArrowRight size={10} className="text-blue-500" />}
            items={outgoing}
          />
        )}
        {incoming.length > 0 && (
          <RelationshipGroup
            title="Incoming — referenced by"
            icon={<ArrowLeft size={10} className="text-emerald-500" />}
            items={incoming}
          />
        )}
      </div>
    </section>
  );
}

function RelationshipGroup({
  title, icon, items,
}: { title: string; icon: React.ReactNode; items: Relationship[] }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] uppercase font-semibold text-muted-foreground/80 flex items-center gap-1">
        {icon}{title}
      </div>
      {items.map((r, i) => <RelationshipCard key={i} rel={r} />)}
    </div>
  );
}

function RelationshipCard({ rel }: { rel: Relationship }) {
  const colorByDir = rel.direction === "outgoing"
    ? "border-blue-500/30 bg-blue-500/5"
    : "border-emerald-500/30 bg-emerald-500/5";
  const otherTable = rel.otherTable;

  return (
    <div className={cn("rounded-md border p-2.5 space-y-1.5", colorByDir)}>
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[11px] truncate">
          {rel.direction === "outgoing" ? (
            <><strong>{rel.thisCol.name}</strong> → {otherTable}.{rel.otherCol.name}</>
          ) : (
            <>{otherTable}.{rel.otherCol.name} → <strong>{rel.thisCol.name}</strong></>
          )}
        </div>
        <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 shrink-0">
          {prettyCardinality(rel.cardinality)}
        </Badge>
      </div>
      <p className="text-[10.5px] text-foreground/80 leading-snug">
        {naturalSentence(rel.direction === "outgoing" ? "this" : otherTable, rel)}
      </p>
      <div className="flex flex-wrap gap-1 text-[9.5px]">
        <span className={cn(
          "px-1.5 py-0.5 rounded font-semibold",
          rel.optional
            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        )}>
          {rel.optional ? "PARTIAL participation" : "TOTAL participation"}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-background text-muted-foreground font-mono">
          ON DELETE: NO ACTION
        </span>
        <span className="px-1.5 py-0.5 rounded bg-background text-muted-foreground font-mono">
          ON UPDATE: NO ACTION
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

function collectRelationships(schema: VirtualSchema, table: VirtualTable): Relationship[] {
  const out: Relationship[] = [];

  // Outgoing — this table's FK columns reference others.
  table.columns.forEach(c => {
    if (!c.references) return;
    const otherTable = schema.tables.find(t => t.name === c.references!.table);
    const otherCol = otherTable?.columns.find(x => x.name === c.references!.column);
    if (!otherTable || !otherCol) return;
    out.push({
      direction: "outgoing",
      otherTable: otherTable.name,
      thisCol: c,
      otherCol,
      cardinality: classify(c, otherCol),
      optional: c.nullable,
    });
  });

  // Incoming — other tables' FK columns reference this table.
  schema.tables.forEach(other => {
    if (other.name === table.name) return;
    other.columns.forEach(c => {
      if (c.references?.table !== table.name) return;
      const thisCol = table.columns.find(x => x.name === c.references!.column);
      if (!thisCol) return;
      out.push({
        direction: "incoming",
        otherTable: other.name,
        thisCol,
        otherCol: c,
        cardinality: classify(c, thisCol),
        optional: c.nullable,
      });
    });
  });

  return out;
}

function classify(fkCol: VirtualColumn, refCol: VirtualColumn): Cardinality {
  const refUnique = refCol.isPrimaryKey || refCol.isUnique;
  const fkUnique = fkCol.isPrimaryKey || fkCol.isUnique;
  if (fkUnique && refUnique) return "1-1";
  if (refUnique) return "N-1";
  if (fkUnique) return "1-N";
  return "N-N";
}

function prettyCardinality(c: Cardinality): string {
  switch (c) {
    case "1-1": return "1 — 1";
    case "1-N": return "1 — N";
    case "N-1": return "N — 1";
    case "N-N": return "N — N";
  }
}

/**
 * Render a relationship as natural English, e.g.:
 *   "Each issue belongs to exactly one project (many-to-one).
 *    A project can have many issues."
 */
function naturalSentence(perspective: string, r: Relationship): string {
  const me = perspective === "this" ? "this row" : `each ${singular(perspective)}`;
  const them = singular(r.otherTable);
  const themPlural = r.otherTable;

  if (r.direction === "outgoing") {
    // This table references the other.
    switch (r.cardinality) {
      case "N-1":
        return `${cap(me)} ${r.optional ? "may belong to" : "belongs to"} ${r.optional ? "at most one" : "exactly one"} ${them} (many-to-one).`;
      case "1-1":
        return `${cap(me)} ${r.optional ? "may map to" : "maps to"} exactly one ${them} (one-to-one).`;
      case "1-N":
        return `${cap(me)} ${r.optional ? "may have" : "has"} many ${themPlural} (one-to-many through this FK).`;
      case "N-N":
        return `${cap(me)} can be linked to many ${themPlural} (many-to-many).`;
    }
  } else {
    // Incoming — other table references us.
    switch (r.cardinality) {
      case "N-1":
        return `Many ${themPlural} ${r.optional ? "may belong to" : "belong to"} the same ${singular(perspective === "this" ? "row" : perspective)} (one-to-many from this side).`;
      case "1-1":
        return `Each ${them} ${r.optional ? "may map to" : "maps to"} exactly one row here (one-to-one).`;
      case "1-N":
        return `Each ${them} points to many rows here (one-to-many).`;
      case "N-N":
        return `Many ${themPlural} can reference many rows here (many-to-many).`;
    }
  }
}

function singular(word: string): string {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
