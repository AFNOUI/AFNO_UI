export const data = [
  { id: "disabled-off", label: "Disabled (Off)", checked: false },
  { id: "disabled-on", label: "Disabled (On)", checked: true },
];

export const code = `"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const data = [
  { id: "disabled-off", label: "Disabled (Off)", checked: false },
  { id: "disabled-on", label: "Disabled (On)", checked: true },
];

export default function SwitchDisabledExample() {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <Switch id={item.id} disabled checked={item.checked} />
          <Label htmlFor={item.id} className="text-muted-foreground">{item.label}</Label>
        </div>
      ))}
    </div>
  );
}
`;
