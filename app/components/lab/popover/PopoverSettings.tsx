"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/popover/popover-settings";

export function PopoverSettings() {
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(data.items.map((i) => [i.key, i.defaultChecked]))
  );

  return (
    <ComponentInstall
      category="popover"
      variant="popover-settings"
      title="Settings Popover"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Notification switches`}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Bell className="me-2 h-4 w-4" />
              Notifications
              <Badge variant="secondary" className="ms-2">{data.badgeCount}</Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">{data.title}</h4>
              <div className="space-y-3">
                {data.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={!!notifications[item.key]}
                      onCheckedChange={(v) =>
                        setNotifications((prev) => ({ ...prev, [item.key]: v }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </ComponentInstall>
  );
}
