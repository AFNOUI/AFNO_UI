export const data = [
  {
    id: "enabled",
    label: "Enable feature",
    description: "Turn on this feature to unlock additional options.",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Receive notifications about updates.",
  },
  {
    id: "dark-mode",
    label: "Dark Mode",
    description: "Toggle dark mode appearance.",
  },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const data = ${dataStr};

export default function SwitchWithStateExample() {
  const [enabled, setEnabled] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const values = [enabled, notifications, darkMode];
  const setters = [setEnabled, setNotifications, setDarkMode];

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor={item.id} className="text-base">{item.label}</Label>
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
  );
}
`;
