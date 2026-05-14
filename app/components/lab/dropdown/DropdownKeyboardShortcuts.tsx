"use client";

import React from "react";
import { Scissors, Copy, Clipboard, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/dropdown/dropdown-keyboard-shortcuts";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors,
  Copy,
  Clipboard,
  Edit,
  Trash2,
};

export function DropdownKeyboardShortcuts() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">{data.triggerText}</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    {data.menuItems.map((item, i) => (
      <DropdownMenuItem key={i} className={item.destructive ? "text-destructive" : ""}>
        {icons[item.icon] && <icons[item.icon] className="me-2 h-4 w-4" />}
        {item.label}
        <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>`;

  return (
    <ComponentInstall category="dropdown" variant="dropdown-keyboard-shortcuts" title="Keyboard Shortcuts" code={snippet} fullCode={code}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{data.triggerText}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {data.menuItems.map((item, i) => {
            const Icon = icons[item.icon as keyof typeof icons];
            return (
              <React.Fragment key={i}>
                {item.destructive && i > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem className={item.destructive ? "text-destructive" : ""}>
                  {Icon && <Icon className="me-2 h-4 w-4" />}
                  {item.label}
                  <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                </DropdownMenuItem>
              </React.Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </ComponentInstall>
  );
}
