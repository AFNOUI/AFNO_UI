"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { code, data } from "@/registry/async-field/async-field-multi-select";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ASYNC_API_PRESETS, getPresetByName, useAsyncOptions } from "./shared";

export function AsyncFieldMultiSelect() {
  const [selected, setSelected] = useState<string[]>([]);
  const [api, setApi] = useState(getPresetByName(data.defaultApi));
  
  const { data: options = [], isLoading } = useAsyncOptions(api.url, api.labelKey, api.valueKey, api.dataPath);

  const toggle = (val: string) => {
    setSelected((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  };

  const maxItems = data.maxItems ?? 5;

  const snippet = `import { AsyncMultiSelectField } from "@/forms/react-hook-form";

<AsyncMultiSelectField
  config={{
    type: "asyncmultiselect",
    name: "items",
    maxItems: ${maxItems},
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
      variant="async-field-multi-select"
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
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selected.map((v) => {
                const opt = options.find((o) => o.value === v);
                return (
                  <Badge key={v} variant="secondary" className="gap-1">
                    {opt?.label || v}
                    <button type="button" onClick={() => toggle(v)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
          <Select value="" onValueChange={toggle}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoading ? "Loading..." : `${selected.length} selected`} />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
              ) : (
                options.slice(0, 50).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {selected.includes(o.value) ? "✓ " : ""}{o.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </ComponentInstall>
  );
}
