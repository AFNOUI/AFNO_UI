"use client";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/**
 * Thin dropdown helper used by `InspectorPanel` to render a label + select of
 * string values (font sizes, colors, flex directions, etc.). Extracted from
 * `InspectorPanel.tsx` verbatim; behaviour and markup are byte-identical.
 */

interface StyleSelectProps {
    label: string;
    value?: string;
    options: string[];
    onChange: (v: string) => void;
}

export function StyleSelect({ label, value, options, onChange }: StyleSelectProps) {
    return (
        <div className="space-y-0.5">
            <Label className="text-[10px] text-muted-foreground">{label}</Label>
            <Select value={value || ""} onValueChange={onChange}>
                <SelectTrigger className="h-7 text-[11px]">
                    <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((o) => (
                        <SelectItem key={o} value={o} className="text-xs">
                            {o}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
