export const data = {};

export const code = `"use client";

import { useState } from "react";
import { Bold } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export default function ToggleControlledExample() {
  const [boldPressed, setBoldPressed] = useState(false);

  return (
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
  );
}
`;

