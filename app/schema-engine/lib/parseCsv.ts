import type { SqlBaseType, VirtualColumn, VirtualTable } from "@/schema-engine/types/types";

/** Split a CSV line, honouring double-quoted fields with embedded commas. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; continue; }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

const INT_RE = /^-?\d+$/;
const FLOAT_RE = /^-?\d+\.\d+$/;
const BOOL_RE = /^(true|false)$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TS_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Infer the most specific SQL type that fits every non-empty sample value. */
function inferTypeFromSamples(samples: ReadonlyArray<string>): SqlBaseType {
  const non = samples.filter(s => s !== "");
  if (non.length === 0) return "TEXT";
  if (non.every(s => UUID_RE.test(s))) return "UUID";
  if (non.every(s => BOOL_RE.test(s))) return "BOOLEAN";
  if (non.every(s => INT_RE.test(s))) {
    return non.some(s => Math.abs(Number(s)) > 2_147_483_647) ? "BIGINT" : "INTEGER";
  }
  if (non.every(s => INT_RE.test(s) || FLOAT_RE.test(s))) return "FLOAT";
  if (non.every(s => TS_RE.test(s))) return "TIMESTAMP";
  if (non.every(s => DATE_RE.test(s))) return "DATE";
  return "TEXT";
}

export interface ParseCsvOptions {
  /** Logical table name. Defaults to "uploaded_table". */
  tableName?: string;
  /** Maximum data rows to sample for type inference (default 200). */
  sampleSize?: number;
}

/**
 * Parse a CSV blob into a `VirtualTable`. Header row is required; types
 * are inferred from up to `sampleSize` data rows.
 */
export function parseCsv(input: string, opts: ParseCsvOptions = {}): VirtualTable {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) throw new Error("CSV is empty");

  const headers = splitCsvLine(lines[0]).map(h => h.trim());
  const sample = lines.slice(1, 1 + (opts.sampleSize ?? 200)).map(splitCsvLine);

  const columns: VirtualColumn[] = headers.map((name, i) => {
    const colSamples = sample.map(row => (row[i] ?? "").trim());
    const type = inferTypeFromSamples(colSamples);
    const nullable = colSamples.some(s => s === "");
    const isPrimaryKey = name.toLowerCase() === "id";
    return { name, type, nullable, isPrimaryKey };
  });

  return { name: opts.tableName ?? "uploaded_table", columns, source: "csv" };
}

/**
 * Parse a multi-table CSV blob into one or more `VirtualTable`s. Tables are
 * separated by `## tableName` marker lines; each section that follows is a
 * standalone CSV (header + rows). Useful for visualising a relational schema
 * from a single text input.
 *
 * Example:
 *   ## users
 *   id,name
 *   1,Ada
 *
 *   ## orders
 *   id,user_id,total
 *   10,1,99
 */
export function parseCsvMulti(input: string, opts: { sampleSize?: number } = {}): VirtualTable[] {
  const lines = input.split(/\r?\n/);
  interface Section { name: string; body: string[]; headerLine: number }
  const sections: Section[] = [];
  let current: Section | null = null;
  const errors: string[] = [];
  const seenNames = new Set<string>();
  // Detect malformed header lines so users get actionable feedback (e.g. `##`
  // missing a name, or a name with disallowed characters).
  const HEADER_OK = /^##\s*([A-Za-z_][\w]*)\s*$/;
  const HEADER_LIKE = /^\s*##/;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/\s+$/, "");
    const lineNo = i + 1;

    if (HEADER_LIKE.test(raw)) {
      const m = HEADER_OK.exec(raw);
      if (!m) {
        errors.push(
          `Line ${lineNo}: malformed section header — expected \`## tableName\` ` +
          `(letters / digits / underscores only), got ${JSON.stringify(raw.trim())}.`,
        );
        continue;
      }
      // Close out the previous section before opening a new one.
      if (current) {
        if (current.body.length === 0) {
          errors.push(`Line ${current.headerLine}: section "${current.name}" has no header row.`);
        }
        sections.push(current);
      }
      const name = m[1];
      if (seenNames.has(name)) {
        errors.push(`Line ${lineNo}: duplicate section name "${name}" — each \`## tableName\` must be unique.`);
      }
      seenNames.add(name);
      current = { name, body: [], headerLine: lineNo };
      continue;
    }
    if (raw.trim().length === 0) continue;
    if (!current) {
      // Allow a single-table CSV to be parsed via the multi entrypoint too.
      current = { name: "table_1", body: [], headerLine: lineNo };
    }
    current.body.push(raw);
  }
  if (current) {
    if (current.body.length === 0) {
      errors.push(`Line ${current.headerLine}: section "${current.name}" has no header row.`);
    }
    sections.push(current);
  }

  if (sections.length === 0) {
    throw new Error(
      "No `## tableName` sections found. Add a marker line such as `## users` " +
      "above each CSV block.",
    );
  }
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return sections
    .filter(s => s.body.length > 0)
    .map(s => parseCsv(s.body.join("\n"), { tableName: s.name, sampleSize: opts.sampleSize }));
}
