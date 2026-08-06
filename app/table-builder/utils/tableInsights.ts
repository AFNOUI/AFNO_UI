/**
 * Table-builder health rules.
 *
 * Pure — takes the config plus the current rows and returns stats + issues for
 * the shared `<BuilderInsightsPanel />`. Every rule here corresponds to
 * something that produces a broken table or non-compiling generated code in a
 * consumer project, not a style preference.
 */

import {
  formatList,
  findDuplicates,
  type BuilderStat,
  type BuilderIssue,
  type BuilderInsights,
} from "@/components/shared/builder-insights";

import type { TableBuilderConfig, TableRow } from "@/table-builder/data/tableBuilderTemplates";

/** Rows scanned when checking that a column's `key` exists in the data. */
const SAMPLE_DEPTH = 50;

export function getTableInsights(
  config: TableBuilderConfig,
  data: TableRow[],
): BuilderInsights {
  const issues: BuilderIssue[] = [];
  const columns = config.columns ?? [];
  const visible = columns.filter((c) => c.visible);

  // ── Columns ─────────────────────────────────────────────────────────────
  if (columns.length === 0) {
    issues.push({
      id: "no-columns",
      level: "error",
      title: "The table has no columns",
      detail: "Generated code would render an empty table shell.",
      fix: "Add a column in the Columns editor below the preview.",
    });
  } else if (visible.length === 0) {
    issues.push({
      id: "no-visible-columns",
      level: "error",
      title: "Every column is hidden",
      detail: "The table renders its header and rows with no cells.",
      fix: "Toggle at least one column visible in the Columns editor.",
    });
  }

  const dupeIds = findDuplicates(columns.map((c) => c.id));
  if (dupeIds.length > 0) {
    issues.push({
      id: "duplicate-column-ids",
      level: "error",
      title: "Duplicate column ids",
      location: formatList(dupeIds),
      detail: "Column ids key React lists and the column-visibility menu; duplicates make sorting and hiding act on the wrong column.",
      fix: "Give each column a unique id.",
    });
  }

  const dupeKeys = findDuplicates(visible.map((c) => c.key));
  if (dupeKeys.length > 0) {
    issues.push({
      id: "duplicate-column-keys",
      level: "warning",
      title: "Two visible columns read the same data key",
      location: formatList(dupeKeys),
      detail: "Both columns will always show identical values.",
      fix: "Point one of them at a different key, or hide it.",
    });
  }

  // ── Columns vs data ─────────────────────────────────────────────────────
  const sample = data.slice(0, SAMPLE_DEPTH);
  if (sample.length > 0) {
    const presentKeys = new Set<string>();
    for (const row of sample) {
      for (const key of Object.keys(row)) presentKeys.add(key);
    }
    const missing = visible
      .filter((c) => c.type !== "actions" && c.key && !presentKeys.has(c.key))
      .map((c) => c.key);
    if (missing.length > 0) {
      issues.push({
        id: "columns-missing-in-data",
        level: "warning",
        title: "Columns reference keys that are missing from the data",
        location: formatList(missing),
        detail: `No row in the first ${Math.min(SAMPLE_DEPTH, sample.length)} contains these keys, so those cells render empty.`,
        fix: "Correct the column key, or load data that includes it via JSON → Sample data.",
      });
    }
  } else {
    issues.push({
      id: "no-rows",
      level: "info",
      title: "No sample data loaded",
      detail: "The preview shows the empty state and cell renderers are untested.",
      fix: "Load rows via JSON → Sample data, or hit Generate 1k rows.",
    });
  }

  // ── Feature combinations that fight each other ──────────────────────────
  if (config.enableVirtualization && config.enablePagination) {
    issues.push({
      id: "virtualization-with-pagination",
      level: "warning",
      title: "Virtualization and pagination are both on",
      detail: "A page holds few enough rows that virtualizing adds cost without benefit.",
      fix: "Turn one off — pagination for long lists, virtualization for one big scroll.",
    });
  }
  if (!config.enableVirtualization && !config.enablePagination && data.length > 200) {
    issues.push({
      id: "unbounded-row-count",
      level: "warning",
      title: `All ${data.length} rows render at once`,
      detail: "Without pagination or virtualization every row stays in the DOM, which stutters on scroll.",
      fix: "Enable pagination or virtualization in Settings.",
    });
  }
  if (config.enableRowGrouping && !columns.some((c) => c.groupable)) {
    issues.push({
      id: "grouping-without-groupable",
      level: "warning",
      title: "Row grouping is on but no column is groupable",
      detail: "The grouping control renders with nothing to group by.",
      fix: "Mark a column groupable, or turn row grouping off.",
    });
  }
  if (config.enableAggregation && !columns.some((c) => c.aggregation)) {
    issues.push({
      id: "aggregation-without-columns",
      level: "warning",
      title: "Aggregation is on but no column aggregates",
      detail: "The footer row renders empty.",
      fix: "Set an aggregation on a numeric column, or turn aggregation off.",
    });
  }
  if (config.enableNestedHeaders && !(config.columnGroups?.length)) {
    issues.push({
      id: "nested-headers-without-groups",
      level: "warning",
      title: "Nested headers are on but no column groups exist",
      detail: "The super-header row renders blank above the table.",
      fix: "Define column groups, or turn nested headers off.",
    });
  }
  if (config.enablePinnedColumns && !columns.some((c) => c.pinned)) {
    issues.push({
      id: "pinning-without-pinned",
      level: "info",
      title: "Column pinning is on but nothing is pinned",
      fix: "Pin a column to start or end, or turn pinning off.",
    });
  }
  if (config.enableFooter && !columns.some((c) => c.aggregation || c.footerLabel)) {
    issues.push({
      id: "footer-without-content",
      level: "info",
      title: "The footer row is on but has no content",
      fix: "Add a footer label or an aggregation to a column.",
    });
  }

  const stats: BuilderStat[] = [
    { label: "columns", value: `${visible.length}/${columns.length}`, hint: "Visible of total" },
    { label: "rows", value: data.length, hint: "Rows currently loaded in the preview" },
    {
      label: "sortable",
      value: columns.filter((c) => c.sortable).length,
      hint: "Columns the user can sort by",
    },
    {
      label: "filterable",
      value: columns.filter((c) => c.filterable).length,
      hint: "Columns with a column filter",
    },
  ];

  return { stats, issues };
}
