export const data = {
  badgeCount: 3,
  title: "Notification Preferences",
  items: [
    { key: "email", label: "Email notifications", description: "Receive emails about activity", defaultChecked: true },
    { key: "push", label: "Push notifications", description: "Receive push on your device", defaultChecked: false },
    { key: "sms", label: "SMS notifications", description: "Receive SMS messages", defaultChecked: false },
  ] as const,
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

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

const data = ${dataStr};

export default function PopoverSettingsExample() {
  const [notifications, setNotifications] = useState(
    Object.fromEntries(data.items.map((i) => [i.key, i.defaultChecked]))
  );

  return (
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
  );
}
`;
