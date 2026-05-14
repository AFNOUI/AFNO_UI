"use client";

import React, { useState } from "react";
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
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dropdown/dropdown-radio-items-priority";

export function DropdownRadioItemsPriority() {
  const [priority, setPriority] = useState("medium");

  const snippet = `const data = ${JSON.stringify(data, null, 2)};
const [priority, setPriority] = useState("medium");

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline"><Flag className="me-2 h-4 w-4" />Priority: {priority}</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>{data.label}</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuRadioGroup value={priority} onValueChange={setPriority}>
      {data.options.map((opt) => (
        <DropdownMenuRadioItem key={opt.value} value={opt.value}>
          <span className={opt.dotClass + " me-2 h-2 w-2 rounded-full"} />
          {opt.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`;

  return (
    <ComponentInstall category="dropdown" variant="dropdown-radio-items-priority" title="Radio Items (Priority)" code={snippet} fullCode={code}>
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
    </ComponentInstall>
  );
}
