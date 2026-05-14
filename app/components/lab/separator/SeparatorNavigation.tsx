"use client";

import { Home, User, Mail, Settings, Bell, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/separator/separator-navigation";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  User,
  Mail,
  Settings,
  Bell,
  LogOut,
};

export function SeparatorNavigation() {
  return (
    <ComponentInstall
      category="separator"
      variant="separator-navigation"
      title="Navigation Separator"
      code={`const data = ${JSON.stringify(data, null, 2)};\n\n// Sidebar with separators`}
      fullCode={code}
    >
      <div className="rounded-lg border p-2 w-64">
        <div className="space-y-1">
          {data.topLinks.map((item) => {
            const Icon = icons[item.icon];
            return (
              <Button key={item.label} variant="ghost" className="w-full justify-start">
                <Icon className="me-2 h-4 w-4" />
                {item.label}
                {"badge" in item && item.badge != null && (
                  <Badge className="ms-auto" variant="secondary">
                    {item.badge}
                  </Badge>
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
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
        >
          <LogOut className="me-2 h-4 w-4" />
          {data.logout.label}
        </Button>
      </div>
    </ComponentInstall>
  );
}
