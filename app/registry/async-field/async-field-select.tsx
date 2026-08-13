import { buildFieldVariantFiles } from "../fieldVariantBundle";

export const data = {
  title: "Async Field Select",
  description: "Async select field with remote options.",
  fieldLabel: "Async Select",
  defaultApi: "Users",
};

export const componentName = "AsyncFieldSelect";

/**
 * Renders only — it reaches the network through `./hooks`, never `./services`
 * (AI_AGENT_RULES § R-55). Emitted unchanged for every transport combination,
 * which is what lets the registry ship per-flag overrides instead of duplicate
 * bundles (§ R-56).
 */
export const componentCode = `"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ASYNC_API_PRESETS, getPresetByName } from "./constants";
import { useAsyncOptions } from "./hooks";

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

/**
 * The installed bundle, one entry per file, for the gallery's Component tab.
 * Shown as real per-file tabs — concatenating them hid the
 * component -> hooks -> services layering the bundle exists to teach.
 */
export const files = buildFieldVariantFiles("async-field", "async-field-select", {
    data,
    componentName,
    componentCode,
  }).map((f) => ({
  name: f.path.split("/").pop() as string,
  code: f.content,
}));
