"use client";

import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-variants";

export function ToggleVariants() {
  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-variants"
      title="Toggle Variants"
      code={code}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        <Toggle variant="default" aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle variant="outline" aria-label="Toggle italic">
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle disabled aria-label="Toggle underline">
          <Underline className="h-4 w-4" />
        </Toggle>
      </div>
    </ComponentInstall>
  );
}
