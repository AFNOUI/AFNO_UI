"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/radio/radio-basic";

export function RadioBasic() {
  return (
    <ComponentInstall
      category="radio"
      variant="radio-basic"
      title="Radio Group"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<RadioGroup defaultValue={data.defaultValue}>...`}
      fullCode={code}
    >
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
    </ComponentInstall>
  );
}
