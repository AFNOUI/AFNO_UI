"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/select/select-basic";

export function SelectBasic() {
  return (
    <ComponentInstall
      category="select"
      variant="select-basic"
      title="Select Component"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<Select><SelectTrigger>...`}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
