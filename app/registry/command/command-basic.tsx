export const data = {
  suggestions: [
    { icon: "Calendar", label: "Calendar" },
    { icon: "Smile", label: "Search Emoji" },
    { icon: "Calculator", label: "Calculator" },
  ],
  settings: [
    { icon: "User", label: "Profile" },
    { icon: "CreditCard", label: "Billing" },
    { icon: "Settings", label: "Settings" },
  ],
};

export const code = `import React from "react";
import { Calendar, Smile, Calculator, User, CreditCard, Settings } from "lucide-react";
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandSeparator,
} from "@/components/ui/command";

const data = ${JSON.stringify(data, null, 2)};

export default function CommandBasicExample() {
  return (
    <Command className="rounded-lg border border-border shadow-md max-w-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {data.suggestions.map((item, i) => {
            const Icon = { Calendar, Smile, Calculator }[item.icon as "Calendar" | "Smile" | "Calculator"];
            return (
              <CommandItem key={i}>
                {Icon && <Icon className="me-2 h-4 w-4" />}
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          {data.settings.map((item, i) => {
            const Icon = { User, CreditCard, Settings }[item.icon as "User" | "CreditCard" | "Settings"];
            return (
              <CommandItem key={i}>
                {Icon && <Icon className="me-2 h-4 w-4" />}
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
`;