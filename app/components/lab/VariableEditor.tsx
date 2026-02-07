"use client";

import { useTranslation } from "react-i18next";
import { RotateCcw, Palette, Type, Move, Sparkles, Hash } from "lucide-react";

import { ColorFormat } from "@/utils/colorUtils";
import { useTheme, CSSVariable } from "@/contexts/ThemeContext";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ThemePresetSelector from "./ThemePresetSelector";
import AdvancedColorPicker from "./AdvancedColorPicker";

interface SliderPickerProps {
  min: number;
  max: number;
  step: number;
  variable: CSSVariable;
  onUpdate: (name: string, value: string) => void;
}

const SliderPicker = ({ variable, onUpdate, min, max, step }: SliderPickerProps) => {
  const numericValue = parseFloat(variable.value) || 0;

  return (
    <div className="p-3 rounded-lg bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-xs font-medium">{variable.label}</Label>
        <span className="text-xs font-mono text-muted-foreground">
          {variable.value}{variable.unit || ""}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Slider
          min={min}
          max={max}
          step={step}
          className="flex-1"
          value={[numericValue]}
          onValueChange={([v]) => onUpdate(variable.name, String(v))}
        />
        <Input
          min={min}
          max={max}
          step={step}
          type="number"
          value={variable.value}
          className="w-16 h-8 text-xs text-center"
          onChange={(e) => onUpdate(variable.name, e.target.value)}
        />
      </div>
    </div>
  );
};

interface TextInputPickerProps {
  variable: CSSVariable;
  onUpdate: (name: string, value: string) => void;
}

const TextInputPicker = ({ variable, onUpdate }: TextInputPickerProps) => {
  return (
    <div className="p-3 rounded-lg bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium">{variable.label}</Label>
      </div>
      <Input
        value={variable.value}
        placeholder={variable.name}
        className="h-8 text-xs font-mono"
        onChange={(e) => onUpdate(variable.name, e.target.value)}
      />
    </div>
  );
};

export default function VariableEditor() {
  const { t } = useTranslation();
  const { theme, variables, updateVariable, resetVariables, colorFormat, setColorFormat } = useTheme();

  const colorVars = variables.filter((v) => v.category === "color");
  const radiusVars = variables.filter((v) => v.category === "radius");
  const typographyVars = variables.filter((v) => v.category === "typography");
  const spacingVars = variables.filter((v) => v.category === "spacing");
  const effectVars = variables.filter((v) => v.category === "effect");
  const componentVars = variables.filter((v) => v.category === "component");

  // Group colors
  const coreColors = colorVars.filter((v) =>
    ["--background", "--foreground", "--primary", "--primary-foreground"].includes(v.name)
  );
  const uiColors = colorVars.filter((v) =>
    ["--secondary", "--secondary-foreground", "--muted", "--muted-foreground", "--accent", "--accent-foreground"].includes(v.name)
  );
  const componentColors = colorVars.filter((v) =>
    ["--card", "--card-foreground", "--border", "--input", "--ring", "--destructive", "--destructive-foreground"].includes(v.name)
  );

  // Group component sizing
  const buttonSizing = componentVars.filter((v) => v.name.startsWith("--btn-"));
  const inputSizing = componentVars.filter((v) => v.name.startsWith("--input-"));
  const cardSizing = componentVars.filter((v) => v.name.startsWith("--card-"));
  const badgeSizing = componentVars.filter((v) => v.name.startsWith("--badge-"));

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Palette size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{t("editor.title")}</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {theme === "light" ? t("editor.lightMode") : t("editor.darkMode")}
              </p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetVariables}
                className="h-8 w-8 p-0"
              >
                <RotateCcw size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{t("editor.resetDefaults")}</TooltipContent>
          </Tooltip>
        </div>

        {/* Color Format Selector */}
        <div className="flex items-center gap-2">
          <Hash size={12} className="text-muted-foreground" />
          <Tabs value={colorFormat} onValueChange={(v) => setColorFormat(v as ColorFormat)} className="flex-1">
            <TabsList className="h-7 w-full grid grid-cols-4 p-0.5">
              <TabsTrigger value="hsl" className="text-[10px] h-6">HSL</TabsTrigger>
              <TabsTrigger value="hex" className="text-[10px] h-6">HEX</TabsTrigger>
              <TabsTrigger value="rgb" className="text-[10px] h-6">RGB</TabsTrigger>
              <TabsTrigger value="oklch" className="text-[10px] h-6">OKLCH</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Export will use this format
        </p>
      </div>

      {/* Variables */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4">
          {/* Theme Presets */}
          <div className="mb-4">
            <ThemePresetSelector />
          </div>

          <Accordion type="multiple" defaultValue={["core", "ui", "component"]} className="space-y-2">
            {/* Core Colors */}
            <AccordionItem value="core" className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
                {t("editor.coreColors")}
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-1">
                  {coreColors.map((v) => (
                    <AdvancedColorPicker key={v.name} variable={v} onUpdate={updateVariable} colorFormat={colorFormat} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* UI Colors */}
            <AccordionItem value="ui" className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
                {t("editor.uiColors")}
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-1">
                  {uiColors.map((v) => (
                    <AdvancedColorPicker key={v.name} variable={v} onUpdate={updateVariable} colorFormat={colorFormat} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Component Colors */}
            <AccordionItem value="component" className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
                {t("editor.componentColors")}
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-1">
                  {componentColors.map((v) => (
                    <AdvancedColorPicker key={v.name} variable={v} onUpdate={updateVariable} colorFormat={colorFormat} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Border Radius */}
            <AccordionItem value="radius" className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
                {t("editor.borderRadius")}
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-2">
                {radiusVars.map((v) => (
                  <SliderPicker
                    min={0}
                    max={2}
                    key={v.name}
                    step={0.125}
                    variable={v}
                    onUpdate={updateVariable}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Typography */}
            <AccordionItem value="typography" className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Type size={12} />
                  {t("editor.typography")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-2">
                {typographyVars.map((v) => (
                  <SliderPicker
                    key={v.name}
                    variable={v}
                    onUpdate={updateVariable}
                    min={v.name.includes("font-size") ? 10 : v.name.includes("line") ? 1 : -0.1}
                    max={v.name.includes("font-size") ? 24 : v.name.includes("line") ? 2.5 : 0.2}
                    step={v.name.includes("font-size") ? 1 : 0.05}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Spacing */}
            <AccordionItem value="spacing" className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Move size={12} />
                  {t("editor.spacing")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-2">
                {spacingVars.map((v) => (
                  <SliderPicker
                    key={v.name}
                    variable={v}
                    onUpdate={updateVariable}
                    min={0}
                    max={64}
                    step={1}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Effects */}
            <AccordionItem value="effects" className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Sparkles size={12} />
                  {t("editor.effects")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-2">
                {effectVars.map((v) => (
                  <TextInputPicker key={v.name} variable={v} onUpdate={updateVariable} />
                ))}
              </AccordionContent>
            </AccordionItem>
            {/* Component Sizing */}
            <AccordionItem value="components" className="border rounded-lg px-3">
              <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Sparkles size={12} />
                  Component Sizing
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-4">
                {/* Button Sizing */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Button</p>
                  <div className="space-y-2">
                    {buttonSizing.map((v) => (
                      <SliderPicker
                        key={v.name}
                        variable={v}
                        onUpdate={updateVariable}
                        min={0.5}
                        max={4}
                        step={0.125}
                      />
                    ))}
                  </div>
                </div>
                {/* Input Sizing */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Input</p>
                  <div className="space-y-2">
                    {inputSizing.map((v) => (
                      <SliderPicker
                        key={v.name}
                        variable={v}
                        onUpdate={updateVariable}
                        min={0.5}
                        max={4}
                        step={0.125}
                      />
                    ))}
                  </div>
                </div>
                {/* Card Sizing */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Card</p>
                  <div className="space-y-2">
                    {cardSizing.map((v) => (
                      <SliderPicker
                        key={v.name}
                        variable={v}
                        onUpdate={updateVariable}
                        min={0.25}
                        max={3}
                        step={0.125}
                      />
                    ))}
                  </div>
                </div>
                {/* Badge Sizing */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Badge</p>
                  <div className="space-y-2">
                    {badgeSizing.map((v) => (
                      <SliderPicker
                        key={v.name}
                        variable={v}
                        onUpdate={updateVariable}
                        min={0.125}
                        max={2}
                        step={0.0625}
                      />
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
