"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/switch/switch-inline";

export function SwitchInline() {
  return (
    <ComponentInstall
      category="switch"
      variant="switch-inline"
      title="Basic Switch"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n<Switch id={data.id} /><Label>{data.label}</Label>`}
      fullCode={code}
    >
      <div className="flex items-center space-x-2">
        <Switch id={data.id} />
        <Label htmlFor={data.id}>{data.label}</Label>
      </div>
    </ComponentInstall>
  );
}
