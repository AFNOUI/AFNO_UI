"use client";

import { useState } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { hslToHex } from "@/utils/colorUtils";
import { useTheme } from "@/contexts/ThemeContext";
import { themePresets, ThemePreset } from "@/data/themePresets";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ThemePresetSelector() {
  const { theme, applyPreset, currentPresetId } = useTheme();

  const [open, setOpen] = useState(false);

  const popularPresets = themePresets.filter((p) => p.category === "popular");
  const colorPresets = themePresets.filter((p) => p.category === "color");

  const currentPreset = themePresets.find((p) => p.id === currentPresetId);

  const handleSelectPreset = (preset: ThemePreset) => {
    applyPreset(preset);
    setOpen(false);
  };

  const PresetButton = ({ preset }: { preset: ThemePreset }) => {
    const colors = theme === "dark" ? preset.dark : preset.light;
    const primaryHex = hslToHex(colors["--primary"]);
    const bgHex = hslToHex(colors["--background"]);
    const fgHex = hslToHex(colors["--foreground"]);
    const accentHex = hslToHex(colors["--accent"]);

    const isSelected = currentPresetId === preset.id;

    return (
      <button
        onClick={() => handleSelectPreset(preset)}
        className={cn(
          "w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left",
          isSelected
            ? "bg-primary/10 border border-primary/30"
            : "hover:bg-muted/50 border border-transparent"
        )}
      >
        <div className="shrink-0 flex gap-0.5">
          <div
            className="w-4 h-6 rounded-l-sm"
            style={{ backgroundColor: bgHex }}
          />
          <div
            className="w-4 h-6"
            style={{ backgroundColor: primaryHex }}
          />
          <div
            className="w-4 h-6"
            style={{ backgroundColor: accentHex }}
          />
          <div
            className="w-4 h-6 rounded-r-sm"
            style={{ backgroundColor: fgHex }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{preset.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {preset.description}
          </p>
        </div>
        {isSelected && (
          <Check size={14} className="text-primary shrink-0" />
        )}
      </button>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between gap-2 h-9"
        >
          <div className="flex items-center gap-2">
            <Palette size={14} className="text-primary" />
            <span className="text-xs">
              {currentPreset ? currentPreset.name : "Select Preset"}
            </span>
          </div>
          <ChevronDown size={14} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" sideOffset={4}>
        <ScrollArea className="h-[350px]">
          <div className="p-3 space-y-4">
            {/* Popular Themes */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Popular Themes
              </p>
              <div className="space-y-1">
                {popularPresets.map((preset) => (
                  <PresetButton key={preset.id} preset={preset} />
                ))}
              </div>
            </div>

            {/* Color-based Themes */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Color Themes
              </p>
              <div className="space-y-1">
                {colorPresets.map((preset) => (
                  <PresetButton key={preset.id} preset={preset} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
