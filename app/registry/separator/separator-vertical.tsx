export const data = [
  { icon: "Home", label: "Home" },
  { icon: "Settings", label: "Settings" },
  { icon: "User", label: "Profile" },
] as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import React from "react";
import { Home, Settings, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const buttons = ${dataStr};
const icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = { Home, Settings, User };

export default function SeparatorVerticalExample() {
  return (
    <div className="flex h-10 items-center space-x-4">
      {buttons.map((btn, i) => {
        const Icon = icons[btn.icon];
        return (
          <span key={btn.label} className="flex items-center space-x-4">
            {i > 0 && <Separator orientation="vertical" />}
            <Button variant="outline" size="sm">
              <Icon className="me-2 h-4 w-4" />
              {btn.label}
            </Button>
          </span>
        );
      })}
    </div>
  );
}
`;
