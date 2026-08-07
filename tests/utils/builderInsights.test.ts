import { describe, expect, it } from "vitest";

import {
  sortIssues,
  formatList,
  findDuplicates,
  summarizeIssues,
  isUnsafeIdentifier,
} from "@/components/shared/builder-insights";
import type { BuilderIssue } from "@/components/shared/builder-insights";

import { getFormInsights } from "@/form-builder/utils/formInsights";
import { getTreeInsights } from "@/tree-builder/utils/treeInsights";
import { getTableInsights } from "@/table-builder/utils/tableInsights";
import { getKanbanInsights } from "@/kanban-builder/utils/kanbanInsights";

import { initialConfig } from "@/form-builder/config/constants";
import { treeTemplates, defaultTreeKey } from "@/tree-builder/data/treeBuilderTemplates";
import {
  defaultTableConfig,
  defaultSampleData,
} from "@/table-builder/data/tableBuilderTemplates";
import {
  defaultKanbanCards,
  defaultKanbanConfig,
} from "@/kanban-builder/data/kanbanBuilderTemplates";

import type { FormConfig } from "@/forms/types/types";
import type { TreeNode } from "@/trees/types";
import type { TableBuilderConfig, TableRow } from "@/table-builder/data/tableBuilderTemplates";
import type { KanbanCardData, KanbanBuilderConfig } from "@/kanban-builder/data/kanbanBuilderTemplates";

const issue = (id: string, level: BuilderIssue["level"]): BuilderIssue => ({
  id,
  level,
  title: id,
});

/** All ids reported by a rule set — the assertion surface for these tests. */
const idsOf = (issues: BuilderIssue[]) => issues.map((i) => i.id);

describe("builder-insights / shared utils", () => {
  it("summarizes issues by level", () => {
    const summary = summarizeIssues([
      issue("a", "error"),
      issue("b", "warning"),
      issue("c", "warning"),
      issue("d", "info"),
    ]);
    expect(summary).toEqual({ errors: 1, warnings: 2, infos: 1, total: 4 });
  });

  it("sorts errors before warnings before notes, stable within a level", () => {
    const sorted = sortIssues([
      issue("info-1", "info"),
      issue("warn-1", "warning"),
      issue("err-1", "error"),
      issue("warn-2", "warning"),
    ]);
    expect(idsOf(sorted)).toEqual(["err-1", "warn-1", "warn-2", "info-1"]);
  });

  it("finds duplicates once each, regardless of repeat count", () => {
    expect(findDuplicates(["a", "b", "a", "c", "a"])).toEqual(["a"]);
    expect(findDuplicates(["a", "b"])).toEqual([]);
  });

  it("rejects identifiers that would break generated code", () => {
    expect(isUnsafeIdentifier("firstName")).toBe(false);
    expect(isUnsafeIdentifier("_private$1")).toBe(false);
    expect(isUnsafeIdentifier("first name")).toBe(true);
    expect(isUnsafeIdentifier("first-name")).toBe(true);
    expect(isUnsafeIdentifier("1st")).toBe(true);
    expect(isUnsafeIdentifier("")).toBe(true);
  });

  it("truncates long lists rather than dumping every value", () => {
    expect(formatList(["a", "b"])).toBe('"a" and "b"');
    expect(formatList(["a", "b", "c", "d", "e", "f"])).toContain("+2 more");
  });
});

describe("builder-insights / form rules", () => {
  it("treats the empty starting canvas as a note, never an error", () => {
    // The form builder boots with zero fields, so an error here would greet
    // every visitor with a red panel on a form they have not built yet.
    const { issues } = getFormInsights(initialConfig);
    expect(idsOf(issues)).toEqual(["no-fields"]);
    expect(issues.every((i) => i.level === "info")).toBe(true);
  });

  it("flags an empty form", () => {
    const empty: FormConfig = { id: "f", sections: [{ id: "s", title: "", fields: [] }] };
    expect(idsOf(getFormInsights(empty).issues)).toContain("no-fields");
  });

  it("flags duplicate names, unsafe names and missing labels", () => {
    const config = {
      id: "f",
      sections: [
        {
          id: "s",
          title: "S",
          fields: [
            { type: "text", name: "email", label: "Email" },
            { type: "text", name: "email", label: "Email again" },
            { type: "text", name: "first name", label: "" },
          ],
        },
      ],
    } as unknown as FormConfig;

    const ids = idsOf(getFormInsights(config).issues);
    expect(ids).toContain("duplicate-field-names");
    expect(ids).toContain("unsafe-field-names");
    expect(ids).toContain("unlabelled-fields");
  });

  it("flags a condition pointing at a field that does not exist", () => {
    const config = {
      id: "f",
      sections: [
        {
          id: "s",
          title: "S",
          fields: [
            { type: "text", name: "a", label: "A" },
            {
              type: "text",
              name: "b",
              label: "B",
              condition: { field: "ghost", operator: "equals", value: "1" },
            },
          ],
        },
      ],
    } as unknown as FormConfig;

    expect(idsOf(getFormInsights(config).issues)).toContain("broken-conditions");
  });

  it("counts sections, fields and required fields", () => {
    const stats = getFormInsights(initialConfig).stats;
    expect(stats.map((s) => s.label)).toEqual([
      "sections",
      "fields",
      "required",
      "conditional",
    ]);
  });
});

describe("builder-insights / table rules", () => {
  it("reports nothing for the builder's own starting config", () => {
    expect(getTableInsights(defaultTableConfig, defaultSampleData as TableRow[]).issues).toEqual([]);
  });

  it("flags duplicate column ids", () => {
    const config = {
      ...defaultTableConfig,
      columns: [
        { id: "dup", key: "a", label: "A", type: "text", sortable: false, filterable: false, visible: true },
        { id: "dup", key: "b", label: "B", type: "text", sortable: false, filterable: false, visible: true },
      ],
    } as TableBuilderConfig;

    expect(idsOf(getTableInsights(config, [{ id: "1", a: 1, b: 2 }]).issues))
      .toContain("duplicate-column-ids");
  });

  it("flags a column whose key is absent from the data", () => {
    const config = {
      ...defaultTableConfig,
      columns: [
        { id: "c1", key: "missing", label: "M", type: "text", sortable: false, filterable: false, visible: true },
      ],
    } as TableBuilderConfig;

    expect(idsOf(getTableInsights(config, [{ id: "1", present: 1 }]).issues))
      .toContain("columns-missing-in-data");
  });

  it("flags virtualization and pagination fighting each other", () => {
    const config = {
      ...defaultTableConfig,
      enableVirtualization: true,
      enablePagination: true,
    } as TableBuilderConfig;

    expect(idsOf(getTableInsights(config, defaultSampleData as TableRow[]).issues))
      .toContain("virtualization-with-pagination");
  });

  it("notes when no rows are loaded", () => {
    expect(idsOf(getTableInsights(defaultTableConfig, []).issues)).toContain("no-rows");
  });
});

describe("builder-insights / kanban rules", () => {
  it("reports nothing for the builder's own starting board", () => {
    expect(getKanbanInsights(defaultKanbanConfig, defaultKanbanCards).issues).toEqual([]);
  });

  it("flags cards pointing at a column that does not exist", () => {
    const orphan: KanbanCardData = { id: "x", columnId: "ghost", title: "Orphan" };
    expect(idsOf(getKanbanInsights(defaultKanbanConfig, [orphan]).issues))
      .toContain("orphan-cards");
  });

  it("flags a column over its WIP limit", () => {
    const config = {
      ...defaultKanbanConfig,
      enableWipLimits: true,
      columns: [{ id: "todo", title: "To Do", wipLimit: 1 }],
    } as KanbanBuilderConfig;
    const cards: KanbanCardData[] = [
      { id: "a", columnId: "todo", title: "A" },
      { id: "b", columnId: "todo", title: "B" },
    ];

    expect(idsOf(getKanbanInsights(config, cards).issues)).toContain("wip-exceeded");
  });

  it("flags a swimlane layout with no grouping key", () => {
    const config = {
      ...defaultKanbanConfig,
      layout: "swimlane",
      swimlaneKey: undefined,
    } as KanbanBuilderConfig;

    expect(idsOf(getKanbanInsights(config, defaultKanbanCards).issues))
      .toContain("swimlane-without-key");
  });
});

describe("builder-insights / tree rules", () => {
  const template = treeTemplates[defaultTreeKey];

  it("reports nothing for the builder's own starting flow", () => {
    // Shipped templates run 10+ levels deep, so depth must not be flagged on
    // its own — only when pan/zoom is off and those levels are unreachable.
    expect(getTreeInsights(template.tree, template.config).issues).toEqual([]);
  });

  it("flags a deep flow only when pan and zoom is off", () => {
    const deep: TreeNode = Array.from({ length: 8 }).reduce<TreeNode>(
      (child, _, i) => ({ id: `n${i}`, label: `N${i}`, children: [child] }),
      { id: "leaf", label: "Leaf" },
    );

    expect(idsOf(getTreeInsights(deep, { ...template.config, panZoom: true }).issues))
      .not.toContain("deep-without-pan-zoom");
    expect(idsOf(getTreeInsights(deep, { ...template.config, panZoom: false }).issues))
      .toContain("deep-without-pan-zoom");
  });

  it("flags duplicate node ids anywhere in the tree", () => {
    const tree: TreeNode = {
      id: "root",
      label: "Root",
      children: [
        { id: "dup", label: "A" },
        { id: "dup", label: "B" },
      ],
    };

    expect(idsOf(getTreeInsights(tree, template.config).issues)).toContain("duplicate-node-ids");
  });

  it("flags a route action with no href", () => {
    const tree: TreeNode = {
      id: "root",
      label: "Root",
      children: [{ id: "a", label: "A", meta: { action: { kind: "route", href: "" } } }],
    };

    expect(idsOf(getTreeInsights(tree, template.config).issues)).toContain("route-without-href");
  });

  it("flags a node holding more children than maxChildren allows", () => {
    const tree: TreeNode = {
      id: "root",
      label: "Root",
      meta: { maxChildren: 1 },
      children: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    };

    expect(idsOf(getTreeInsights(tree, template.config).issues)).toContain("over-max-children");
  });

  it("measures depth and leaf count", () => {
    const tree: TreeNode = {
      id: "root",
      label: "Root",
      children: [{ id: "a", label: "A", children: [{ id: "b", label: "B" }] }],
    };
    const stats = getTreeInsights(tree, template.config).stats;

    expect(stats.find((s) => s.label === "nodes")?.value).toBe(3);
    expect(stats.find((s) => s.label === "depth")?.value).toBe(3);
    expect(stats.find((s) => s.label === "leaves")?.value).toBe(1);
  });
});
