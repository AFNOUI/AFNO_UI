"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dropdown/dropdown-checkbox-items";

export function DropdownCheckboxItems() {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(data.items.map((item) => [item.id, item.defaultChecked]))
  );

  const snippet = `const data = ${JSON.stringify(data, null, 2)};
const [checked, setChecked] = useState(...);

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">{data.triggerText}</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
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
</DropdownMenu>`;

  return (
    <ComponentInstall category="dropdown" variant="dropdown-checkbox-items" title="Checkbox Items" code={snippet} fullCode={code}>
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
    </ComponentInstall>
  );
}
