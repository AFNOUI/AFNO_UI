export const data = {};

export const code = `"use client";

import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export default function ToggleBasicExample() {
  return (
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
  );
}
`;

