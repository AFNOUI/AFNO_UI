"use client";

import { useState } from "react";
import { Bold } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-controlled";

export function ToggleControlled() {
  const [boldPressed, setBoldPressed] = useState(false);

  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-controlled"
      title="Controlled Toggle"
      code={code}
      fullCode={code}
    >
      <div className="flex flex-col gap-4">
        <Toggle
          pressed={boldPressed}
          onPressedChange={setBoldPressed}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <p className="text-sm text-muted-foreground">
          Bold is {boldPressed ? "on" : "off"}
        </p>
      </div>
    </ComponentInstall>
  );
}
