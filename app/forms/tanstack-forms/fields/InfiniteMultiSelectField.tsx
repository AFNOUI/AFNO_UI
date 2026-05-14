import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getExtraKeyValuesFromOptions } from "../../utils/fieldExtraKeys";
import {
  useInfiniteOptions,
  type InfiniteOption,
} from "@/forms/hooks/useInfiniteOptions";
import { useTanstackFormContext } from "../TanstackFormContext";
import type { InfiniteMultiselectFieldConfig } from "@/forms/types/types";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/form-primitives";

export function InfiniteMultiSelectField({
  config,
}: {
  config: InfiniteMultiselectFieldConfig;
}) {
  const { form } = useTanstackFormContext();
  const [open, setOpen] = useState(false);
  const [selMap, setSelMap] = useState<Map<string, string>>(new Map());
  const {
    options,
    isLoading,
    isFetchingNextPage,
    hasMore,
    searchTerm,
    setSearchTerm,
    sentinelRef,
  } = useInfiniteOptions({
    apiConfig: config.apiConfig,
    pageSize: config.apiConfig?.pageSize,
  });
  return (
    <form.Field name={config.name}>
      {(field: AnyFieldApi) => {
        const selected: string[] = field.state.value || [];
        const toggle = (o: InfiniteOption) => {
          const nv = selected.includes(o.value)
            ? selected.filter((v) => v !== o.value)
            : [...selected, o.value];
          if (config.maxItems && nv.length > config.maxItems) return;
          field.handleChange(nv);
          const selectedOpts = options.filter((x) => nv.includes(x.value));
          const extras = getExtraKeyValuesFromOptions(config.name, selectedOpts);
          Object.entries(extras).forEach(([k, v]) => form.setFieldValue(k, v));
          for (const key of config.apiConfig?.responseMapping?.extraKeys || []) {
            const synthetic = `${config.name}__${key}`;
            if (!(synthetic in extras)) form.setFieldValue(synthetic, "");
          }
          const nm = new Map(selMap);
          if (selected.includes(o.value)) nm.delete(o.value);
          else nm.set(o.value, o.label);
          setSelMap(nm);
        };
        const remove = (v: string) => {
          const nv = selected.filter((x) => x !== v);
          field.handleChange(nv);
          const selectedOpts = options.filter((x) => nv.includes(x.value));
          const extras = getExtraKeyValuesFromOptions(config.name, selectedOpts);
          Object.entries(extras).forEach(([k, val]) => form.setFieldValue(k, val));
          for (const key of config.apiConfig?.responseMapping?.extraKeys || []) {
            const synthetic = `${config.name}__${key}`;
            if (!(synthetic in extras)) form.setFieldValue(synthetic, "");
          }
          const nm = new Map(selMap);
          nm.delete(v);
          setSelMap(nm);
        };
        const getLabel = (v: string) =>
          selMap.get(v) || options.find((o) => o.value === v)?.label || v;
        return (
          <div className={cn("flex flex-col space-y-2", config.className)}>
            {config.label && (
              <Label>
                {config.label}
                {config.required && (
                  <span className="text-destructive ms-1">*</span>
                )}
              </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full min-h-10 h-auto justify-between",
                    !selected.length && "text-muted-foreground",
                  )}
                  disabled={config.disabled}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selected.length > 0 ? (
                      selected.map((v) => (
                        <Badge key={v} variant="secondary" className="me-1">
                          {getLabel(v)}
                          <span
                            role="button"
                            tabIndex={0}
                            className="ms-1 rounded-full"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              remove(v);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                remove(v);
                              }
                            }}
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </Badge>
                      ))
                    ) : (
                      <span>{config.placeholder || "Select options"}</span>
                    )}
                  </div>
                  <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div
                  className="p-2 border-b border-border"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {options.length === 0 && isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : options.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No options found
                    </div>
                  ) : (
                    <div className="p-1">
                      {options.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => toggle(o)}
                          disabled={o.disabled}
                          className={cn(
                            "w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent",
                            o.disabled && "opacity-50",
                          )}
                        >
                          <Check
                            className={cn(
                              "me-2 h-4 w-4",
                              selected.includes(o.value)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {o.label}
                        </button>
                      ))}
                      {hasMore && (
                        <div
                          ref={sentinelRef}
                          className="flex items-center justify-center py-2"
                        >
                          {isFetchingNextPage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Scroll for more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {config.description && (
              <FieldDescription>{config.description}</FieldDescription>
            )}
            <FieldError error={field.state.meta.errors} />
          </div>
        );
      }}
    </form.Field>
  );
}
