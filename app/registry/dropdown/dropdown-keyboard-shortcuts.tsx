export const data = {
  triggerText: "Edit Menu",
  menuItems: [
    { icon: "Scissors", label: "Cut", shortcut: "⌘X" },
    { icon: "Copy", label: "Copy", shortcut: "⌘C" },
    { icon: "Clipboard", label: "Paste", shortcut: "⌘V" },
    { icon: "Edit", label: "Rename", shortcut: "F2" },
    { icon: "Trash2", label: "Delete", shortcut: "⌫", destructive: true },
  ],
};

export const code = `import React from "react";
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

const data = ${JSON.stringify(data, null, 2)};

export default function DropdownKeyboardShortcutsExample() {
  const icons = { Scissors, Copy, Clipboard, Edit, Trash2 };
  return (
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
  );
}
`;
