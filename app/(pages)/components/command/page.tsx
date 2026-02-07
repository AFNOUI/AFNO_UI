"use client";

import { useState } from "react";
// import { useTranslation } from "react-i18next";
import {
  Search, Mail, FileText, Moon, Sun, Laptop,
  GitBranch, MessageSquare, Bell, LogOut, Plus,
  Calculator, Calendar, CreditCard, Settings, Smile, User
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandSeparator,
} from "@/components/ui/command";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function CommandPage() {
  // const { t } = useTranslation();

  const [selectedTheme, setSelectedTheme] = useState("system");

  const basicCode = `import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

<Command className="rounded-lg border shadow-md">
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`;

  const paletteCode = `// Command palette with keyboard shortcut
<Command className="rounded-lg border shadow-md">
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandGroup heading="Actions">
      <CommandItem>
        <Plus className="mr-2 h-4 w-4" />
        Create new file
        <CommandShortcut>⌘N</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`;

  return (
    <div className="space-y-8">
      <SectionTitle>Command</SectionTitle>

      {/* Basic Command */}
      <CodePreview title="Basic Command Menu" code={basicCode}>
        <Command className="rounded-lg border border-border shadow-md max-w-md">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <Smile className="mr-2 h-4 w-4" />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </CommandItem>
              <CommandItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CodePreview>

      {/* Command Palette */}
      <CodePreview title="Command Palette (Spotlight Style)" code={paletteCode}>
        <Command className="rounded-lg border border-border shadow-lg max-w-lg bg-popover">
          <CommandInput placeholder="Search actions, files, and more..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              <CommandItem className="flex items-center justify-between">
                <div className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create new file</span>
                </div>
                <kbd className="text-xs bg-muted px-2 py-0.5 rounded">⌘N</kbd>
              </CommandItem>
              <CommandItem className="flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search everywhere</span>
                </div>
                <kbd className="text-xs bg-muted px-2 py-0.5 rounded">⌘K</kbd>
              </CommandItem>
              <CommandItem className="flex items-center justify-between">
                <div className="flex items-center">
                  <GitBranch className="mr-2 h-4 w-4" />
                  <span>Switch branch</span>
                </div>
                <kbd className="text-xs bg-muted px-2 py-0.5 rounded">⌘B</kbd>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Recent Files">
              <CommandItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>index.tsx</span>
                <span className="ml-auto text-xs text-muted-foreground">src/pages/</span>
              </CommandItem>
              <CommandItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>App.tsx</span>
                <span className="ml-auto text-xs text-muted-foreground">src/</span>
              </CommandItem>
              <CommandItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>package.json</span>
                <span className="ml-auto text-xs text-muted-foreground">root</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CodePreview>

      {/* Theme Switcher Command */}
      <CodePreview title="Theme Switcher" code={`<CommandItem onSelect={() => setTheme("dark")}>...</CommandItem>`}>
        <Command className="rounded-lg border border-border shadow-md max-w-sm">
          <CommandInput placeholder="Change theme..." />
          <CommandList>
            <CommandEmpty>No theme found.</CommandEmpty>
            <CommandGroup heading="Appearance">
              <CommandItem
                onSelect={() => setSelectedTheme("light")}
                className={cn(selectedTheme === "light" && "bg-accent")}
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {selectedTheme === "light" && <span className="ml-auto text-primary">✓</span>}
              </CommandItem>
              <CommandItem
                onSelect={() => setSelectedTheme("dark")}
                className={cn(selectedTheme === "dark" && "bg-accent")}
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {selectedTheme === "dark" && <span className="ml-auto text-primary">✓</span>}
              </CommandItem>
              <CommandItem
                onSelect={() => setSelectedTheme("system")}
                className={cn(selectedTheme === "system" && "bg-accent")}
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
                {selectedTheme === "system" && <span className="ml-auto text-primary">✓</span>}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CodePreview>

      {/* User Actions Command */}
      <CodePreview title="User Menu Command" code={`// User account actions`}>
        <Command className="rounded-lg border border-border shadow-md max-w-sm">
          <div className="flex items-center gap-3 p-3 border-b">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <CommandList>
            <CommandGroup heading="Account">
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
              <CommandItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                <span className="ml-auto px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">3</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Support">
              <CommandItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Send Feedback</span>
              </CommandItem>
              <CommandItem>
                <Mail className="mr-2 h-4 w-4" />
                <span>Contact Support</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </CommandItem>
          </CommandList>
        </Command>
      </CodePreview>

      {/* Compact Command */}
      <CodePreview title="Compact Command (No Input)" code={`<Command className="rounded-lg border"><CommandList>...</CommandList></Command>`}>
        <div className="flex gap-4 flex-wrap">
          <Command className="rounded-lg border border-border shadow-md w-48">
            <CommandList>
              <CommandGroup>
                <CommandItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </CommandItem>
                <CommandItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </CommandItem>
                <CommandItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>

          <Command className="rounded-lg border border-border shadow-md w-56">
            <CommandList>
              <CommandGroup heading="Sort By">
                <CommandItem>Name (A-Z)</CommandItem>
                <CommandItem>Name (Z-A)</CommandItem>
                <CommandItem>Date Created</CommandItem>
                <CommandItem>Date Modified</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </CodePreview>

      {/* Inline Command */}
      <CodePreview title="Inline Command Menu" code={`// Horizontal command menu`}>
        <div className="p-4 border rounded-lg bg-muted/30 max-w-lg">
          <p className="text-sm mb-3">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Plus, label: "New" },
              { icon: Search, label: "Search" },
              { icon: FileText, label: "Docs" },
              { icon: Settings, label: "Settings" },
            ].map((item, i) => (
              <button
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-accent transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CodePreview>
    </div>
  );
}

