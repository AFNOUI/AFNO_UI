import type { SqlBaseType, VirtualColumn, VirtualTable } from "@/schema-engine/types/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TS_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

function inferFromValue(v: unknown): SqlBaseType {
  if (v === null || v === undefined) return "TEXT";
  if (typeof v === "boolean") return "BOOLEAN";
  if (typeof v === "number") return Number.isInteger(v) ? "INTEGER" : "FLOAT";
  if (typeof v === "string") {
    if (UUID_RE.test(v)) return "UUID";
    if (TS_RE.test(v)) return "TIMESTAMP";
    if (DATE_RE.test(v)) return "DATE";
    return "TEXT";
  }
  return "JSON";
}

/** Reconcile two inferred types — widens to the more permissive option. */
function widen(a: SqlBaseType, b: SqlBaseType): SqlBaseType {
  if (a === b) return a;
  if ((a === "INTEGER" && b === "FLOAT") || (a === "FLOAT" && b === "INTEGER")) return "FLOAT";
  if ((a === "DATE" && b === "TIMESTAMP") || (a === "TIMESTAMP" && b === "DATE")) return "TIMESTAMP";
  return "TEXT";
}

export interface ParseJsonOptions {
  tableName?: string;
}

/**
 * Parse a JSON array of objects into a `VirtualTable`. Nested objects /
 * arrays collapse to `JSON` columns. Mixed primitive types widen.
 *
 * For multi-table JSON input (object of arrays), use {@link parseJsonMulti}.
 */
export function parseJson(input: string, opts: ParseJsonOptions = {}): VirtualTable {
  const data = JSON.parse(input);
  if (!Array.isArray(data)) throw new Error("JSON must be an array of objects");
  if (data.length === 0) throw new Error("JSON array is empty");

  return inferTableFromRows(data as Array<Record<string, unknown>>, opts.tableName ?? "uploaded_table");
}

/** Pure helper — given an array of row objects + a name, infer a VirtualTable. */
function inferTableFromRows(data: Array<Record<string, unknown>>, name: string): VirtualTable {
  const colTypes = new Map<string, SqlBaseType>();
  const colNullable = new Map<string, boolean>();

  for (const row of data) {
    if (typeof row !== "object" || row === null) continue;
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      const inferred = inferFromValue(v);
      const prev = colTypes.get(k);
      colTypes.set(k, prev ? widen(prev, inferred) : inferred);
      if (v === null || v === undefined) colNullable.set(k, true);
    }
  }

  const columns: VirtualColumn[] = Array.from(colTypes.entries()).map(([name, type]) => ({
    name,
    type,
    nullable: colNullable.get(name) ?? false,
    isPrimaryKey: name.toLowerCase() === "id",
  }));

  return { name, columns, source: "json" };
}

/**
 * Parse a JSON object of `{ tableName: rows[] }` into multiple `VirtualTable`s.
 * Throws if the top-level value isn't a plain object of arrays.
 *
 * Example input:
 *   {
 *     "users":  [{ "id": 1, "name": "Ada" }],
 *     "orders": [{ "id": 10, "user_id": 1, "total": 99 }]
 *   }
 */
export function parseJsonMulti(input: string): VirtualTable[] {
  const data = JSON.parse(input);
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Multi-table JSON must be an object of arrays — { tableA: [...], tableB: [...] }");
  }
  const out: VirtualTable[] = [];
  for (const [tableName, rows] of Object.entries(data as Record<string, unknown>)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;
    out.push(inferTableFromRows(rows as Array<Record<string, unknown>>, tableName));
  }
  if (out.length === 0) throw new Error("No non-empty arrays found in JSON object");
  return out;
}
