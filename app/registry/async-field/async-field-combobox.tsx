export const data = {
  title: "Async Field Combobox",
  description: "Async combobox with searchable remote options.",
  fieldLabel: "Async Combobox",
  searchPlaceholder: "Search...",
  emptyMessage: "No result",
  defaultApi: "Posts",
};

export const code = `import axios from "axios";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export interface Option {
  label: string;
  value: string;
}

export interface AsyncApiPreset {
  url: string;
  name: string;
  labelKey: string;
  valueKey: string;
  dataPath: string;
}

export const ASYNC_API_PRESETS: AsyncApiPreset[] = [
  { name: "Users", url: "https://jsonplaceholder.typicode.com/users", labelKey: "name", valueKey: "id", dataPath: "" },
  { name: "Posts", url: "https://jsonplaceholder.typicode.com/posts", labelKey: "title", valueKey: "id", dataPath: "" },
  { name: "Todos", url: "https://jsonplaceholder.typicode.com/todos", labelKey: "title", valueKey: "id", dataPath: "" },
];

export function getPresetByName(name: string | undefined): AsyncApiPreset {
  if (!name) return ASYNC_API_PRESETS[0];
  return ASYNC_API_PRESETS.find((p) => p.name === name) ?? ASYNC_API_PRESETS[0];
}

export function useAsyncOptions(url: string, labelKey: string, valueKey: string, dataPath: string) {
  return useQuery({
    queryKey: ["async-preview", url, labelKey, valueKey, dataPath],
    queryFn: async () => {
      const { data } = await axios.get(url);
      const items = dataPath ? dataPath.split(".").reduce((o: unknown, k: string) => (o as Record<string, unknown>)?.[k], data as unknown) : data;
      return (Array.isArray(items) ? items : []).map((item: unknown) => {
        const rec = item as Record<string, unknown>;
        return {
          label: String(rec[labelKey] || ""),
          value: String(rec[valueKey] || ""),
        };
      }) as Option[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function AsyncFieldCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [api, setApi] = useState(getPresetByName(${JSON.stringify(data.defaultApi)}));

  const { data: options = [], isLoading } = useAsyncOptions(api.url, api.labelKey, api.valueKey, api.dataPath);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {ASYNC_API_PRESETS.map((preset) => (
            <Button key={preset.name} size="sm" variant={api.name === preset.name ? "default" : "outline"} onClick={() => setApi(preset)}>
              {preset.name}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">${data.fieldLabel}</Label>
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
                  placeholder={${JSON.stringify(data.searchPlaceholder)}}
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                  ) : filtered.length === 0 ? (
                    <CommandEmpty>${data.emptyMessage}</CommandEmpty>
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
  );
}
`;
