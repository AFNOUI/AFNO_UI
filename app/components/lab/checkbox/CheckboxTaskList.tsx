"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-task-list";

export function CheckboxTaskList() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

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
</div>`;

    return (
        <ComponentInstall category="checkbox" variant="checkbox-task-list" title="Task List Style" code={snippet} fullCode={code}>
            <div className="space-y-2 max-w-sm">
                {data.map((task, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 border border-border ${task.done ? 'bg-muted/30' : ''}`}
                    >
                        <Checkbox id={task.id} defaultChecked={task.done} />
                        <Label htmlFor={task.id} className={`cursor-pointer flex-1 ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                            {task.label}
                        </Label>
                    </div>
                ))}
            </div>
        </ComponentInstall>
    );
}