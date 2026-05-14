"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dropdown/dropdown-icon-only";

export function DropdownIconOnly() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {data.menuItems.map((item, i) => (
      <DropdownMenuItem key={i} className={item.destructive ? "text-destructive" : ""}>
        {item.label}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>`;

  return (
    <ComponentInstall category="dropdown" variant="dropdown-icon-only" title="Icon Only" code={snippet} fullCode={code}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {data.menuItems.map((item, i) => (
            <React.Fragment key={i}>
              {item.destructive && i > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem className={item.destructive ? "text-destructive" : ""}>
                {item.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </ComponentInstall>
  );
}
