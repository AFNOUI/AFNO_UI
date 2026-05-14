"use client";

import { Bold } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-sizes";

export function ToggleSizes() {
  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-sizes"
      title="Toggle Sizes"
      code={code}
      fullCode={code}
    >
      <div className="flex flex-wrap items-center gap-4">
        <Toggle size="sm" aria-label="Toggle small">
          <Bold className="h-3 w-3" />
        </Toggle>
        <Toggle size="default" aria-label="Toggle default">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="lg" aria-label="Toggle large">
          <Bold className="h-5 w-5" />
        </Toggle>
      </div>
    </ComponentInstall>
  );
}
