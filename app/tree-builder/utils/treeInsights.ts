/**
 * Flow-builder health rules.
 *
 * Pure — walks the tree once and returns stats + issues for the shared
 * `<BuilderInsightsPanel />`.
 */

import {
  formatList,
  type BuilderStat,
  type BuilderIssue,
  type BuilderInsights,
} from "@/components/shared/builder-insights";

import type { TreeNode, TreeCanvasConfig } from "@/trees/types";

interface Walked {
  count: number;
  depth: number;
  ids: string[];
  unlabelled: string[];
  overCapacity: string[];
  routeWithoutHref: string[];
  emptyDialogs: string[];
  leaves: number;
  widestLevel: number;
}

/** Single traversal — the rules below all read from this. */
function walk(root: TreeNode): Walked {
  const out: Walked = {
    count: 0,
    depth: 0,
    ids: [],
    unlabelled: [],
    overCapacity: [],
    routeWithoutHref: [],
    emptyDialogs: [],
    leaves: 0,
    widestLevel: 0,
  };
  const perLevel = new Map<number, number>();

  const visit = (node: TreeNode, depth: number) => {
    out.count += 1;
    out.depth = Math.max(out.depth, depth);
    out.ids.push(node.id);
    perLevel.set(depth, (perLevel.get(depth) ?? 0) + 1);

    if (!node.label?.trim()) out.unlabelled.push(node.id);

    const children = node.children ?? [];
    if (children.length === 0) out.leaves += 1;

    const max = node.meta?.maxChildren;
    if (typeof max === "number" && children.length > max) {
      out.overCapacity.push(`${node.label || node.id}: ${children.length}/${max}`);
    }

    const action = node.meta?.action;
    if (action?.kind === "route" && !action.href?.trim()) {
      out.routeWithoutHref.push(node.label || node.id);
    }
    if (
      (action?.kind === "dialog" || action?.kind === "drawer" || action?.kind === "panel") &&
      !action.body?.trim() &&
      !action.title?.trim()
    ) {
      out.emptyDialogs.push(node.label || node.id);
    }

    for (const child of children) visit(child, depth + 1);
  };

  visit(root, 1);
  out.widestLevel = Math.max(0, ...perLevel.values());
  return out;
}

export function getTreeInsights(tree: TreeNode, config: TreeCanvasConfig): BuilderInsights {
  const issues: BuilderIssue[] = [];
  const walked = walk(tree);

  // ── Identity ────────────────────────────────────────────────────────────
  // Duplicates are computed here rather than via findDuplicates so the message
  // can distinguish "appears twice" from "appears many times".
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of walked.ids) {
    if (seen.has(id)) dupes.add(id);
    else seen.add(id);
  }
  if (dupes.size > 0) {
    issues.push({
      id: "duplicate-node-ids",
      level: "error",
      title: "Duplicate node ids",
      location: formatList([...dupes]),
      detail: "Selection, editing and edge routing all resolve nodes by id, so an edit lands on whichever duplicate is found first.",
      fix: "Give each node a unique id.",
    });
  }

  if (walked.unlabelled.length > 0) {
    issues.push({
      id: "unlabelled-nodes",
      level: "warning",
      title: `${walked.unlabelled.length} node${walked.unlabelled.length === 1 ? "" : "s"} without a label`,
      location: formatList(walked.unlabelled),
      detail: "The node renders as an empty box on the canvas.",
      fix: "Set a label in the node editor.",
    });
  }

  // ── Capacity + actions ──────────────────────────────────────────────────
  if (walked.overCapacity.length > 0) {
    issues.push({
      id: "over-max-children",
      level: "warning",
      title: "Nodes exceed their maxChildren limit",
      location: formatList(walked.overCapacity),
      detail: "The canvas renders them, but the add-child control stays disabled and the limit no longer means anything.",
      fix: "Remove children, or raise maxChildren on those nodes.",
    });
  }

  if (walked.routeWithoutHref.length > 0) {
    issues.push({
      id: "route-without-href",
      level: "error",
      title: "Route actions with no href",
      location: formatList(walked.routeWithoutHref),
      detail: "Clicking the node in Preview navigates nowhere.",
      fix: "Set the href, or change the click action.",
    });
  }

  if (walked.emptyDialogs.length > 0) {
    issues.push({
      id: "empty-dialog-actions",
      level: "warning",
      title: "Dialog, drawer or panel actions with no title or body",
      location: formatList(walked.emptyDialogs),
      detail: "Clicking the node opens an empty surface.",
      fix: "Add a title or body, or set the action to none.",
    });
  }

  // ── Shape + layout ──────────────────────────────────────────────────────
  if (walked.count === 1) {
    issues.push({
      id: "root-only",
      level: "info",
      title: "The flow is a single root node",
      detail: "There is nothing to lay out or connect yet.",
      fix: "Add child nodes with the + control on the root.",
    });
  }

  // Depth alone is fine — several shipped templates are 10+ levels deep. It
  // only becomes a usability problem when the canvas cannot be navigated.
  if (walked.depth > 6 && !config.panZoom) {
    issues.push({
      id: "deep-without-pan-zoom",
      level: "info",
      title: `The flow is ${walked.depth} levels deep with pan and zoom off`,
      detail: "Deeper levels render outside the canvas with no way to scroll to them.",
      fix: "Turn on pan and zoom in Settings, or flatten the flow.",
    });
  }

  if (walked.widestLevel > 12 && config.layout !== "vertical") {
    issues.push({
      id: "very-wide",
      level: "info",
      title: `One level holds ${walked.widestLevel} nodes`,
      detail: "Wide levels scroll far horizontally in this layout.",
      fix: "Switch to the vertical layout, or group the children under intermediate nodes.",
    });
  }

  const stats: BuilderStat[] = [
    { label: "nodes", value: walked.count },
    { label: "depth", value: walked.depth, hint: "Deepest level in the tree" },
    { label: "leaves", value: walked.leaves, hint: "Nodes with no children" },
    { label: "layout", value: config.layout, hint: "Canvas layout mode" },
  ];

  return { stats, issues };
}
