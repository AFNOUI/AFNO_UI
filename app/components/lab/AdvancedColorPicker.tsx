"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Pipette } from "lucide-react";

import {
  hslToHex,
  hexToHsl,
  hslToRgb,
  parseHsl,
  hslToOklch,
  parseToHsl,
  ColorFormat,
  formatHslString,
} from "@/utils/colorUtils";
import { cn } from "@/lib/utils";
import { CSSVariable } from "@/contexts/ThemeContext";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Preset color swatches - organized by category
const COLOR_SWATCHES = {
  grays: [
    "0 0% 100%", "0 0% 96%", "0 0% 90%", "0 0% 75%",
    "0 0% 50%", "0 0% 25%", "0 0% 10%", "0 0% 4%", "0 0% 0%"
  ],
  reds: [
    "0 100% 95%", "0 100% 85%", "0 100% 70%", "0 100% 60%",
    "0 100% 50%", "0 80% 45%", "0 70% 35%", "0 60% 25%"
  ],
  oranges: [
    "25 100% 95%", "25 100% 85%", "25 100% 70%", "25 100% 60%",
    "25 100% 50%", "25 80% 45%", "25 70% 35%", "25 60% 25%"
  ],
  yellows: [
    "50 100% 95%", "50 100% 85%", "50 100% 70%", "50 100% 60%",
    "50 100% 50%", "50 80% 45%", "50 70% 35%", "50 60% 25%"
  ],
  greens: [
    "142 100% 95%", "142 80% 85%", "142 70% 60%", "142 76% 45%",
    "142 76% 36%", "142 70% 30%", "142 60% 22%", "142 50% 15%"
  ],
  cyans: [
    "180 100% 95%", "180 80% 85%", "180 70% 60%", "180 76% 45%",
    "180 76% 36%", "180 70% 30%", "180 60% 22%", "180 50% 15%"
  ],
  blues: [
    "217 100% 95%", "217 90% 85%", "217 91% 70%", "217 91% 60%",
    "217 91% 50%", "217 80% 45%", "217 70% 35%", "217 60% 25%"
  ],
  purples: [
    "270 100% 95%", "270 90% 85%", "270 80% 70%", "270 80% 60%",
    "270 80% 50%", "270 70% 45%", "270 60% 35%", "270 50% 25%"
  ],
  pinks: [
    "330 100% 95%", "330 90% 85%", "330 80% 70%", "330 80% 60%",
    "330 80% 50%", "330 70% 45%", "330 60% 35%", "330 50% 25%"
  ],
};

interface AdvancedColorPickerProps {
  variable: CSSVariable;
  colorFormat: ColorFormat;
  onUpdate: (name: string, value: string) => void;
}

export default function AdvancedColorPicker({
  variable,
  onUpdate,
  colorFormat,
}: AdvancedColorPickerProps) {
  const [copied, setCopied] = useState(false);
  const [inputTab, setInputTab] = useState<ColorFormat>("hsl");

  const parsed = useMemo(() => parseHsl(variable.value), [variable.value]);
  const hexValue = useMemo(() => hslToHex(variable.value), [variable.value]);

  // Format values for each format
  const formatValues = useMemo(() => ({
    hex: hexValue,
    rgb: hslToRgb(variable.value),
    oklch: hslToOklch(variable.value),
    hsl: `${Math.round(parsed.h)} ${Math.round(parsed.s)}% ${Math.round(parsed.l)}%`,
  }), [variable.value, parsed, hexValue]);

  // Current display value based on format
  const displayValue = useMemo(() => {
    switch (colorFormat) {
      case "hex": return formatValues.hex;
      case "rgb": return formatValues.rgb;
      case "oklch": return formatValues.oklch;
      case "hsl": return `hsl(${formatValues.hsl})`;
      default: return formatValues.hsl;
    }
  }, [colorFormat, formatValues]);

  const handleHslChange = (h: number, s: number, l: number) => {
    onUpdate(variable.name, formatHslString({ h, s, l }));
  };

  const handleSwatchClick = (hslValue: string) => {
    onUpdate(variable.name, hslValue);
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHsl = hexToHsl(e.target.value);
    onUpdate(variable.name, newHsl);
  };

  const handleFormatInput = (value: string, format: ColorFormat) => {
    try {
      if (format === "hex") {
        if (/^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{3}$/.test(value)) {
          onUpdate(variable.name, hexToHsl(value));
        }
      } else {
        const hsl = parseToHsl(value);
        if (hsl !== "0 0% 0%" || value.includes("0")) {
          onUpdate(variable.name, hsl);
        }
      }
    } catch {
      // Invalid input, ignore
    }
  };

  const copyValue = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    navigator.clipboard.writeText(displayValue);
  };

  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative group/trigger">
            <div
              className="w-8 h-8 rounded-md border border-border shadow-sm transition-transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: hexValue }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/trigger:opacity-100 transition-opacity bg-black/30 rounded-md">
              <Pipette size={12} className="text-white" />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start" side="left">
          <div className="space-y-4">
            {/* Native Color Picker + Preview */}
            <div className="flex gap-3 items-start">
              <div className="relative">
                <input
                  type="color"
                  value={hexValue}
                  onChange={handleNativeColorChange}
                  className="w-16 h-16 rounded-lg cursor-pointer border border-border"
                  style={{ padding: 0 }}
                />
                <span className="absolute -bottom-5 left-0 right-0 text-[9px] text-center text-muted-foreground">
                  Color Wheel
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs font-medium">{variable.label}</Label>
                <div className="text-[10px] font-mono text-muted-foreground break-all">
                  {displayValue}
                </div>
              </div>
            </div>

            {/* HSL Sliders */}
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Hue</Label>
                  <span className="text-[10px] font-mono">{Math.round(parsed.h)}°</span>
                </div>
                <Slider
                  value={[parsed.h]}
                  onValueChange={([h]) => handleHslChange(h, parsed.s, parsed.l)}
                  min={0}
                  max={360}
                  step={1}
                  className="h-3"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(0, ${parsed.s}%, ${parsed.l}%),
                      hsl(60, ${parsed.s}%, ${parsed.l}%),
                      hsl(120, ${parsed.s}%, ${parsed.l}%),
                      hsl(180, ${parsed.s}%, ${parsed.l}%),
                      hsl(240, ${parsed.s}%, ${parsed.l}%),
                      hsl(300, ${parsed.s}%, ${parsed.l}%),
                      hsl(360, ${parsed.s}%, ${parsed.l}%)
                    )`,
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Saturation</Label>
                  <span className="text-[10px] font-mono">{Math.round(parsed.s)}%</span>
                </div>
                <Slider
                  value={[parsed.s]}
                  onValueChange={([s]) => handleHslChange(parsed.h, s, parsed.l)}
                  min={0}
                  max={100}
                  step={1}
                  className="h-3"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(${parsed.h}, 0%, ${parsed.l}%),
                      hsl(${parsed.h}, 100%, ${parsed.l}%)
                    )`,
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Lightness</Label>
                  <span className="text-[10px] font-mono">{Math.round(parsed.l)}%</span>
                </div>
                <Slider
                  value={[parsed.l]}
                  onValueChange={([l]) => handleHslChange(parsed.h, parsed.s, l)}
                  min={0}
                  max={100}
                  step={1}
                  className="h-3"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(${parsed.h}, ${parsed.s}%, 0%),
                      hsl(${parsed.h}, ${parsed.s}%, 50%),
                      hsl(${parsed.h}, ${parsed.s}%, 100%)
                    )`,
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>

            {/* Format Input Tabs */}
            <Tabs value={inputTab} onValueChange={(v) => setInputTab(v as ColorFormat)}>
              <TabsList className="h-7 w-full grid grid-cols-4 p-0.5">
                <TabsTrigger value="hsl" className="text-[10px] h-6">HSL</TabsTrigger>
                <TabsTrigger value="hex" className="text-[10px] h-6">HEX</TabsTrigger>
                <TabsTrigger value="rgb" className="text-[10px] h-6">RGB</TabsTrigger>
                <TabsTrigger value="oklch" className="text-[10px] h-6">OKLCH</TabsTrigger>
              </TabsList>

              <TabsContent value="hsl" className="mt-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[9px] text-muted-foreground">H</Label>
                    <Input
                      type="number"
                      value={Math.round(parsed.h)}
                      onChange={(e) => handleHslChange(Number(e.target.value), parsed.s, parsed.l)}
                      className="h-7 text-xs"
                      min={0}
                      max={360}
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-muted-foreground">S%</Label>
                    <Input
                      type="number"
                      value={Math.round(parsed.s)}
                      onChange={(e) => handleHslChange(parsed.h, Number(e.target.value), parsed.l)}
                      className="h-7 text-xs"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-muted-foreground">L%</Label>
                    <Input
                      type="number"
                      value={Math.round(parsed.l)}
                      onChange={(e) => handleHslChange(parsed.h, parsed.s, Number(e.target.value))}
                      className="h-7 text-xs"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hex" className="mt-2">
                <Input
                  value={formatValues.hex}
                  onChange={(e) => handleFormatInput(e.target.value, "hex")}
                  className="h-8 text-xs font-mono"
                  placeholder="#000000"
                />
              </TabsContent>

              <TabsContent value="rgb" className="mt-2">
                <Input
                  value={formatValues.rgb}
                  onChange={(e) => handleFormatInput(e.target.value, "rgb")}
                  className="h-8 text-xs font-mono"
                  placeholder="rgb(0, 0, 0)"
                />
              </TabsContent>

              <TabsContent value="oklch" className="mt-2">
                <Input
                  value={formatValues.oklch}
                  onChange={(e) => handleFormatInput(e.target.value, "oklch")}
                  className="h-8 text-xs font-mono"
                  placeholder="oklch(0% 0 0)"
                  readOnly
                />
                <p className="text-[9px] text-muted-foreground mt-1">OKLCH is read-only (output only)</p>
              </TabsContent>
            </Tabs>

            {/* Color Swatches */}
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Quick Colors</Label>
              <div className="space-y-1.5">
                {Object.entries(COLOR_SWATCHES).map(([name, colors]) => (
                  <div key={name} className="flex gap-1">
                    {colors.map((color, i) => (
                      <button
                        key={`${name}-${i}`}
                        onClick={() => handleSwatchClick(color)}
                        className={cn(
                          "w-5 h-5 rounded border border-border/50 transition-transform hover:scale-110 hover:z-10",
                          variable.value === color && "ring-2 ring-primary ring-offset-1"
                        )}
                        style={{ backgroundColor: `hsl(${color})` }}
                        title={`hsl(${color})`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{variable.label}</p>
        <p className="text-[10px] font-mono text-muted-foreground truncate">
          {displayValue}
        </p>
      </div>

      <button
        onClick={copyValue}
        className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
      >
        {copied ? (
          <Check size={12} className="text-primary" />
        ) : (
          <Copy size={12} className="text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
