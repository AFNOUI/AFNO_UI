export const data = {
  menuItems: [
    { label: "Edit" },
    { label: "Duplicate" },
    { label: "Delete", destructive: true },
  ],
};

const dataStr = JSON.stringify(data, null, 2);
export const code = `import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function DropdownIconOnlyExample() {
  return (
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
  );
}
`;
