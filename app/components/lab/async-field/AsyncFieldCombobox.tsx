"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { code, data } from "@/registry/async-field/async-field-combobox";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { ASYNC_API_PRESETS, getPresetByName, useAsyncOptions } from "./shared";

export function AsyncFieldCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [api, setApi] = useState(getPresetByName(data.defaultApi));

  const { data: options = [], isLoading } = useAsyncOptions(api.url, api.labelKey, api.valueKey, api.dataPath);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  const snippet = `import { AsyncComboboxField } from "@/forms/react-hook-form";

<AsyncComboboxField
  config={{
    type: "asynccombobox",
    name: "item",
    searchPlaceholder: "Search...",
    emptyMessage: "No result",
    apiConfig: {
      url: "${api.url}",
      method: "GET",
      responseMapping: {
        dataPath: "${api.dataPath}",
        labelKey: "${api.labelKey}",
        valueKey: "${api.valueKey}",
      },
    },
  }}
/>`;

  return (
    <ComponentInstall
      category="async-field"
      variant="async-field-combobox"
      title={data.title}
      code={snippet}
      fullCode={code}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {ASYNC_API_PRESETS.map((preset) => (
            <Button key={preset.name} size="sm" variant={api.name === preset.name ? "default" : "outline"} onClick={() => setApi(preset)}>
              {preset.name}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">{data.fieldLabel}</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {value ? options.find((o) => o.value === value)?.label : "Search & select..."}
                <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={data.searchPlaceholder}
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                  ) : filtered.length === 0 ? (
                    <CommandEmpty>{data.emptyMessage}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filtered.slice(0, 50).map((o) => (
                        <CommandItem key={o.value} value={o.value} onSelect={() => { setValue(o.value); setOpen(false); }}>
                          <Check className={cn("me-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")} />
                          {o.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </ComponentInstall>
  );
}
