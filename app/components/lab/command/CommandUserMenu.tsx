"use client";

import { User, Settings, Bell, MessageSquare, Mail, LogOut } from "lucide-react";
import {
    Command,
    CommandItem,
    CommandList,
    CommandGroup,
    CommandSeparator,
} from "@/components/ui/command";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/command/command-user-menu";

export function CommandUserMenu() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Command className="rounded-lg border shadow-md">
  <div className="flex items-center gap-3 p-3 border-b">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
      {data.user.initials}
    </div>
    <div>
      <p className="text-sm font-medium">{data.user.name}</p>
      <p className="text-xs text-muted-foreground">{data.user.email}</p>
    </div>
  </div>
  <CommandList>
    <CommandGroup heading="Account">
      {data.account.map((item, i) => {
        const Icon = { User, Settings, Bell }[item.icon as "User" | "Settings" | "Bell"];
        return (
          <CommandItem key={i}>
            {Icon && <Icon className="me-2 h-4 w-4" />}
            <span>{item.label}</span>
            {item.badge && <span className="ms-auto px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">{item.badge}</span>}
          </CommandItem>
        );
      })}
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Support">
      {data.support.map((item, i) => {
        const Icon = { MessageSquare, Mail }[item.icon as "MessageSquare" | "Mail"];
        return (
          <CommandItem key={i}>
            {Icon && <Icon className="me-2 h-4 w-4" />}
            <span>{item.label}</span>
          </CommandItem>
        );
      })}
    </CommandGroup>
    <CommandSeparator />
    <CommandItem className="text-destructive">
      <LogOut className="me-2 h-4 w-4" />
      <span>{data.logout.label}</span>
    </CommandItem>
  </CommandList>
</Command>`;

    return (
        <ComponentInstall category="command" variant="command-user-menu" title="User Menu Command" code={snippet} fullCode={code}>
            <Command className="rounded-lg border border-border shadow-md max-w-sm">
                <div className="flex items-center gap-3 p-3 border-b">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {data.user.initials}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{data.user.name}</p>
                        <p className="text-xs text-muted-foreground">{data.user.email}</p>
                    </div>
                </div>
                <CommandList>
                    <CommandGroup heading="Account">
                        {data.account.map((item, i) => {
                            const Icon = { User, Settings, Bell }[item.icon as "User" | "Settings" | "Bell"];
                            return (
                                <CommandItem key={i}>
                                    {Icon && <Icon className="me-2 h-4 w-4" />}
                                    <span>{item.label}</span>
                                    {item.badge && <span className="ms-auto px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">{item.badge}</span>}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Support">
                        {data.support.map((item, i) => {
                            const Icon = { MessageSquare, Mail }[item.icon as "MessageSquare" | "Mail"];
                            return (
                                <CommandItem key={i}>
                                    {Icon && <Icon className="me-2 h-4 w-4" />}
                                    <span>{item.label}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandItem className="text-destructive">
                        <LogOut className="me-2 h-4 w-4" />
                        <span>{data.logout.label}</span>
                    </CommandItem>
                </CommandList>
            </Command>
        </ComponentInstall>
    );
}