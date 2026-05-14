"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/switch/switch-basic";

export function SwitchBasic() {
  return (
    <ComponentInstall
      category="switch"
      variant="switch-basic"
      title="Switch Component"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<Switch id={item.id} defaultChecked={item.defaultChecked} />`}
      fullCode={code}
    >
      <div className="space-y-4 max-w-sm">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <Label htmlFor={item.id}>{item.label}</Label>
            <Switch id={item.id} defaultChecked={item.defaultChecked} />
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
