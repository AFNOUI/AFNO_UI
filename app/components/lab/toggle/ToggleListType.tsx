"use client";

import { List, ListOrdered } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-list-type";

export function ToggleListType() {
  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-list-type"
      title="List Type Toggle"
      code={code}
      fullCode={code}
    >
      <ToggleGroup type="single" defaultValue="bullet">
        <ToggleGroupItem
          value="bullet"
          aria-label="Bullet list"
          className="gap-2"
        >
          <List className="h-4 w-4" />
          Bullet
        </ToggleGroupItem>
        <ToggleGroupItem
          value="numbered"
          aria-label="Numbered list"
          className="gap-2"
        >
          <ListOrdered className="h-4 w-4" />
          Numbered
        </ToggleGroupItem>
      </ToggleGroup>
    </ComponentInstall>
  );
}
