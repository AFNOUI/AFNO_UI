"use client";

import { useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code } from "@/registry/toggle/toggle-text-alignment-group";

export function ToggleTextAlignmentGroup() {
  const [alignment, setAlignment] = useState("left");

  return (
    <ComponentInstall
      category="toggle"
      variant="toggle-text-alignment-group"
      title="Text Alignment Toggle Group"
      code={code}
      fullCode={code}
    >
      <ToggleGroup
        type="single"
        value={alignment}
        onValueChange={(v) => v && setAlignment(v)}
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justify" aria-label="Justify">
          <AlignJustify className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </ComponentInstall>
  );
}
