"use client";

import { cn } from "@/lib/utils";

// Deep import rather than the `builder-header` barrel — a preset button needs
// one tooltip, not the header's whole surface area.
import { ToolbarTip } from "@/components/shared/builder-header/primitives/ToolbarTip";

import type { PreviewPreset } from "../types";

export interface PreviewWidthButtonProps {
  preset: PreviewPreset;
  active: boolean;
  onSelect: (id: PreviewPreset["id"]) => void;
}

/**
 * PRIMITIVE — one width button in the preview toolbar.
 *
 * A segmented control rather than four outline buttons: these are four values
 * of one setting, and four separate buttons would read as four separate
 * actions. The label collapses to the raw pixel count on small screens, where
 * the width being previewed is more useful than the device name.
 */
export function PreviewWidthButton({ preset, active, onSelect }: PreviewWidthButtonProps) {
  const Icon = preset.icon;

  return (
    <ToolbarTip tip={preset.hint}>
      <button
        type="button"
        aria-pressed={active}
        onClick={() => onSelect(preset.id)}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-(--radius) px-2 text-xs font-medium",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">{preset.label}</span>
        <span className="tabular-nums sm:hidden">{preset.short}</span>
      </button>
    </ToolbarTip>
  );
}
