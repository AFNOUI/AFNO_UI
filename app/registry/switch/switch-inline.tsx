export const data = { id: "airplane-mode", label: "Airplane Mode" };

export const code = `"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const data = { id: "airplane-mode", label: "Airplane Mode" };

export default function SwitchInlineExample() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id={data.id} />
      <Label htmlFor={data.id}>{data.label}</Label>
    </div>
  );
}
`;
