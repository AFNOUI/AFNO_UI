/**
 * Kanban-builder health rules.
 *
 * Pure — takes the board config plus its cards and returns stats + issues for
 * the shared `<BuilderInsightsPanel />`.
 */

import {
  formatList,
  findDuplicates,
  type BuilderStat,
  type BuilderIssue,
  type BuilderInsights,
} from "@/components/shared/builder-insights";

import type { KanbanCardData, KanbanBuilderConfig } from "@/kanban-builder/data/kanbanBuilderTemplates";

export function getKanbanInsights(
  config: KanbanBuilderConfig,
  cards: KanbanCardData[],
): BuilderInsights {
  const issues: BuilderIssue[] = [];
  const columns = config.columns ?? [];
  const columnIds = new Set(columns.map((c) => c.id));

  // ── Columns ─────────────────────────────────────────────────────────────
  if (columns.length === 0) {
    issues.push({
      id: "no-columns",
      level: "error",
      title: "The board has no columns",
      detail: "Cards have nowhere to live and the board renders empty.",
      fix: "Add a column in the Columns section of the settings panel.",
    });
  }

  const dupeColumnIds = findDuplicates(columns.map((c) => c.id));
  if (dupeColumnIds.length > 0) {
    issues.push({
      id: "duplicate-column-ids",
      level: "error",
      title: "Duplicate column ids",
      location: formatList(dupeColumnIds),
      detail: "Cards are matched to columns by id, so cards land in both columns at once and drag-and-drop targets the wrong one.",
      fix: "Give each column a unique id.",
    });
  }

  const untitled = columns.filter((c) => !c.title?.trim()).length;
  if (untitled > 0) {
    issues.push({
      id: "untitled-columns",
      level: "warning",
      title: `${untitled} column${untitled === 1 ? "" : "s"} without a title`,
      detail: "The column header renders blank.",
      fix: "Give every column a title.",
    });
  }

  // ── Cards ───────────────────────────────────────────────────────────────
  const dupeCardIds = findDuplicates(cards.map((c) => c.id));
  if (dupeCardIds.length > 0) {
    issues.push({
      id: "duplicate-card-ids",
      level: "error",
      title: "Duplicate card ids",
      location: formatList(dupeCardIds),
      detail: "Card ids key the drag payload; duplicates make a drag move the wrong card.",
      fix: "Give each card a unique id.",
    });
  }

  const orphans = cards.filter((c) => !columnIds.has(c.columnId));
  if (orphans.length > 0) {
    issues.push({
      id: "orphan-cards",
      level: "error",
      title: `${orphans.length} card${orphans.length === 1 ? "" : "s"} point at a column that does not exist`,
      location: formatList([...new Set(orphans.map((c) => c.columnId))]),
      detail: "These cards are in the data but render nowhere — they silently vanish from the board.",
      fix: "Repoint their columnId at a real column, or recreate the missing column.",
    });
  }

  const untitledCards = cards.filter((c) => !c.title?.trim()).length;
  if (untitledCards > 0) {
    issues.push({
      id: "untitled-cards",
      level: "warning",
      title: `${untitledCards} card${untitledCards === 1 ? "" : "s"} without a title`,
      detail: "The card renders as an empty box.",
      fix: "Add a title in the Cards editor.",
    });
  }

  // ── WIP limits ──────────────────────────────────────────────────────────
  if (config.enableWipLimits) {
    const over = columns
      .filter((col) => typeof col.wipLimit === "number" && col.wipLimit > 0)
      .map((col) => ({
        col,
        count: cards.filter((c) => c.columnId === col.id).length,
      }))
      .filter(({ col, count }) => count > (col.wipLimit ?? 0));

    if (over.length > 0) {
      issues.push({
        id: "wip-exceeded",
        level: "warning",
        title: "Columns are over their WIP limit",
        location: formatList(over.map(({ col, count }) => `${col.title}: ${count}/${col.wipLimit}`)),
        detail: "The board renders these columns in its warning state.",
        fix: "Move cards out, or raise the limit.",
      });
    }

    if (!columns.some((c) => typeof c.wipLimit === "number" && c.wipLimit > 0)) {
      issues.push({
        id: "wip-without-limits",
        level: "info",
        title: "WIP limits are on but no column sets one",
        fix: "Set a WIP limit on a column, or turn WIP limits off.",
      });
    }
  }

  // ── Layout-specific ─────────────────────────────────────────────────────
  if (config.layout === "swimlane" && !config.swimlaneKey) {
    issues.push({
      id: "swimlane-without-key",
      level: "error",
      title: "Swimlane layout has no grouping key",
      detail: "Without a key every card falls into one unnamed lane.",
      fix: "Pick a swimlane key (assignee, priority or swimlane) in Settings.",
    });
  }
  if (config.layout === "calendar" && !cards.some((c) => c.dueDate)) {
    issues.push({
      id: "calendar-without-dates",
      level: "warning",
      title: "Calendar layout but no card has a due date",
      detail: "Cards are bucketed by dueDate, so the calendar renders empty.",
      fix: "Set due dates on cards, or switch layout.",
    });
  }
  if (config.visibleFields?.length === 0) {
    issues.push({
      id: "no-visible-fields",
      level: "info",
      title: "No optional card fields are shown",
      detail: "Cards render title-only.",
      fix: "Enable fields like priority or assignee in Settings.",
    });
  }

  const stats: BuilderStat[] = [
    { label: "columns", value: columns.length },
    { label: "cards", value: cards.length },
    {
      label: "layout",
      value: config.layout,
      hint: "Board layout mode",
    },
    {
      label: "fields",
      value: config.visibleFields?.length ?? 0,
      hint: "Optional card fields rendered",
    },
  ];

  return { stats, issues };
}
