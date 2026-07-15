/**
 * Pure tree filter / sort / search hook. Works with the TreeCanvas TreeNode
 * shape (`{ id, label, meta?, children? }`) but stays type-agnostic so it can
 * power the flow builder, tree variants and any future graph view.
 */
import { useMemo } from "react";
import type { GraphFilterState, GraphPredicate } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FilterableNode {
  id: string;
  label: string;
  meta?: any;
  children?: FilterableNode[];
}

export interface FilterResult<N extends FilterableNode> {
  /** Tree with non-matching siblings stripped (mode = "hide"). */
  tree: N;
  /** Set of node ids that match the filter. */
  matches: Set<string>;
  /** Total node count (pre-filter) and matched count. */
  stats: { total: number; matched: number };
  /** All distinct tags found in the tree — handy for chip toolbars. */
  allTags: string[];
}

function walk<N extends FilterableNode>(n: N, fn: (n: N, depth: number) => void, depth = 0): void {
  fn(n, depth);
  n.children?.forEach((c) => walk(c as N, fn, depth + 1));
}

function nodeTags(n: FilterableNode): string[] {
  return Array.isArray(n.meta?.tags) ? (n.meta!.tags as string[]) : [];
}

function sortChildren<N extends FilterableNode>(
  children: N[],
  filter: GraphFilterState,
  predicateMap: Record<string, GraphPredicate>,
): N[] {
  if (filter.sort.field === "none") return children;
  const dir = filter.sort.dir === "asc" ? 1 : -1;
  const arr = [...children];
  arr.sort((a, b) => {
    let av: number | string = "";
    let bv: number | string = "";
    switch (filter.sort.field) {
      case "label": av = a.label; bv = b.label; break;
      case "depth": av = countDescendants(a); bv = countDescendants(b); break;
      case "children": av = a.children?.length ?? 0; bv = b.children?.length ?? 0; break;
      case "custom":
        av = (a.meta?.sortKey as number | string) ?? 0;
        bv = (b.meta?.sortKey as number | string) ?? 0;
        break;
    }
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  // suppress unused predicateMap warning
  void predicateMap;
  return arr;
}

function countDescendants(n: FilterableNode): number {
  let total = 0;
  walk(n, (x) => { if (x !== n) total += 1; });
  return total;
}

export function useGraphFilter<N extends FilterableNode>(
  tree: N,
  filter: GraphFilterState,
  predicates: GraphPredicate[] = [],
): FilterResult<N> {
  return useMemo(() => {
    const predicateMap = Object.fromEntries(predicates.map((p) => [p.id, p]));
    const activePredicate = filter.predicate ? predicateMap[filter.predicate] : undefined;
    const search = filter.search.trim().toLowerCase();

    const matches = new Set<string>();
    let total = 0;
    const allTagsSet = new Set<string>();

    walk(tree, (n, depth) => {
      total += 1;
      nodeTags(n).forEach((t) => allTagsSet.add(t));
      const tags = nodeTags(n);
      const passSearch = search.length === 0 || n.label.toLowerCase().includes(search);
      const passTags = filter.tags.length === 0 || filter.tags.some((t) => tags.includes(t));
      const passPred = activePredicate
        ? activePredicate.test({ label: n.label, tags, depth, meta: n.meta as unknown })
        : true;
      if (passSearch && passTags && passPred) matches.add(n.id);
    });

    /** When mode = "hide", strip non-matching nodes — but always keep the root
     *  and any ancestor of a match so the surviving subtree stays reachable. */
    const ancestorsOfMatch = new Set<string>();
    const collectAncestors = (n: N, chain: N[]) => {
      const next = [...chain, n];
      if (matches.has(n.id)) next.forEach((a) => ancestorsOfMatch.add(a.id));
      n.children?.forEach((c) => collectAncestors(c as N, next));
    };
    collectAncestors(tree, []);

    const prune = (n: N): N | null => {
      const keep = matches.has(n.id) || ancestorsOfMatch.has(n.id) || n.id === tree.id;
      if (!keep) return null;
      const kids = (n.children ?? [])
        .map((c) => prune(c as N))
        .filter((c): c is N => c !== null);
      return { ...n, children: sortChildren(kids, filter, predicateMap) };
    };

    const sortAll = (n: N): N => ({
      ...n,
      children: n.children
        ? sortChildren(n.children.map((c) => sortAll(c as N)) as N[], filter, predicateMap)
        : undefined,
    });

    const finalTree = filter.mode === "hide"
      ? (prune(tree) ?? tree)
      : sortAll(tree);

    return {
      tree: finalTree,
      matches,
      stats: { total, matched: matches.size },
      allTags: [...allTagsSet].sort(),
    };
  }, [tree, filter, predicates]);
}
