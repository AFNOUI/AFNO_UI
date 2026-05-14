import type { SqlBaseType, VirtualColumn, VirtualSchema, VirtualTable } from "@/schema-engine/types/types";

/**
 * Minimal CREATE TABLE parser — handles the dialect-agnostic subset:
 *   - column name + type
 *   - PRIMARY KEY (inline or table-level)
 *   - NOT NULL, UNIQUE, DEFAULT
 *   - REFERENCES <table>(<col>) (inline or table-level FOREIGN KEY)
 *
 * Anything fancier (CHECK with expressions, indexes, partitioning) is
 * silently ignored — we extract what we can rather than failing.
 */

function mapType(raw: string): SqlBaseType {
  const t = raw.toUpperCase().replace(/\(.*\)$/, "").trim();
  if (t.includes("BIGINT")) return "BIGINT";
  if (t.includes("INT") || t === "SERIAL" || t === "BIGSERIAL") return t.includes("BIGINT") || t === "BIGSERIAL" ? "BIGINT" : "INTEGER";
  if (t.includes("BOOL")) return "BOOLEAN";
  if (t.includes("UUID")) return "UUID";
  if (t.includes("JSON")) return "JSON";
  if (t === "TIMESTAMP" || t.startsWith("TIMESTAMP")) return "TIMESTAMP";
  if (t === "DATE") return "DATE";
  if (t.includes("FLOAT") || t.includes("DOUBLE") || t.includes("REAL")) return "FLOAT";
  if (t.includes("DECIMAL") || t.includes("NUMERIC")) return "DECIMAL";
  return "TEXT";
}

function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

interface RawColumn { line: string; }

function splitTopLevel(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of body) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseTable(stmt: string): VirtualTable | null {
  const m = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(([\s\S]+)\)\s*;?$/i.exec(stmt);
  if (!m) return null;
  const tableName = m[1];
  const parts = splitTopLevel(m[2]);

  const columns: VirtualColumn[] = [];
  const tablePks: string[] = [];
  const tableFks: Array<{ from: string; toTable: string; toCol: string }> = [];

  for (const part of parts) {
    const upper = part.toUpperCase();
    if (upper.startsWith("PRIMARY KEY")) {
      const pk = /\(([^)]+)\)/.exec(part);
      if (pk) pk[1].split(",").forEach(c => tablePks.push(c.trim().replace(/["`]/g, "")));
      continue;
    }
    if (upper.startsWith("FOREIGN KEY")) {
      const fk = /FOREIGN\s+KEY\s*\(\s*["`]?(\w+)["`]?\s*\)\s+REFERENCES\s+["`]?(\w+)["`]?\s*\(\s*["`]?(\w+)["`]?\s*\)/i.exec(part);
      if (fk) tableFks.push({ from: fk[1], toTable: fk[2], toCol: fk[3] });
      continue;
    }
    if (upper.startsWith("UNIQUE") || upper.startsWith("CONSTRAINT") || upper.startsWith("CHECK")) continue;

    const colMatch = /^["`]?(\w+)["`]?\s+([A-Z]+(?:\s*\([^)]*\))?)\s*(.*)$/i.exec(part);
    if (!colMatch) continue;
    const name = colMatch[1];
    const type = mapType(colMatch[2]);
    const rest = colMatch[3].toUpperCase();
    const isPrimaryKey = /\bPRIMARY\s+KEY\b/.test(rest);
    const nullable = !/\bNOT\s+NULL\b/.test(rest) && !isPrimaryKey;
    const isUnique = /\bUNIQUE\b/.test(rest);
    const refMatch = /REFERENCES\s+["`]?(\w+)["`]?\s*\(\s*["`]?(\w+)["`]?\s*\)/i.exec(colMatch[3]);
    const defaultMatch = /\bDEFAULT\s+([^\s,]+)/i.exec(colMatch[3]);

    columns.push({
      name,
      type,
      nullable,
      isPrimaryKey,
      isUnique,
      defaultValue: defaultMatch?.[1],
      references: refMatch ? { table: refMatch[1], column: refMatch[2] } : undefined,
    });
  }

  for (const pk of tablePks) {
    const c = columns.find(c => c.name === pk);
    if (c) { c.isPrimaryKey = true; c.nullable = false; }
  }
  for (const fk of tableFks) {
    const c = columns.find(c => c.name === fk.from);
    if (c) c.references = { table: fk.toTable, column: fk.toCol };
  }

  return { name: tableName, columns, source: "ddl" };
}

export function parseDdl(input: string): VirtualSchema {
  const cleaned = stripComments(input);
  const stmts = cleaned.split(/;\s*(?=CREATE\s+TABLE)/i).map(s => s.trim()).filter(Boolean);
  const tables: VirtualTable[] = [];
  for (const s of stmts) {
    const t = parseTable(s.endsWith(";") ? s : s + ";");
    if (t) tables.push(t);
  }
  if (tables.length === 0) throw new Error("No CREATE TABLE statements found");
  return { tables };
}
