"use client";

import { useMemo, useState } from "react";
import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDraggable, useDropZone } from "@/components/ui/dnd";

interface Task {
  id: string;
  title: string;
  priority: "low" | "med" | "high";
}

function Bucket({
  level,
  label,
  tone,
  tasks,
  onAccept,
}: {
  level: Task["priority"];
  label: string;
  tone: string;
  tasks: Task[];
  onAccept: (id: string) => void;
}) {
  const { zoneProps, isOver, isDragging } = useDropZone<
    { level: Task["priority"] },
    { id: string }
  >({
    id: `bucket-${level}`,
    data: { level },
    onDrop: ({ item }) => onAccept(item.data.id),
  });
  return (
    <div
      {...zoneProps}
      className={cn(
        "flex-1 min-w-0 rounded-lg border-2 p-3 transition",
        isOver
          ? "border-primary"
          : isDragging
            ? "border-dashed"
            : "border-transparent",
        tone,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
        <Flag className="h-3 w-3" />
      </div>
      <div className="space-y-1.5">
        {tasks.map((t) => {
          const D = () => {
            const { dragProps, isDragging: dragging } = useDraggable({
              id: t.id,
              data: { id: t.id },
              preview: () => (
                <div className="rounded-md border bg-card px-2 py-1 text-xs shadow-lg">
                  {t.title}
                </div>
              ),
            });
            return (
              <div
                {...dragProps}
                className={cn(
                  "rounded-md bg-card/80 px-2 py-1 text-xs shadow-sm backdrop-blur truncate",
                  dragging && "opacity-30",
                )}
              >
                {t.title}
              </div>
            );
          };
          return <D key={t.id} />;
        })}
        {tasks.length === 0 && <p className="text-[10px] opacity-60">Empty</p>}
      </div>
    </div>
  );
}

export function BucketsDemo() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "k1", title: "Fix login bug", priority: "med" },
    { id: "k2", title: "Update docs", priority: "low" },
    { id: "k3", title: "Investigate outage", priority: "high" },
    { id: "k4", title: "Refactor parser", priority: "med" },
    { id: "k5", title: "Add tests", priority: "low" },
  ]);

  const move = (id: string, level: Task["priority"]) =>
    setTasks((cur) =>
      cur.map((t) => (t.id === id ? { ...t, priority: level } : t)),
    );

  const grouped = useMemo(
    () => ({
      low: tasks.filter((t) => t.priority === "low"),
      med: tasks.filter((t) => t.priority === "med"),
      high: tasks.filter((t) => t.priority === "high"),
    }),
    [tasks],
  );

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Bucket
        level="low"
        label="Low"
        tone="bg-emerald-500/10"
        tasks={grouped.low}
        onAccept={(id) => move(id, "low")}
      />
      <Bucket
        level="med"
        label="Medium"
        tone="bg-amber-500/10"
        tasks={grouped.med}
        onAccept={(id) => move(id, "med")}
      />
      <Bucket
        level="high"
        label="High"
        tone="bg-rose-500/10"
        tasks={grouped.high}
        onAccept={(id) => move(id, "high")}
      />
    </div>
  );
}

export const bucketsSnippet = `import { useState } from "react";

import { cn } from "../../lib/utils";
import { useDraggable, useDropZone } from "../../components/dnd";

type Priority = "low" | "medium" | "high";
interface Task { id: string; label: string; priority: Priority }
type TaskDragData = { id: string } & Record<string, unknown>;
type BucketZoneData = { priority: Priority } & Record<string, unknown>;

const TONES: Record<Priority, string> = {
  low: "border-emerald-500/40 bg-emerald-500/10",
  medium: "border-amber-500/40 bg-amber-500/10",
  high: "border-rose-500/40 bg-rose-500/10",
};

function Bucket({ priority, tasks, onDrop }: { priority: Priority; tasks: Task[]; onDrop: (id: string) => void }) {
  const { zoneProps, isOver } = useDropZone<BucketZoneData, TaskDragData>({
    id: \`bucket-\${priority}\`, data: { priority },
    onDrop: ({ item }) => onDrop(item.data.id),
  });
  return (
    <div {...zoneProps}
      className={cn("flex-1 min-h-[180px] space-y-2 rounded-lg border-2 p-3", TONES[priority], isOver && "ring-2 ring-primary")}>
      <p className="text-xs font-semibold uppercase">{priority}</p>
      {tasks.map((task) => {
        const D = () => {
          const { dragProps, isDragging } = useDraggable<TaskDragData>({
            id: task.id, data: { id: task.id },
            preview: () => <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-lg">{task.label}</div>,
          });
          return <div {...dragProps} className={cn("rounded-md border bg-card px-3 py-2 text-sm", isDragging && "opacity-30")}>{task.label}</div>;
        };
        return <D key={task.id} />;
      })}
    </div>
  );
}

export default function Buckets() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", label: "Fix bug", priority: "high" },
    { id: "2", label: "Write docs", priority: "medium" },
    { id: "3", label: "Refactor", priority: "low" },
  ]);
  const setPriority = (id: string, p: Priority) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority: p } : t)));
  return (
    <div className="flex gap-3">
      {(["low", "medium", "high"] as const).map((p) => (
        <Bucket key={p} priority={p} tasks={tasks.filter((t) => t.priority === p)} onDrop={(id) => setPriority(id, p)} />
      ))}
    </div>
  );
}
`;
