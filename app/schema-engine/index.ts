import type { Edge, Node } from "reactflow";

import { parseDdl } from "@/schema-engine/lib/parseDdl";
import { parseCsv, parseCsvMulti } from "@/schema-engine/lib/parseCsv";
import { parseJson, parseJsonMulti } from "@/schema-engine/lib/parseJson";
import { inferForeignKeys } from "@/schema-engine/lib/inferForeignKeys";
import type { VirtualSchema, VirtualTable, VirtualColumn } from "@/schema-engine/types/types";

export type SchemaSourceKind = "ddl" | "json" | "csv";

export interface ParseInputOptions {
  raw: string;
  tableName?: string;
  kind: SchemaSourceKind;
}

export interface ParseInputResult {
  errors: string[];
  schema: VirtualSchema;
}

export function parseInput({ kind, raw, tableName }: ParseInputOptions): ParseInputResult {
  const errors: string[] = [];
  let schema: VirtualSchema = { tables: [] };
  try {
    switch (kind) {
      case "ddl":  schema = parseDdl(raw); break;
      case "json": {
        const trimmed = raw.trimStart();
        if (trimmed.startsWith("{")) {
          schema = { tables: parseJsonMulti(raw) };
        } else {
          const t = parseJson(raw, { tableName: tableName ?? "table_1" });
          schema = { tables: [t] };
        }
        break;
      }
      case "csv": {
        // Multi-table mode when the input contains one or more `## tableName`
        // section markers; otherwise fall back to single-table parsing.
        if (/^##\s*\w+\s*$/m.test(raw)) {
          schema = { tables: parseCsvMulti(raw) };
        } else {
          const t = parseCsv(raw, { tableName: tableName ?? "table_1" });
          schema = { tables: [t] };
        }
        break;
      }
    }
    schema = inferForeignKeys(schema);
  } catch (e) {
    errors.push((e as Error).message);
  }
  if (schema.tables.length === 0) errors.push("No tables found in input.");
  return { schema, errors };
}

// ── React Flow conversion ────────────────────────────────────────────────

export interface TableNodeData {
  table: VirtualTable;
  /** True when any other column references one of this table's columns. */
  isReferenced: boolean;
}

export interface RelationEdgeData {
  /** Cardinality inferred from PK/UNIQUE flags on either side. */
  cardinality: "1-1" | "1-N" | "N-1" | "N-N";
  /** Columns on either side, used by the inspector. */
  fromColumn: string;
  toColumn: string;
  /** True when the FK column on the source side is NULLABLE → partial participation. */
  sourceNullable: boolean;
  /** True when the referenced column on the target side is NULLABLE. */
  targetNullable: boolean;
}

/**
 * Convert a VirtualSchema into React Flow nodes/edges. Edges connect
 * column-level handles (sourceHandle/targetHandle on the column rows) so that
 * lines visually originate from the FK column row, not from the table card.
 */
export function schemaToFlow(schema: VirtualSchema): { nodes: Node<TableNodeData>[]; edges: Edge<RelationEdgeData>[] } {
  const referenced = new Set<string>();
  schema.tables.forEach(t => {
    t.columns.forEach(c => {
      if (c.references) referenced.add(`${c.references.table}.${c.references.column}`);
    });
  });

  const nodes: Node<TableNodeData>[] = schema.tables.map((table, i) => ({
    id: table.name,
    type: "tableNode",
    // Initial fallback layout — the dagre auto-layout overrides this.
    position: { x: (i % 4) * 320, y: Math.floor(i / 4) * 360 },
    data: {
      table,
      isReferenced: table.columns.some(c => referenced.has(`${table.name}.${c.name}`)),
    },
  }));

  const edges: Edge<RelationEdgeData>[] = [];
  schema.tables.forEach(t => {
    t.columns.forEach(c => {
      if (!c.references) return;
      const targetCol = lookupColumn(schema, c.references.table, c.references.column);
      if (!targetCol) return;
      const targetIsUniqueOrPk = targetCol.isPrimaryKey || targetCol.isUnique;
      const sourceIsUniqueOrPk = c.isPrimaryKey || c.isUnique;
      const cardinality: RelationEdgeData["cardinality"] =
        sourceIsUniqueOrPk && targetIsUniqueOrPk ? "1-1"
        : targetIsUniqueOrPk ? "N-1"
        : sourceIsUniqueOrPk ? "1-N" : "N-N";

      edges.push({
        id: `${t.name}.${c.name}->${c.references.table}.${c.references.column}`,
        source: t.name,
        target: c.references.table,
        sourceHandle: `${c.name}-source`,
        targetHandle: `${c.references.column}-target`,
        type: "relation",
        data: {
          cardinality,
          fromColumn: c.name,
          toColumn: c.references.column,
          sourceNullable: c.nullable,
          targetNullable: targetCol.nullable,
        },
      });
    });
  });

  return { nodes, edges };
}

function lookupColumn(schema: VirtualSchema, table: string, column: string): VirtualColumn | undefined {
  return schema.tables.find(t => t.name === table)?.columns.find(c => c.name === column);
}
