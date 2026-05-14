"use client";

import { Grid, LayoutList } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-view-switcher";

export function ToggleViewSwitcher() {
  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-view-switcher"
      title="View Switcher"
      code={code}
      fullCode={code}
    >
      <ToggleGroup type="single" defaultValue="grid" variant="outline">
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <Grid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view">
          <LayoutList className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </ComponentInstall>
  );
}
