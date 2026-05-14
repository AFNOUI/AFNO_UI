"use client";

/**
 * Dialog for adding a new kanban card. Fields are inferred from a sample
 * card (an existing card in the target column, or any card on the board)
 * so the resulting card mirrors the structure/design of existing cards.
 */
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban/types";

interface Props {
  open: boolean;
  lane?: string;
  columnId: string;
  /** Card used as a structural template for the new card. */
  sample?: KanbanCardData;
  config: KanbanBuilderConfig;
  onOpenChange: (open: boolean) => void;
  onSubmit: (card: KanbanCardData) => void;
}

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

type FieldKey =
  | "title"
  | "description"
  | "priority"
  | "assignee"
  | "tags"
  | "dueDate"
  | "estimate"
  | "progress"
  | "comments"
  | "attachments";

function inferFields(sample?: KanbanCardData): FieldKey[] {
  // Always include title. Other fields included if sample defines them.
  const fields: FieldKey[] = ["title"];
  if (!sample) {
    fields.push("description", "priority", "assignee");
    return fields;
  }
  if (sample.description !== undefined) fields.push("description");
  if (sample.priority !== undefined) fields.push("priority");
  if (sample.assignee !== undefined) fields.push("assignee");
  if (sample.tags !== undefined) fields.push("tags");
  if (sample.dueDate !== undefined) fields.push("dueDate");
  if (sample.estimate !== undefined) fields.push("estimate");
  if (sample.progress !== undefined) fields.push("progress");
  if (sample.comments !== undefined) fields.push("comments");
  if (sample.attachments !== undefined) fields.push("attachments");
  return fields;
}

export function KanbanAddCardDialog({ open, onOpenChange, config, sample, columnId, lane, onSubmit }: Props) {
  const fields = useMemo(() => inferFields(sample), [sample]);
  const columnTitle = config.columns.find((c) => c.id === columnId)?.title ?? columnId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<KanbanCardData["priority"]>("medium");
  const [assignee, setAssignee] = useState("");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimate, setEstimate] = useState("");
  const [progress, setProgress] = useState("0");
  const [comments, setComments] = useState("0");
  const [attachments, setAttachments] = useState("0");

  // Reset form when the dialog reopens for a (potentially) new column.
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setPriority(sample?.priority ?? "medium");
    setAssignee("");
    setTags("");
    setDueDate("");
    setEstimate("");
    setProgress("0");
    setComments("0");
    setAttachments("0");
  }, [open, sample]);

  const has = (k: FieldKey) => fields.includes(k);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const id = `card-${Date.now()}`;
    const card: KanbanCardData = { id, columnId, title: title.trim() };
    if (has("description")) card.description = description;
    if (has("priority")) card.priority = priority;
    if (has("assignee")) card.assignee = assignee;
    if (has("tags")) {
      card.tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (has("dueDate")) card.dueDate = dueDate;
    if (has("estimate")) card.estimate = estimate;
    if (has("progress")) card.progress = Math.max(0, Math.min(100, Number(progress) || 0));
    if (has("comments")) card.comments = Math.max(0, Number(comments) || 0);
    if (has("attachments")) card.attachments = Math.max(0, Number(attachments) || 0);
    // Preserve swimlane bucket when present.
    if (lane && config.layout === "swimlane" && config.swimlaneKey) {
      (card as unknown as Record<string, unknown>)[config.swimlaneKey] = lane;
    }
    onSubmit(card);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add card</DialogTitle>
          <DialogDescription>New card in {columnTitle}{lane ? ` · ${lane}` : ""}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="kanban-add-title">Title</Label>
            <Input
              id="kanban-add-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              autoFocus
            />
          </div>

          {has("description") && (
            <div className="space-y-1.5">
              <Label htmlFor="kanban-add-desc">Description</Label>
              <Textarea
                id="kanban-add-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {has("priority") && (
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority ?? "medium"} onValueChange={(v) => setPriority(v as KanbanCardData["priority"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {has("assignee") && (
              <div className="space-y-1.5">
                <Label htmlFor="kanban-add-assignee">Assignee</Label>
                <Input id="kanban-add-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="e.g. JD" />
              </div>
            )}
            {has("dueDate") && (
              <div className="space-y-1.5">
                <Label htmlFor="kanban-add-due">Due date</Label>
                <Input id="kanban-add-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            )}
            {has("estimate") && (
              <div className="space-y-1.5">
                <Label htmlFor="kanban-add-est">Estimate</Label>
                <Input id="kanban-add-est" value={estimate} onChange={(e) => setEstimate(e.target.value)} placeholder="e.g. 4h" />
              </div>
            )}
            {has("progress") && (
              <div className="space-y-1.5">
                <Label htmlFor="kanban-add-prog">Progress (%)</Label>
                <Input id="kanban-add-prog" type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(e.target.value)} />
              </div>
            )}
            {has("comments") && (
              <div className="space-y-1.5">
                <Label htmlFor="kanban-add-comments">Comments</Label>
                <Input id="kanban-add-comments" type="number" min={0} value={comments} onChange={(e) => setComments(e.target.value)} />
              </div>
            )}
            {has("attachments") && (
              <div className="space-y-1.5">
                <Label htmlFor="kanban-add-att">Attachments</Label>
                <Input id="kanban-add-att" type="number" min={0} value={attachments} onChange={(e) => setAttachments(e.target.value)} />
              </div>
            )}
          </div>

          {has("tags") && (
            <div className="space-y-1.5">
              <Label htmlFor="kanban-add-tags">Tags (comma separated)</Label>
              <Input id="kanban-add-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="design, urgent" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Add card</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
