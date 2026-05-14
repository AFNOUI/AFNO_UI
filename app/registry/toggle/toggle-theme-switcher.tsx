export const data = {};

export const code = `"use client";

import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ToggleThemeSwitcherExample() {
  const [theme, setTheme] = useState("system");

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(v: string) => v && setTheme(v)}
      variant="outline"
    >
      <ToggleGroupItem value="light" aria-label="Light theme" className="gap-2">
        <Sun className="h-4 w-4" />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark theme" className="gap-2">
        <Moon className="h-4 w-4" />
        Dark
      </ToggleGroupItem>
      <ToggleGroupItem
        value="system"
        aria-label="System theme"
        className="gap-2"
      >
        <Monitor className="h-4 w-4" />
        System
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
`;

