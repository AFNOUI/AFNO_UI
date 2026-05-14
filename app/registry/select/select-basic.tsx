export const data = {
  placeholder: "Select a theme",
  options: [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ] as const,
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const data = ${dataStr};

export default function SelectBasicExample() {
  return (
    <div className="max-w-xs space-y-4">
      <div className="space-y-2">
        <Label>Theme</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={data.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {data.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
`;
