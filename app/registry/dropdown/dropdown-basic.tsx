export const data = {
  triggerText: "Open Menu",
  menuItems: [
    { icon: "User", label: "Profile" },
    { icon: "Settings", label: "Settings" },
    { icon: "CreditCard", label: "Billing" },
    { icon: "LogOut", label: "Logout", destructive: true },
  ],
};

export const code = `import React from "react";
import { ChevronDown, User, Settings, CreditCard, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const data = ${JSON.stringify(data, null, 2)};

export default function DropdownBasicExample() {
  const icons = { User, Settings, CreditCard, LogOut };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {data.triggerText}
          <ChevronDown className="ms-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {data.menuItems.map((item, i) => {
          const Icon = icons[item.icon as keyof typeof icons];
          return (
            <React.Fragment key={i}>
              {item.destructive && i > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem className={item.destructive ? "text-destructive" : ""}>
                {Icon && <Icon className="me-2 h-4 w-4" />}
                {item.label}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;
