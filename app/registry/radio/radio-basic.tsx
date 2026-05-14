export const data = {
  defaultValue: "comfortable",
  options: [
    { value: "default", id: "r1", label: "Default" },
    { value: "comfortable", id: "r2", label: "Comfortable" },
    { value: "compact", id: "r3", label: "Compact" },
  ] as const,
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const data = ${dataStr};

export default function RadioBasicExample() {
  return (
    <div className="space-y-4 max-w-sm">
      <RadioGroup defaultValue={data.defaultValue}>
        {data.options.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={opt.id} />
            <Label htmlFor={opt.id}>{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
`;
