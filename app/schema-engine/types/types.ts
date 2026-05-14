export type SqlBaseType =
  | "DATE"
  | "UUID"
  | "TEXT"
  | "JSON"
  | "BIGINT"
  | "FLOAT"
  | "INTEGER"
  | "DECIMAL"
  | "BOOLEAN"
  | "TIMESTAMP";

/** Categories used by Sieve builders to gate which UIs / functions are valid. */
export type ColumnCategory =
  | "json"
  | "uuid"
  | "string"
  | "numeric"
  | "boolean"
  | "temporal";

export function categoryOf(t: SqlBaseType): ColumnCategory {
  switch (t) {
    case "INTEGER":
    case "BIGINT":
    case "FLOAT":
    case "DECIMAL":
      return "numeric";
    case "DATE":
    case "TIMESTAMP":
      return "temporal";
    case "BOOLEAN":
      return "boolean";
    case "UUID":
      return "uuid";
    case "JSON":
      return "json";
    default:
      return "string";
  }
}

export interface VirtualColumn {
  name: string;
  type: SqlBaseType;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  defaultValue?: string;
  /** Resolved foreign key target — `<table>.<column>`. */
  references?: { table: string; column: string };
}

export interface VirtualTable {
  name: string;
  columns: VirtualColumn[];
  /** Source the table was inferred from. */
  source: "csv" | "json" | "ddl";
}

export interface VirtualSchema {
  tables: VirtualTable[];
}

/** Helper — resolve a `table.column` reference inside a schema. */
export function findColumn(
  schema: VirtualSchema,
  table: string,
  column: string,
): VirtualColumn | undefined {
  return schema.tables
    .find((t) => t.name === table)
    ?.columns.find((c) => c.name === column);
}
