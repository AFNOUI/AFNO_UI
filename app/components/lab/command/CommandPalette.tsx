"use client";

import { Plus, Search, GitBranch, FileText } from "lucide-react";
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandSeparator,
} from "@/components/ui/command";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/command/command-palette";

export function CommandPalette() {
  const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Command className="rounded-lg border shadow-lg bg-popover">
  <CommandInput placeholder="Search actions, files, and more..." />
  <CommandList className="max-h-[300px]">
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Quick Actions">
      {data.quickActions.map((item, i) => {
        const Icon = { Plus, Search, GitBranch }[item.icon as "Plus" | "Search" | "GitBranch"];
        return (
          <CommandItem key={i} className="flex items-center justify-between">
            <div className="flex items-center">
              {Icon && <Icon className="me-2 h-4 w-4" />}
              <span>{item.label}</span>
            </div>
            <kbd className="text-xs bg-muted px-2 py-0.5 rounded">{item.shortcut}</kbd>
          </CommandItem>
        );
      })}
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Recent Files">
      {data.recentFiles.map((item, i) => (
        <CommandItem key={i}>
          <FileText className="me-2 h-4 w-4" />
          <span>{item.name}</span>
          <span className="ms-auto text-xs text-muted-foreground">{item.path}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  </CommandList>
</Command>
`;

  return (
    <ComponentInstall category="command" variant="command-palette" title="Command Palette (Spotlight Style)" code={snippet} fullCode={code}>
      <Command className="rounded-lg border border-border shadow-lg max-w-lg bg-popover">
        <CommandInput placeholder="Search actions, files, and more..." />
        <CommandList className="max-h-[300px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {data.quickActions.map((item, i) => {
              const Icon = { Plus, Search, GitBranch }[item.icon as "Plus" | "Search" | "GitBranch"];
              return (
                <CommandItem key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {Icon && <Icon className="me-2 h-4 w-4" />}
                    <span>{item.label}</span>
                  </div>
                  <kbd className="text-xs bg-muted px-2 py-0.5 rounded">{item.shortcut}</kbd>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent Files">
            {data.recentFiles.map((item, i) => (
              <CommandItem key={i}>
                <FileText className="me-2 h-4 w-4" />
                <span>{item.name}</span>
                <span className="ms-auto text-xs text-muted-foreground">{item.path}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </ComponentInstall>
  );
}