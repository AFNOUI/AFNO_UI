"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/switch/switch-with-state";

export function SwitchWithState() {
  const [enabled, setEnabled] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const values = [enabled, notifications, darkMode];
  const setters = [setEnabled, setNotifications, setDarkMode];

  return (
    <ComponentInstall
      category="switch"
      variant="switch-with-state"
      title="Switch with State"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Controlled switch`}
      fullCode={code}
    >
      <div className="space-y-4">
        {data.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-0.5">
              <Label htmlFor={item.id} className="text-base">
                {item.label}
              </Label>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              id={item.id}
              checked={values[i]}
              onCheckedChange={setters[i]}
            />
          </div>
        ))}
      </div>
    </ComponentInstall>
  );
}
