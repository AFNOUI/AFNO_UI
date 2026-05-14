"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/switch/switch-sizes";

export function SwitchSizes() {
  return (
    <ComponentInstall
      category="switch"
      variant="switch-sizes"
      title="Switch Sizes"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// scale-75, scale-125`}
      fullCode={code}
    >
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Switch
              id={item.id}
              className={item.className || undefined}
            />
            <Label htmlFor={item.id}>{item.label}</Label>
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
