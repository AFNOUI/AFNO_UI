/**
 * Render a `VirtualSchema` as portable PostgreSQL-flavoured DDL. Used by the
 * Schema Engine "Export DDL" button so users can take their pasted CSV/JSON
 * inputs and walk away with `CREATE TABLE` statements that round-trip
 * cleanly through the DDL parser.
 *
 * Output rules:
 *   - Tables are emitted in topological order (referenced tables first) so the
 *     result executes top-to-bottom without forward references.
 *   - PRIMARY KEY (composite or single) is rendered as a table-level
 *     constraint when there are multiple PK columns; otherwise inline.
 *   - REFERENCES is emitted inline on the FK column.
 */
import type { VirtualSchema, VirtualTable, VirtualColumn } from "@/schema-engine/types/types";

function renderColumn(col: VirtualColumn, isOnlyPk: boolean): string {
  const parts: string[] = [`  ${col.name} ${col.type}`];
  if (isOnlyPk) parts.push("PRIMARY KEY");
  if (!col.nullable && !isOnlyPk) parts.push("NOT NULL");
  if (col.isUnique && !col.isPrimaryKey) parts.push("UNIQUE");
  if (col.defaultValue) parts.push(`DEFAULT ${col.defaultValue}`);
  if (col.references) parts.push(`REFERENCES ${col.references.table}(${col.references.column})`);
  return parts.join(" ");
}

function renderTable(t: VirtualTable): string {
  const pks = t.columns.filter(c => c.isPrimaryKey);
  const useTablePk = pks.length > 1;
  const colLines = t.columns.map(c => renderColumn(c, !useTablePk && Boolean(c.isPrimaryKey)));
  if (useTablePk) {
    colLines.push(`  PRIMARY KEY (${pks.map(c => c.name).join(", ")})`);
  }
  return `CREATE TABLE ${t.name} (\n${colLines.join(",\n")}\n);`;
}

/** Topological sort — tables with no outgoing FKs come first. Cycles fall back to input order. */
function topoSort(schema: VirtualSchema): VirtualTable[] {
  const byName = new Map(schema.tables.map(t => [t.name, t]));
  const visited = new Set<string>();
  const out: VirtualTable[] = [];
  const stack = new Set<string>();

  const visit = (name: string) => {
    if (visited.has(name) || stack.has(name)) return;
    const t = byName.get(name);
    if (!t) return;
    stack.add(name);
    for (const col of t.columns) {
      if (col.references && col.references.table !== name) visit(col.references.table);
    }
    stack.delete(name);
    visited.add(name);
    out.push(t);
  };
  schema.tables.forEach(t => visit(t.name));
  return out;
}

export function exportSchemaToDdl(schema: VirtualSchema): string {
  if (schema.tables.length === 0) return "-- (empty schema)\n";
  const ordered = topoSort(schema);
  return ordered.map(renderTable).join("\n\n") + "\n";
}