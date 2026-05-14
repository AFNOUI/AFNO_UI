import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  TableRow,
  SortDescriptor,
  AggregationType,
  TableColumnConfig,
  TableBuilderConfig,
} from "@/table-builder/data/tableBuilderTemplates";

/** Resolve a per-feature data source, falling back to the table's defaults. */
export function resolveSource<TKey extends "search" | "filter" | "sort" | "pagination">(
  config: TableBuilderConfig,
  key: TKey,
): "client" | "api" {
  const explicit = config.sources?.[key];
  if (explicit) return explicit;
  if (key === "sort") return config.sortMode;
  if (key === "pagination") return config.paginationMode;
  // search + filter default to following sort mode (most common pairing).
  return config.sortMode;
}

/** Pure aggregation utility — no dom, no react. */
export function aggregate<TRow extends TableRow>(
  rows: TRow[],
  key: string,
  type: AggregationType,
): string {
  const nums = rows.map(r => Number(r[key])).filter(v => !Number.isNaN(v));
  if (nums.length === 0) return "—";
  switch (type) {
    case "sum": return nums.reduce((a, b) => a + b, 0).toLocaleString();
    case "avg": return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
    case "min": return Math.min(...nums).toLocaleString();
    case "max": return Math.max(...nums).toLocaleString();
    case "count": return String(rows.length);
    default: return "";
  }
}

interface UseTablePreviewArgs<TRow extends TableRow> {
  data: TRow[];
  config: TableBuilderConfig;
}

/**
 * Centralised state + derivations for the live `<TablePreview />` engine.
 * Keeping it here lets the same logic be re-used by the generated DataTable,
 * tests, and storybook — the component stays purely presentational.
 */
export function useTablePreview<TRow extends TableRow>({
  data,
  config,
}: UseTablePreviewArgs<TRow>) {
  // ─── primitive state ────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<TRow[]>(data);
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [sorts, setSorts] = useState<SortDescriptor[]>([]);
  const [pageSize, setPageSize] = useState(config.pageSize);
  const [hiddenCols, setHiddenCols] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const resizingColRef = useRef<{ id: string; startX: number; startWidth: number } | null>(null);

  // ─── reset when data identity flips ───────────────────────────────
  const [prevData, setPrevData] = useState(data);
  if (data !== prevData) {
    setPrevData(data);
    setRows(data);
    setPage(0);
    setSelected([]);
    setExpanded([]);
    setSorts([]);
    setSearch("");
    setColumnFilters({});
    setColumnWidths({});
    setPageSize(config.pageSize);
  }

  // ─── pageSize follows config.pageSize ───────────────────────────────────
  const [prevConfigPageSize, setPrevConfigPageSize] = useState(config.pageSize);
  if (config.pageSize !== prevConfigPageSize) {
    setPrevConfigPageSize(config.pageSize);
    setPageSize(config.pageSize);
    setPage(0);
  }

  // ─── derived: visible columns ───────────────────────────────────────────
  const visibleCols = useMemo<TableColumnConfig[]>(
    () => config.columns.filter(c => c.visible && !hiddenCols.includes(c.id)),
    [config.columns, hiddenCols],
  );

  // ─── derived: filtering ─────────────────────────────────────────────────
  const filtered = useMemo<TRow[]>(() => {
    let data = rows;
    if (config.enableSearch && search) {
      const q = search.toLowerCase();
      data = data.filter(row =>
        visibleCols.some(col => String(row[col.key] ?? "").toLowerCase().includes(q)),
      );
    }
    if (config.enableColumnFilters) {
      Object.entries(columnFilters).forEach(([key, val]) => {
        if (val) {
          data = data.filter(row =>
            String(row[key] ?? "").toLowerCase().includes(val.toLowerCase()),
          );
        }
      });
    }
    return data;
  }, [rows, search, config.enableSearch, config.enableColumnFilters, columnFilters, visibleCols]);

  // ─── derived: multi-sort ────────────────────────────────────────────────
  const sorted = useMemo<TRow[]>(() => {
    if (sorts.length === 0) return filtered;
    return [...filtered].sort((a, b) => {
      for (const { key, dir } of sorts) {
        const av = a[key];
        const bv = b[key];
        let cmp = 0;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
        if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }, [filtered, sorts]);

  // ─── derived: grouping ──────────────────────────────────────────────────
  const grouped = useMemo<Map<string, TRow[]> | null>(() => {
    if (!config.enableRowGrouping || !config.groupBy) return null;
    const groups = new Map<string, TRow[]>();
    sorted.forEach(row => {
      const key = String(row[config.groupBy!] ?? "Other");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    });
    return groups;
  }, [sorted, config.enableRowGrouping, config.groupBy]);

  // ─── derived: pagination ────────────────────────────────────────────────
  const paged = useMemo<TRow[]>(() => {
    if (!config.enablePagination) return sorted;
    return sorted.slice(page * pageSize, (page + 1) * pageSize);
  }, [sorted, page, pageSize, config.enablePagination]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  // ─── handlers ───────────────────────────────────────────────────────────
  const toggleSort = useCallback((key: string, shiftKey: boolean) => {
    setSorts(prev => {
      const existing = prev.find(s => s.key === key);
      const others = config.enableMultiSort && shiftKey ? prev.filter(s => s.key !== key) : [];
      if (existing) {
        if (existing.dir === "asc") return [...others, { key, dir: "desc" }];
        return others;
      }
      return [...others, { key, dir: "asc" }];
    });
  }, [config.enableMultiSort]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected(prev => prev.length === paged.length ? [] : paged.map(r => r.id));
  }, [paged]);

  const toggleColumnVisibility = useCallback((id: string) => {
    setHiddenCols(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  /**
   * Reorder rows by moving the row with id=`activeId` to slot `toIndex`
   * (relative to the post-removal array — same convention as the custom
   * `@/lib/dnd` library).
   */
  const moveRow = useCallback((activeId: string, toIndex: number) => {
    setRows(prev => {
      const oldIdx = prev.findIndex(r => r.id === activeId);
      if (oldIdx === -1) return prev;
      const without = prev.filter(r => r.id !== activeId);
      const clamped = Math.max(0, Math.min(toIndex, without.length));
      const next = [...without];
      next.splice(clamped, 0, prev[oldIdx]);
      // Skip re-render if order is unchanged.
      if (next.every((r, i) => r.id === prev[i]?.id)) return prev;
      return next;
    });
  }, []);

  const handleCellUpdate = useCallback((rowId: string, key: string, value: unknown) => {
    setRows(prev => prev.map(r => r.id === rowId ? ({ ...r, [key]: value } as TRow) : r));
  }, []);

  // ─── column resize ──────────────────────────────────────────────────────
  const startResize = useCallback((colId: string, e: React.MouseEvent) => {
    e.preventDefault();
    resizingColRef.current = {
      id: colId,
      startX: e.clientX,
      startWidth: columnWidths[colId] || config.columns.find(c => c.id === colId)?.width || 150,
    };
  }, [columnWidths, config.columns]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingColRef.current) return;
      const { id, startX, startWidth } = resizingColRef.current;
      const delta = (e.clientX - startX) * (config.direction === "rtl" ? -1 : 1);
      setColumnWidths(prev => ({ ...prev, [id]: Math.max(60, startWidth + delta) }));
    };
    const onUp = () => { resizingColRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [config.direction]);

  return {
    // state
    search, setSearch,
    sorts, setSorts,
    columnFilters, setColumnFilters,
    page, setPage,
    pageSize, setPageSize,
    selected, setSelected,
    expanded, setExpanded,
    hiddenCols,
    columnWidths,
    rows,
    // derived
    visibleCols,
    sorted,
    grouped,
    paged,
    totalPages,
    // handlers
    toggleSort,
    toggleSelect,
    toggleExpand,
    toggleSelectAll,
    toggleColumnVisibility,
    moveRow,
    handleCellUpdate,
    startResize,
  };
}

export type UseTablePreviewReturn<TRow extends TableRow> = ReturnType<typeof useTablePreview<TRow>>;
