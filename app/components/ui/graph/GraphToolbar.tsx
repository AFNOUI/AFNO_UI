/**
 * Generic toolbar that sits above any tree/flow canvas.
 * Provides search, sort, tag chips, named predicates, and a hide/dim toggle.
 */
import { Search, ArrowUpDown, EyeOff, Eye, X, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { GraphFilterState, GraphPredicate } from "./types";

interface Props {
  filter: GraphFilterState;
  onChange: (next: GraphFilterState) => void;
  allTags: string[];
  predicates?: GraphPredicate[];
  matched: number;
  total: number;
  className?: string;
  /** Hide individual controls when the consumer wants a slimmer toolbar. */
  showSearch?: boolean;
  showSort?: boolean;
  showFilter?: boolean;
}

export function GraphToolbar({
  filter, onChange, allTags, predicates = [], matched, total, className,
  showSearch = true, showSort = true, showFilter = true,
}: Props) {
  const update = <K extends keyof GraphFilterState>(key: K, value: GraphFilterState[K]) =>
    onChange({ ...filter, [key]: value });

  const toggleTag = (tag: string) => {
    update("tags", filter.tags.includes(tag) ? filter.tags.filter((t) => t !== tag) : [...filter.tags, tag]);
  };

  const hasActive = filter.search || filter.tags.length > 0 || filter.predicate || filter.sort.field !== "none";

  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-border bg-card p-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {showSearch && (
        <div className="relative flex-1 min-w-[180px]" title="Hides or dims nodes whose label doesn't contain this text.">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filter.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Search nodes…"
            className="h-8 pl-7 text-xs"
          />
        </div>
        )}

        {showSort && <>
        <Select
          value={filter.sort.field}
          onValueChange={(v) => update("sort", { ...filter.sort, field: v as GraphFilterState["sort"]["field"] })}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs" title="Re-orders the children of every parent by this metric.">
            <ArrowUpDown className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No sort</SelectItem>
            <SelectItem value="label">Label (A–Z)</SelectItem>
            <SelectItem value="children">Children count</SelectItem>
            <SelectItem value="depth">Subtree size</SelectItem>
            <SelectItem value="custom">Custom (meta.sortKey)</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          title="Toggle ascending / descending"
          onClick={() => update("sort", { ...filter.sort, dir: filter.sort.dir === "asc" ? "desc" : "asc" })}
          disabled={filter.sort.field === "none"}
        >
          {filter.sort.dir === "asc" ? "↑" : "↓"}
        </Button>
        </>}

        {showFilter && predicates.length > 0 && (
          <Select
            value={filter.predicate ?? "__none"}
            onValueChange={(v) => update("predicate", v === "__none" ? undefined : v)}
          >
            <SelectTrigger className="h-8 w-[180px] text-xs" title="Predicate filter — only nodes matching the chosen rule pass.">
              <SelectValue placeholder="Smart filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">No filter</SelectItem>
              {predicates.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showFilter && <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs gap-1"
          title={filter.mode === "dim" ? "Dim mode: non-matches are faded but stay in place. Click to switch to Hide." : "Hide mode: non-matches are removed from the tree. Click to switch to Dim."}
          onClick={() => update("mode", filter.mode === "dim" ? "hide" : "dim")}
        >
          {filter.mode === "dim" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {filter.mode === "dim" ? "Dim" : "Hide"}
        </Button>}

        <span className="text-[10px] text-muted-foreground tabular-nums px-1">
          {matched}/{total}
        </span>

        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs gap-1"
            onClick={() => onChange({ search: "", sort: { field: "none", dir: "asc" }, tags: [], mode: filter.mode })}
          >
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {showFilter && allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1">Tags</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              title={`Filter to nodes tagged "${tag}"`}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                filter.tags.includes(tag)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:text-foreground",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {showFilter && filter.predicate && predicates.find((p) => p.id === filter.predicate)?.description && (
        <Badge variant="secondary" className="text-[10px] w-fit">
          {predicates.find((p) => p.id === filter.predicate)!.description}
        </Badge>
      )}

      {/* Always-visible helptext so users know what each control does. */}
      <p className="flex items-start gap-1 text-[10px] text-muted-foreground leading-snug">
        <Info className="h-3 w-3 mt-0.5 shrink-0" />
        <span>
          {showSearch && <><b>Search</b> matches node labels. </>}
          {showSort && <><b>Sort</b> re-orders each parent's children. </>}
          {showFilter && <><b>Tags / smart filter</b> mark which nodes match; </>}
          {showFilter && <><b>Dim</b> fades non-matches in place, <b>Hide</b> removes them from the tree.</>}
        </span>
      </p>
    </div>
  );
}
