import type { VirtualSchema } from "@/schema-engine/types/types";

/**
 * Heuristic FK detection for CSV/JSON sources where the user has no DDL.
 *
 * Rule: a column ending in `_id` whose stem (without `_id`) matches another
 * table's name (or its singular form) is treated as `<that>.id`.
 *
 *   orders.user_id   → users.id   (stem "user" matches "users")
 *   posts.author_id  → authors.id (stem "author" matches "authors")
 *
 * Mutates the schema in place and returns it.
 */
export function inferForeignKeys(schema: VirtualSchema): VirtualSchema {
  const tableNames = new Set(schema.tables.map(t => t.name.toLowerCase()));

  for (const table of schema.tables) {
    for (const col of table.columns) {
      if (col.references) continue;
      if (!col.name.toLowerCase().endsWith("_id")) continue;
      const stem = col.name.slice(0, -3).toLowerCase();
      const candidates = [stem, `${stem}s`, `${stem}es`];
      const match = candidates.find(c => tableNames.has(c));
      if (match && match !== table.name.toLowerCase()) {
        const target = schema.tables.find(t => t.name.toLowerCase() === match)!;
        const pk = target.columns.find(c => c.isPrimaryKey)?.name ?? "id";
        col.references = { table: target.name, column: pk };
      }
    }
  }

  return schema;
}
