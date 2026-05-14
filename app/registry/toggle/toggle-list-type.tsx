export const data = {};

export const code = `"use client";

import { List, ListOrdered } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ToggleListTypeExample() {
  return (
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
  );
}
`;

