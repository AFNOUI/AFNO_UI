/**
 * Minimal text-only fallback card.
 *
 * Used as the very last resort in the renderer chain after `card.render`,
 * `config.renderCard`, and `defaultRichCardRenderer` have all opted out by
 * returning `undefined`. Kept intentionally bare — no Badge/Avatar/Progress
 * — so users always have a predictable "raw" surface for fully custom boards.
 */
import { cn } from "@/lib/utils";
import type { KanbanCardData, KanbanCardField } from "@/kanban/types";

interface Props {
  compact?: boolean;
  card: KanbanCardData;
  visibleFields: KanbanCardField[];
}

export function KanbanCard({ card, visibleFields, compact }: Props) {
  const has = (k: KanbanCardField) => visibleFields.includes(k);
  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-3 space-y-1 transition-shadow hover:shadow-md",
      compact && "p-2"
    )}>
      <p className={cn("text-sm font-medium leading-tight", compact && "text-xs")}>{card.title}</p>
      {!compact && has("description") && card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
      )}
      {(has("priority") || has("dueDate") || has("assignee")) && (
        <p className="text-[10px] text-muted-foreground">
          {[
            has("priority") && card.priority,
            has("dueDate") && card.dueDate,
            has("assignee") && card.assignee,
          ].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}
