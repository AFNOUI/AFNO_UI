"use client";

import { useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandItem,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandInput,
} from "@/components/ui/command";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/command/command-theme-switcher";

export function CommandThemeSwitcher() {
    const [selectedTheme, setSelectedTheme] = useState("system");

    const snippet = `const data = ${JSON.stringify(data, null, 2)};

const [selectedTheme, setSelectedTheme] = useState("system");

<Command className="rounded-lg border shadow-md">
  <CommandInput placeholder="Change theme..." />
  <CommandList>
    <CommandEmpty>No theme found.</CommandEmpty>
    <CommandGroup heading="Appearance">
      {data.map((theme) => {
        const Icon = { Sun, Moon, Laptop }[theme.icon as "Sun" | "Moon" | "Laptop"];
        return (
          <CommandItem
            key={theme.value}
            onSelect={() => setSelectedTheme(theme.value)}
            className={cn(selectedTheme === theme.value && "bg-accent")}
          >
            {Icon && <Icon className="me-2 h-4 w-4" />}
            <span>{theme.label}</span>
            {selectedTheme === theme.value && <span className="ms-auto text-primary">✓</span>}
          </CommandItem>
        );
      })}
    </CommandGroup>
  </CommandList>
</Command>`;

    return (
        <ComponentInstall category="command" variant="command-theme-switcher" title="Theme Switcher" code={snippet} fullCode={code}>
            <Command className="rounded-lg border border-border shadow-md max-w-sm">
                <CommandInput placeholder="Change theme..." />
                <CommandList>
                    <CommandEmpty>No theme found.</CommandEmpty>
                    <CommandGroup heading="Appearance">
                        {data.map((theme) => {
                            const Icon = { Sun, Moon, Laptop }[theme.icon as "Sun" | "Moon" | "Laptop"];
                            return (
                                <CommandItem
                                    key={theme.value}
                                    onSelect={() => setSelectedTheme(theme.value)}
                                    className={cn(selectedTheme === theme.value && "bg-accent")}
                                >
                                    {Icon && <Icon className="me-2 h-4 w-4" />}
                                    <span>{theme.label}</span>
                                    {selectedTheme === theme.value && <span className="ms-auto text-primary">✓</span>}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </Command>
        </ComponentInstall>
    );
}