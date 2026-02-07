"use client";

import { useState } from "react";
// import { useTranslation } from "react-i18next";
import {
  Check, ChevronsUpDown, User,
  Building2, Globe, Tag, Plus, X
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

const countries = [
  { value: "us", label: "United States", flag: "🇺🇸" },
  { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
  { value: "ca", label: "Canada", flag: "🇨🇦" },
  { value: "de", label: "Germany", flag: "🇩🇪" },
  { value: "fr", label: "France", flag: "🇫🇷" },
  { value: "jp", label: "Japan", flag: "🇯🇵" },
  { value: "au", label: "Australia", flag: "🇦🇺" },
];

const users = [
  { value: "john", name: "John Doe", email: "john@example.com", avatar: "JD" },
  { value: "jane", name: "Jane Smith", email: "jane@example.com", avatar: "JS" },
  { value: "bob", name: "Bob Wilson", email: "bob@example.com", avatar: "BW" },
  { value: "alice", name: "Alice Brown", email: "alice@example.com", avatar: "AB" },
];

const tags = [
  { value: "bug", label: "Bug", color: "bg-red-500" },
  { value: "feature", label: "Feature", color: "bg-blue-500" },
  { value: "enhancement", label: "Enhancement", color: "bg-green-500" },
  { value: "documentation", label: "Documentation", color: "bg-yellow-500" },
  { value: "question", label: "Question", color: "bg-purple-500" },
];

export default function ComboboxPage() {
  // const { t } = useTranslation();

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const [country, setCountry] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  const [userOpen, setUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const [tagOpen, setTagOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const basicCode = `const [open, setOpen] = useState(false);
const [value, setValue] = useState("");

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-expanded={open}>
      {value ? frameworks.find((f) => f.value === value)?.label : "Select framework..."}
      <ChevronsUpDown className="ml-2 h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[200px] p-0">
    <Command>
      <CommandInput placeholder="Search framework..." />
      <CommandList>
        <CommandEmpty>No framework found.</CommandEmpty>
        <CommandGroup>
          {frameworks.map((framework) => (
            <CommandItem
              key={framework.value}
              value={framework.value}
              onSelect={(v) => { setValue(v); setOpen(false); }}
            >
              <Check className={cn("mr-2 h-4 w-4", value === framework.value ? "opacity-100" : "opacity-0")} />
              {framework.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>`;

  const toggleTag = (tagValue: string) => {
    setSelectedTags(prev =>
      prev.includes(tagValue)
        ? prev.filter(t => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  return (
    <div className="space-y-8">
      <SectionTitle>Combobox</SectionTitle>

      {/* Basic Combobox */}
      <CodePreview title="Basic Combobox" code={basicCode}>
        <div className="flex flex-wrap gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {value
                  ? frameworks.find((framework) => framework.value === value)?.label
                  : "Select framework..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search framework..." />
                <CommandList>
                  <CommandEmpty>No framework found.</CommandEmpty>
                  <CommandGroup>
                    {frameworks.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === framework.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {value && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Selected:</span>
              <Badge>{frameworks.find(f => f.value === value)?.label}</Badge>
            </div>
          )}
        </div>
      </CodePreview>

      {/* Country Selector */}
      <CodePreview title="Country Selector (with Icons)" code={`// Country combobox with flag icons`}>
        <div className="flex flex-wrap gap-4">
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-[240px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {country ? (
                    <>
                      <span>{countries.find(c => c.value === country)?.flag}</span>
                      <span>{countries.find(c => c.value === country)?.label}</span>
                    </>
                  ) : (
                    "Select country..."
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((c) => (
                      <CommandItem
                        key={c.value}
                        value={c.value}
                        onSelect={(currentValue) => {
                          setCountry(currentValue === country ? "" : currentValue);
                          setCountryOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            country === c.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="mr-2">{c.flag}</span>
                        {c.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* User Selector */}
      <CodePreview title="User Selector (with Avatars)" code={`// User combobox with avatar and email`}>
        <div className="flex flex-wrap gap-4">
          <Popover open={userOpen} onOpenChange={setUserOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={userOpen}
                className="w-[280px] justify-between"
              >
                <div className="flex items-center gap-2">
                  {selectedUser ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                        {users.find(u => u.value === selectedUser)?.avatar}
                      </div>
                      <span>{users.find(u => u.value === selectedUser)?.name}</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Assign to...</span>
                    </>
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
              <Command>
                <CommandInput placeholder="Search users..." />
                <CommandList>
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.value}
                        value={user.value}
                        onSelect={(currentValue) => {
                          setSelectedUser(currentValue === selectedUser ? "" : currentValue);
                          setUserOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedUser === user.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium mr-2">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Multi-select Tags */}
      <CodePreview title="Multi-select Tags" code={`// Multi-select combobox with tags`}>
        <div className="space-y-4">
          <Popover open={tagOpen} onOpenChange={setTagOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={tagOpen}
                className="w-[300px] justify-between h-auto min-h-10"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedTags.length > 0 ? (
                    selectedTags.map(tagValue => {
                      const tag = tags.find(t => t.value === tagValue);
                      return (
                        <Badge key={tagValue} variant="secondary" className="gap-1">
                          <span className={cn("w-2 h-2 rounded-full", tag?.color)} />
                          {tag?.label}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTag(tagValue);
                            }}
                          />
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Select tags...
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>No tag found.</CommandEmpty>
                  <CommandGroup>
                    {tags.map((tag) => (
                      <CommandItem
                        key={tag.value}
                        value={tag.value}
                        onSelect={() => toggleTag(tag.value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTags.includes(tag.value) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className={cn("w-3 h-3 rounded-full mr-2", tag.color)} />
                        {tag.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Creatable Combobox */}
      <CodePreview title="Creatable Combobox" code={`// Combobox that allows creating new options`}>
        <div className="flex flex-wrap gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>Select or create...</span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="Search or create..." />
                <CommandList>
                  <CommandEmpty>
                    <button className="flex items-center gap-2 px-2 py-1.5 text-sm w-full hover:bg-accent rounded">
                      <Plus className="h-4 w-4" />
                      Create new option
                    </button>
                  </CommandEmpty>
                  <CommandGroup heading="Existing">
                    <CommandItem>
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      Acme Inc.
                    </CommandItem>
                    <CommandItem>
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      Globex Corp.
                    </CommandItem>
                    <CommandItem>
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      Soylent Corp.
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CodePreview>

      {/* Disabled State */}
      <CodePreview title="States" code={`<Button disabled>...</Button>`}>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="w-[200px] justify-between" disabled>
            <span className="text-muted-foreground">Disabled</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>

          <Button variant="outline" className="w-[200px] justify-between border-destructive">
            <span className="text-destructive">Error state</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </CodePreview>
    </div>
  );
}
