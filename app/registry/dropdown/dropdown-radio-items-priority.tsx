export const data = {
  label: "Set Priority",
  options: [
    { value: "low", label: "Low", dotClass: "bg-[hsl(var(--progress-success))]" },
    { value: "medium", label: "Medium", dotClass: "bg-[hsl(var(--progress-warning))]" },
    { value: "high", label: "High", dotClass: "bg-destructive" },
  ],
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React, { useState } from "react";
import { Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function DropdownRadioItemsPriorityExample() {
  const [priority, setPriority] = useState("medium");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Flag className="me-2 h-4 w-4" />
          Priority: {priority}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>{data.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={priority} onValueChange={setPriority}>
          {data.options.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              <span className={"me-2 h-2 w-2 rounded-full " + opt.dotClass} />
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;
