export const data = [
  { id: "small", label: "Small", className: "scale-75" },
  { id: "default", label: "Default", className: "" },
  { id: "large", label: "Large", className: "scale-125" },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const data = ${dataStr};

export default function SwitchSizesExample() {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <Switch id={item.id} className={item.className || undefined} />
          <Label htmlFor={item.id}>{item.label}</Label>
        </div>
      ))}
    </div>
  );
}
`;
