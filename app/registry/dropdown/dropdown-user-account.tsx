export const data = {
  user: { name: "John Doe", email: "john@example.com", initials: "JD" },
  accountItems: [
    { icon: "User", label: "Profile", shortcut: "⇧⌘P" },
    { icon: "CreditCard", label: "Billing", shortcut: "⌘B" },
    { icon: "Settings", label: "Settings", shortcut: "⌘S" },
    { icon: "Bell", label: "Notifications" },
  ],
  workspaceSubmenu: {
    label: "Invite Team",
    icon: "UserPlus",
    nested: { label: "New Workspace", icon: "Plus", items: [{ icon: "GitBranch", label: "GitHub" }, { icon: "Cloud", label: "Cloud" }] },
  },
  support: { icon: "LifeBuoy", label: "Support" },
  logout: { icon: "LogOut", label: "Log out", shortcut: "⇧⌘Q" },
};

export const code = `import React from "react";
import { ChevronDown, User, CreditCard, Settings, Bell, UserPlus, Plus, GitBranch, Cloud, LifeBuoy, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const data = ${JSON.stringify(data, null, 2)};

export default function DropdownUserAccountExample() {
  const icons = { User, CreditCard, Settings, Bell, UserPlus, Plus, GitBranch, Cloud, LifeBuoy, LogOut };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{data.user.initials}</AvatarFallback>
          </Avatar>
          <span>{data.user.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{data.user.name}</p>
            <p className="text-xs text-muted-foreground">{data.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {data.accountItems.map((item, i) => {
            const Icon = icons[item.icon as keyof typeof icons];
            return (
              <DropdownMenuItem key={i}>
                {Icon && <Icon className="me-2 h-4 w-4" />}
                {item.label}
                {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            {(() => {
              const Icon = icons[data.workspaceSubmenu.icon as keyof typeof icons];
              return Icon ? <Icon className="me-2 h-4 w-4" /> : null;
            })()}
            {data.workspaceSubmenu.label}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {(() => {
                const Icon = icons[data.workspaceSubmenu.nested.icon as keyof typeof icons];
                return Icon ? <Icon className="me-2 h-4 w-4" /> : null;
              })()}
              {data.workspaceSubmenu.nested.label}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {data.workspaceSubmenu.nested.items.map((item, j) => {
                const ItemIcon = icons[item.icon as keyof typeof icons];
                return (
                  <DropdownMenuItem key={j}>
                    {ItemIcon ? <ItemIcon className="me-2 h-4 w-4" /> : null}
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          {(() => {
            const Icon = icons[data.support.icon as keyof typeof icons];
            return Icon ? <Icon className="me-2 h-4 w-4" /> : null;
          })()}
          {data.support.label}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          {(() => {
            const Icon = icons[data.logout.icon as keyof typeof icons];
            return Icon ? <Icon className="me-2 h-4 w-4" /> : null;
          })()}
          {data.logout.label}
          <DropdownMenuShortcut>{data.logout.shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;
