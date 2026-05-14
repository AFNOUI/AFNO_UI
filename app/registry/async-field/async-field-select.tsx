export const data = {
  title: "Async Field Select",
  description: "Async select field with remote options.",
  fieldLabel: "Async Select",
  defaultApi: "Users",
};

export const code = `import axios from "axios";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export function AsyncFieldSelect() {
  const [value, setValue] = useState("");
  const [api, setApi] = useState(getPresetByName(${JSON.stringify(data.defaultApi)}));

  const { data: options = [], isLoading } = useAsyncOptions(api.url, api.labelKey, api.valueKey, api.dataPath);

  return (
    <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {ASYNC_API_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              size="sm"
              variant={api.name === preset.name ? "default" : "outline"}
              onClick={() => setApi(preset)}
            >
              {preset.name}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">${data.fieldLabel}</Label>
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoading ? "Loading..." : "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                options.slice(0, 50).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
    </div>
  );
}
`;
