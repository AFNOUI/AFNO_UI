export const data = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "lb", label: "lb" },
  { value: "oz", label: "oz" },
];

export const code = `import React from "react";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const units = ${JSON.stringify(data, null, 2)};

export default function CompositeInputSelectSuffixExample() {
  return (
    <div className="max-w-xs space-y-2">
      <Label>Quantity</Label>
      <div className="flex">
        <Input
          type="number"
          placeholder="100"
          className="rounded-r-none"
        />
        <Select defaultValue="kg">
          <SelectTrigger className="w-[80px] rounded-l-none border-l-0 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map((u) => (
              <SelectItem key={u.value} value={u.value}>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
`;