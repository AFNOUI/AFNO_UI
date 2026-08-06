"use client";

import { useCallback, useMemo } from "react";
import { Database } from "lucide-react";

import { toast } from "@/hooks/use-toast";

import { BuilderJsonDialog } from "@/components/shared/builder-header";

import { TableBuilderConfig, TableRow } from "@/table-builder/data/tableBuilderTemplates";
import type { TableRendererSources } from "@/table-builder/utils/tableCodeGenerator";

interface TableJsonImportDialogProps {
  currentSampleData: TableRow[];
  currentConfig: TableBuilderConfig;
  /**
   * Custom cell-renderer sources of the loaded template. Plain strings, so they
   * ride along in the export and the exported JSON restores the *whole*
   * variant — generated renderer code included — after a refresh.
   */
  currentRendererSources?: TableRendererSources;
  onImport: (
    config: TableBuilderConfig,
    sampleData?: TableRow[],
    rendererSources?: TableRendererSources,
  ) => void;
  /**
   * Replace only the rows, leaving columns and settings alone — the common case
   * when you have real data to drop into a table you already shaped.
   */
  onImportSampleData: (sampleData: TableRow[]) => void;
}

interface ImportPayload {
  sampleData?: TableRow[];
  config: TableBuilderConfig;
  rendererSources?: TableRendererSources;
}

function isImportPayload(value: unknown): value is ImportPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as { config?: unknown };
  if (!v.config || typeof v.config !== "object") return false;
  const cfg = v.config as { columns?: unknown };
  return Array.isArray(cfg.columns);
}

function isBareConfig(value: unknown): value is TableBuilderConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as { columns?: unknown };
  return Array.isArray(v.columns);
}

/** Structural checks that a pasted table config must pass before it is applied. */
function validateConfig(cfg: TableBuilderConfig): string | null {
  const ids = new Set<string>();
  for (const col of cfg.columns) {
    if (!col || typeof col !== "object" || !("id" in col) || !("key" in col) || !("type" in col)) {
      return "Each column must have 'id', 'key', and 'type'.";
    }
    if (typeof col.id !== "string" || !col.id.trim()) return "Every column 'id' must be a non-empty string.";
    if (ids.has(col.id)) return `Duplicate column id "${col.id}". Column ids must be unique.`;
    ids.add(col.id);
    if (col.pinned !== undefined && col.pinned !== null && col.pinned !== "start" && col.pinned !== "end") {
      return `Column "${col.id}" has invalid pinned value. Use "start", "end", or null.`;
    }
  }

  if (cfg.columnGroups !== undefined) {
    if (!Array.isArray(cfg.columnGroups)) return "'columnGroups' must be an array when provided.";
    const groupIds = new Set<string>();
    const seenColRefs = new Set<string>();
    for (const grp of cfg.columnGroups) {
      if (!grp || typeof grp !== "object") return "Each column group must be an object.";
      if (typeof grp.id !== "string" || !grp.id.trim()) return "Each column group needs a non-empty 'id'.";
      if (groupIds.has(grp.id)) return `Duplicate columnGroups id "${grp.id}".`;
      groupIds.add(grp.id);
      if (typeof grp.label !== "string") return `Column group "${grp.id}" needs a 'label' string.`;
      if (!Array.isArray(grp.columns)) return `Column group "${grp.id}" must have a 'columns' string array.`;
      for (const cid of grp.columns) {
        if (typeof cid !== "string") return `Column group "${grp.id}" has a non-string column reference.`;
        if (!ids.has(cid)) return `Column group "${grp.id}" references unknown column id "${cid}".`;
        if (seenColRefs.has(cid)) return `Column id "${cid}" appears in more than one columnGroups entry.`;
        seenColRefs.add(cid);
      }
    }
  }
  return null;
}

/**
 * Normalize a pasted rows array.
 *
 * `TableRow` requires a unique string `id` — the table keys rows by it and row
 * selection/expansion break on collisions. Hand-written or CSV-converted data
 * routinely lacks ids, so fill and de-duplicate rather than rejecting.
 */
function normalizeRows(rows: Record<string, unknown>[]): { rows: TableRow[]; repaired: number } {
  const used = new Set<string>();
  let repaired = 0;

  const normalized = rows.map((row, index) => {
    const raw = row.id;
    let id = typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
    if (!id) {
      id = `row-${index + 1}`;
      repaired += 1;
    }
    if (used.has(id)) {
      let suffix = 2;
      while (used.has(`${id}-${suffix}`)) suffix += 1;
      id = `${id}-${suffix}`;
      repaired += 1;
    }
    used.add(id);
    return { ...row, id } as TableRow;
  });

  return { rows: normalized, repaired };
}

/**
 * Table-builder JSON import/export.
 *
 * Chrome comes from the shared `<BuilderJsonDialog />`; this file owns only the
 * table-specific payload and validation. A third "Sample data" tab lets rows be
 * swapped on their own — it replaces the read-only JSON panel that used to sit
 * in the Builder and Preview tabs, and unlike that panel it round-trips.
 */
export function TableJsonImportDialog({
  onImport, onImportSampleData, currentConfig, currentSampleData, currentRendererSources,
}: TableJsonImportDialogProps) {
  const exportJson = useMemo(
    () =>
      JSON.stringify(
        { config: currentConfig, sampleData: currentSampleData, rendererSources: currentRendererSources },
        null,
        2,
      ),
    [currentConfig, currentSampleData, currentRendererSources],
  );

  const handleImport = useCallback(
    (text: string): string | null => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return "Invalid JSON: " + (e instanceof Error ? e.message : "Parse error");
      }

      if (isImportPayload(parsed)) {
        const err = validateConfig(parsed.config);
        if (err) return err;
        onImport(parsed.config, parsed.sampleData, parsed.rendererSources);
        toast({ title: "Table imported", description: `Loaded "${parsed.config.title || "Untitled"}"` });
        return null;
      }

      if (isBareConfig(parsed)) {
        const err = validateConfig(parsed);
        if (err) return err;
        onImport(parsed);
        toast({ title: "Table imported", description: `Loaded "${parsed.title || "Untitled"}"` });
        return null;
      }

      return "Invalid JSON: expected { config, sampleData?, rendererSources? } or a TableBuilderConfig object.";
    },
    [onImport],
  );

  const sampleDataJson = useMemo(
    () => JSON.stringify(currentSampleData, null, 2),
    [currentSampleData],
  );

  const handleSampleDataImport = useCallback(
    (text: string): string | null => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return "Invalid JSON: " + (e instanceof Error ? e.message : "Parse error");
      }

      if (!Array.isArray(parsed)) {
        return "Sample data must be an array of row objects.";
      }
      const bad = parsed.findIndex((row) => !row || typeof row !== "object" || Array.isArray(row));
      if (bad !== -1) {
        return `Row ${bad + 1} is not an object. Every entry must be a plain row object.`;
      }

      const { rows, repaired } = normalizeRows(parsed as Record<string, unknown>[]);
      onImportSampleData(rows);
      toast({
        title: "Sample data loaded",
        description:
          repaired > 0
            ? `${rows.length} rows — auto-assigned ${repaired} missing or duplicate id${repaired === 1 ? "" : "s"}.`
            : `${rows.length} rows loaded.`,
      });
      return null;
    },
    [onImportSampleData],
  );

  return (
    <BuilderJsonDialog
      title="Table JSON"
      description="Import or export the full table — config, sample data and custom renderers."
      exportJson={exportJson}
      onImport={handleImport}
      extraTabs={[
        {
          id: "data",
          label: "Sample data",
          icon: Database,
          description:
            "Rows only — paste an array of row objects to swap the data without touching your columns or settings. Missing ids are filled in automatically.",
          placeholder: '[\n  { "id": "1", "name": "Ada Lovelace" }\n]',
          json: sampleDataJson,
          onImport: handleSampleDataImport,
        },
      ]}
    />
  );
}
