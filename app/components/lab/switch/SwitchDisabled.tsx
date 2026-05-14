"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/switch/switch-disabled";

export function SwitchDisabled() {
  return (
    <ComponentInstall
      category="switch"
      variant="switch-disabled"
      title="Disabled Switch"
      code="<Switch disabled /> <Switch disabled checked />"
      fullCode={code}
    >
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Switch id={item.id} disabled checked={item.checked} />
            <Label htmlFor={item.id} className="text-muted-foreground">
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
