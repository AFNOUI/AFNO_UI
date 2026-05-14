"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/checkbox/checkbox-indeterminate";

interface Task {
    id: string;
    label: string;
    checked: boolean;
}

export function CheckboxIndeterminate() {
    const [items, setItems] = useState<Task[]>(data);

    const allChecked = items.every(item => item.checked);

    const handleSelectAll = () => {
        setItems(items.map(item => ({ ...item, checked: !allChecked })));
    };

    const handleItemChange = (id: string, checked: boolean) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, checked } : item
        ));
    };

    const snippet = `const [items, setItems] = useState<Task[]>([
  { id: "1", label: "Design System", checked: true },
  { id: "2", label: "Components", checked: true },
  { id: "3", label: "Documentation", checked: false },
  { id: "4", label: "Testing", checked: false },
]);

const allChecked = items.every(item => item.checked);

const handleSelectAll = () => {
  setItems(items.map(item => ({ ...item, checked: !allChecked })));
};

const handleItemChange = (id: string, checked: boolean) => {
  setItems(items.map(item =>
    item.id === id ? { ...item, checked } : item
  ));
};

<div className="space-y-4 max-w-sm">
  <div className="flex items-center space-x-2 pb-2 border-b border-border">
    <Checkbox
      checked={allChecked}
      onCheckedChange={handleSelectAll}
      className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />
    <Label className="font-medium cursor-pointer">Select All Tasks</Label>
  </div>
  <div className="space-y-3 pl-6">
    {items.map((item) => (
      <div key={item.id} className="flex items-center space-x-2">
        <Checkbox
          id={item.id}
          checked={item.checked}
          onCheckedChange={(c) => handleItemChange(item.id, c as boolean)}
        />
        <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
      </div>
    ))}
  </div>
</div>`;

    return (
        <ComponentInstall category="checkbox" variant="checkbox-indeterminate" title="Indeterminate State (Select All)" code={snippet} fullCode={code}>
            <div className="space-y-4 max-w-sm">
                <div className="flex items-center space-x-2 pb-2 border-b border-border">
                    <Checkbox
                        checked={allChecked}
                        onCheckedChange={handleSelectAll}
                        className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <Label className="font-medium cursor-pointer">Select All Tasks</Label>
                </div>
                <div className="space-y-3 pl-6">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={item.id}
                                checked={item.checked}
                                onCheckedChange={(c) => handleItemChange(item.id, c as boolean)}
                            />
                            <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </ComponentInstall>
    );
}