"use client";

import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-theme-switcher";

export function ToggleThemeSwitcher() {
  const [theme, setTheme] = useState("system");

  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-theme-switcher"
      title="Theme Switcher"
      code={code}
      fullCode={code}
    >
      <ToggleGroup
        type="single"
        value={theme}
        onValueChange={(v) => v && setTheme(v)}
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
    </ComponentInstall>
  );
}
