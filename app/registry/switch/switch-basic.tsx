export const data = [
  { id: "airplane", label: "Airplane Mode", defaultChecked: false },
  { id: "notifications", label: "Notifications", defaultChecked: true },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const data = ${dataStr};

export default function SwitchBasicExample() {
  return (
    <div className="space-y-4 max-w-sm">
      {data.map((item) => (
        <div key={item.id} className="flex items-center justify-between">
          <Label htmlFor={item.id}>{item.label}</Label>
          <Switch id={item.id} defaultChecked={item.defaultChecked} />
        </div>
      ))}
    </div>
  );
}
`;
