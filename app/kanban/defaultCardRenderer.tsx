/**
 * Default *rich* card renderer.
 *
 * Reproduces the Badge/Avatar/Progress/icon visuals that used to be hard-coded
 * inside `KanbanCard.tsx`. It's wired as the engine's fallback in
 * `KanbanBoard.tsx` so existing variants keep their look. Templates that want
 * a custom design either:
 *   • set `config.renderCard` (board-wide), or
 *   • set `card.render` (per-card),
 * and they fall through to this renderer or the minimal `<KanbanCard />` by
 * returning `undefined`.
 *
 * Resolution order at render time:
 *   card.render → config.renderCard → defaultRichCardRenderer → <KanbanCard />
 */
import { Calendar, MessageSquare, Paperclip, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import type { CardRenderer, KanbanCardField } from "./types";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  high: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  urgent: "bg-destructive/10 text-destructive",
};

export const defaultRichCardRenderer: CardRenderer = ({ card, visibleFields, compact }) => {
  const has = (k: KanbanCardField) => visibleFields.includes(k);
  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-3 space-y-2 transition-shadow hover:shadow-md",
      compact && "p-2 space-y-1"
    )}>
      {has("tags") && card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1.5 font-normal">{tag}</Badge>
          ))}
        </div>
      )}

      <p className={cn("text-sm font-medium leading-tight", compact && "text-xs")}>{card.title}</p>

      {!compact && has("description") && card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
      )}

      {has("progress") && typeof card.progress === "number" && (
        <Progress value={card.progress} className="h-1" />
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {has("priority") && card.priority && (
            <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 font-medium border-0", priorityColors[card.priority])}>
              {card.priority}
            </Badge>
          )}
          {has("dueDate") && card.dueDate && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Calendar className="h-2.5 w-2.5" />{card.dueDate}
            </span>
          )}
          {has("estimate") && card.estimate && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />{card.estimate}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {has("comments") && card.comments && card.comments > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MessageSquare className="h-2.5 w-2.5" />{card.comments}
            </span>
          )}
          {has("attachments") && card.attachments && card.attachments > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Paperclip className="h-2.5 w-2.5" />{card.attachments}
            </span>
          )}
          {has("assignee") && card.assignee && (
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                {card.assignee.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
};
