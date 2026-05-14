export const data = {
  topLinks: [
    { icon: "Home", label: "Dashboard" },
    { icon: "User", label: "Profile" },
    { icon: "Mail", label: "Messages", badge: 5 },
  ],
  middleLinks: [
    { icon: "Settings", label: "Settings" },
    { icon: "Bell", label: "Notifications" },
  ],
  logout: { icon: "LogOut", label: "Logout", destructive: true },
};

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import React from "react";
import { Home, User, Mail, Settings, Bell, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const data = ${dataStr};
const icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = { Home, User, Mail, Settings, Bell, LogOut };

export default function SeparatorNavigationExample() {
  return (
    <div className="rounded-lg border p-2 w-64">
      <div className="space-y-1">
        {data.topLinks.map((item) => {
          const Icon = icons[item.icon];
          return (
            <Button key={item.label} variant="ghost" className="w-full justify-start">
              <Icon className="me-2 h-4 w-4" />
              {item.label}
              {item.badge != null && (
                <Badge className="ms-auto" variant="secondary">{item.badge}</Badge>
              )}
            </Button>
          );
        })}
      </div>
      <Separator className="my-2" />
      <div className="space-y-1">
        {data.middleLinks.map((item) => {
          const Icon = icons[item.icon];
          return (
            <Button key={item.label} variant="ghost" className="w-full justify-start">
              <Icon className="me-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
      <Separator className="my-2" />
      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
        <LogOut className="me-2 h-4 w-4" />
        {data.logout.label}
      </Button>
    </div>
  );
}
`;
