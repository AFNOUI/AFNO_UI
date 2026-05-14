"use client";

import { Wifi, Volume2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-with-text";

export function ToggleWithText() {
  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-with-text"
      title="Toggle With Text"
      code={code}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        <Toggle variant="outline" aria-label="Toggle wifi" className="gap-2">
          <Wifi className="h-4 w-4" />
          WiFi
        </Toggle>
        <Toggle variant="outline" aria-label="Toggle sound" className="gap-2">
          <Volume2 className="h-4 w-4" />
          Sound
        </Toggle>
      </div>
    </ComponentInstall>
  );
}
