/**
 * Tabular editor for kanban cards. Add/remove/edit card title, column,
 * priority, assignee, tags, due date.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Layers } from "lucide-react";
import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban-builder/data/kanbanBuilderTemplates";

interface Props {
  config: KanbanBuilderConfig;
  cards: KanbanCardData[];
  onCardsChange: (next: KanbanCardData[]) => void;
}

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export function KanbanCardEditor({ config, cards, onCardsChange }: Props) {
  const update = (idx: number, patch: Partial<KanbanCardData>) => {
    onCardsChange(cards.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const remove = (idx: number) => {
    onCardsChange(cards.filter((_, i) => i !== idx));
  };

  const add = () => {
    const colId = config.columns[0]?.id ?? "todo";
    onCardsChange([
      ...cards,
      { id: `card-${Date.now()}`, columnId: colId, title: "New card", priority: "medium" },
    ]);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Cards ({cards.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {cards.map((card, idx) => (
          <div key={card.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md border border-border bg-muted/20">
            <Input
              className="col-span-4 h-8 text-xs"
              value={card.title}
              onChange={(e) => update(idx, { title: e.target.value })}
              placeholder="Title"
            />
            <Select value={card.columnId} onValueChange={(v) => update(idx, { columnId: v })}>
              <SelectTrigger className="col-span-3 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {config.columns.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={card.priority ?? "medium"} onValueChange={(v) => update(idx, { priority: v as KanbanCardData["priority"] })}>
              <SelectTrigger className="col-span-2 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              className="col-span-2 h-8 text-xs"
              placeholder="Assignee"
              value={card.assignee ?? ""}
              onChange={(e) => update(idx, { assignee: e.target.value })}
            />
            <Button variant="ghost" size="icon" className="col-span-1 h-8 w-8 text-destructive" onClick={() => remove(idx)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full h-8 gap-1.5" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add card
        </Button>
      </CardContent>
    </Card>
  );
}