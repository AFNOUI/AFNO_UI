"use client";

import { Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-multiple-selection";

export function ToggleMultipleSelection() {
  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-multiple-selection"
      title="Multiple Selection"
      code={code}
      fullCode={code}
    >
      <ToggleGroup type="multiple" defaultValue={["bold", "italic"]}>
        <ToggleGroupItem value="bold" aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Toggle underline">
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </ComponentInstall>
  );
}
