"use client";

import { User, Settings, LogOut } from "lucide-react";
import {
    Command,
    CommandItem,
    CommandList,
    CommandGroup,
} from "@/components/ui/command";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/command/command-compact";

export function CommandCompact() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="flex gap-4 flex-wrap">
  <Command className="rounded-lg border shadow-md w-48">
    <CommandList>
      <CommandGroup>
        {data.menu1.map((item, i) => {
          const Icon = { User, Settings, LogOut }[item.icon as "User" | "Settings" | "LogOut"];
          return (
            <CommandItem key={i} className={item.destructive ? "text-destructive" : ""}>
              {Icon && <Icon className="me-2 h-4 w-4" />}
              {item.label}
            </CommandItem>
          );
        })}
      </CommandGroup>
    </CommandList>
  </Command>

  <Command className="rounded-lg border shadow-md w-56">
    <CommandList>
      <CommandGroup heading="Sort By">
        {data.menu2.map((item, i) => (
          <CommandItem key={i}>{item}</CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  </Command>
</div>
`;

    return (
        <ComponentInstall category="command" variant="command-compact" title="Compact Command (No Input)" code={snippet} fullCode={code}>
            <div className="flex gap-4 flex-wrap">
                <Command className="rounded-lg border border-border shadow-md w-48">
                    <CommandList>
                        <CommandGroup>
                            {data.menu1.map((item, i) => {
                                const Icon = { User, Settings, LogOut }[item.icon as "User" | "Settings" | "LogOut"];
                                return (
                                    <CommandItem key={i} className={item.destructive ? "text-destructive" : ""}>
                                        {Icon && <Icon className="me-2 h-4 w-4" />}
                                        {item.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>

                <Command className="rounded-lg border border-border shadow-md w-56">
                    <CommandList>
                        <CommandGroup heading="Sort By">
                            {data.menu2.map((item, i) => (
                                <CommandItem key={i}>{item}</CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </div>
        </ComponentInstall>
    );
}