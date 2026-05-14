"use client";

import React, { useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dropdown/dropdown-radio-items";

const icons: Record<string, React.ComponentType<{ className?: string }>> = { Sun, Moon, Laptop };

export function DropdownRadioItems() {
  const [theme, setTheme] = useState("system");

  const snippet = "const data = " + JSON.stringify(data, null, 2) + ";\n\n<DropdownMenu>\n  <DropdownMenuTrigger asChild>\n    <Button variant=\"outline\">Theme</Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuLabel>{data.label}</DropdownMenuLabel>\n    <DropdownMenuSeparator />\n    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>\n      {data.options.map((opt) => (\n        <DropdownMenuRadioItem key={opt.value} value={opt.value}>\n          {opt.label}\n        </DropdownMenuRadioItem>\n      ))}\n    </DropdownMenuRadioGroup>\n  </DropdownMenuContent>\n</DropdownMenu>";

  return (
    <ComponentInstall category="dropdown" variant="dropdown-radio-items" title="Radio Items (Theme)" code={snippet} fullCode={code}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {theme === "light" && <Sun className="me-2 h-4 w-4" />}
            {theme === "dark" && <Moon className="me-2 h-4 w-4" />}
            {theme === "system" && <Laptop className="me-2 h-4 w-4" />}
            Theme
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>{data.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            {data.options.map((opt) => {
              const Icon = icons[opt.icon as keyof typeof icons];
              return (
                <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                  {Icon && <Icon className="me-2 h-4 w-4" />}
                  {opt.label}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ComponentInstall>
  );
}
