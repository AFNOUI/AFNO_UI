"use client";

import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-basic";

export function ToggleBasic() {
  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-basic"
      title="Basic Toggle"
      code={code}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        <Toggle aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle aria-label="Toggle italic">
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle aria-label="Toggle underline">
          <Underline className="h-4 w-4" />
        </Toggle>
      </div>
    </ComponentInstall>
  );
}
