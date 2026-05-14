"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

/**
 * Combo input: text input + dropdown presets. Used by the inspector panel
 * for width / height / min / max dimensions where users should be able to
 * pick a preset OR type an arbitrary Tailwind class (e.g. `w-[237px]`).
 *
 * Extracted from `InspectorPanel.tsx` verbatim — props and markup are
 * byte-for-byte identical to the original inline component.
 */

interface DimensionInputProps {
    label: string;
    value?: string;
    onChange: (v: string) => void;
    presets: { label: string; value: string }[];
}

export function DimensionInput({ label, value, presets, onChange }: DimensionInputProps) {
    const [open, setOpen] = useState(false);
    const displayLabel =
        presets.find((p) => p.value === value)?.label || value || "";

    return (
        <div className="space-y-0.5">
            <Label className="text-[10px] text-muted-foreground">{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className="flex h-7 w-full items-center justify-between rounded-md border border-input bg-background px-2 text-[11px] hover:border-primary/40 transition-colors">
                        <span className={cn("truncate", !value && "text-muted-foreground")}>
                            {displayLabel || "Default"}
                        </span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-2">
                        <Input
                            placeholder="Custom value e.g. w-[200px]"
                            value={value || ""}
                            onChange={(e) => onChange(e.target.value)}
                            className="h-7 text-[11px]"
                        />
                        <Separator />
                        <div className="grid grid-cols-3 gap-1 max-h-40 overflow-auto">
                            {presets.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => {
                                        onChange(p.value);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        "px-1.5 py-1 rounded text-[10px] font-medium border transition-all text-start truncate",
                                        value === p.value
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {value && (
                            <>
                                <Separator />
                                <button
                                    onClick={() => {
                                        onChange("");
                                        setOpen(false);
                                    }}
                                    className="w-full text-[10px] text-destructive hover:text-destructive/80 py-1"
                                >
                                    Clear
                                </button>
                            </>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
