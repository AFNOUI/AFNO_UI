export const data = {
  triggerText: "View Options",
  label: "Appearance",
  items: [
    { id: "statusBar", label: "Status Bar", defaultChecked: true },
    { id: "activityBar", label: "Activity Bar", defaultChecked: false },
    { id: "panel", label: "Panel", defaultChecked: false },
  ],
};

export const code = `import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)};

export default function DropdownCheckboxItemsExample() {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(data.items.map((item) => [item.id, item.defaultChecked]))
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{data.triggerText}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{data.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data.items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.id}
            checked={checked[item.id]}
            onCheckedChange={(v) => setChecked((p) => ({ ...p, [item.id]: !!v }))}
          >
            {item.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;
