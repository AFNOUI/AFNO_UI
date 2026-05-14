export const data = [
  { id: "task-1", label: "Review pull request", done: true },
  { id: "task-2", label: "Update documentation", done: true },
  { id: "task-3", label: "Write unit tests", done: false },
  { id: "task-4", label: "Deploy to production", done: false },
];

export const code = `import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const data = ${JSON.stringify(data, null, 2)};

export default function CheckboxTaskListExample() {
  return (
    <div className="space-y-2 max-w-sm">
      {data.map((task, index) => (
        <div
          key={index}
          className={\`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 border border-border \${task.done ? 'bg-muted/30' : ''}\`}
        >
          <Checkbox id={task.id} defaultChecked={task.done} />
          <Label htmlFor={task.id} className={\`cursor-pointer flex-1 \${task.done ? 'line-through text-muted-foreground' : ''}\`}>
            {task.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
`;