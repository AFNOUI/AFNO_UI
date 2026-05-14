"use client";

import {
  Box,
  Tablet,
  Monitor,
  Settings2,
  Paintbrush,
  Smartphone,
  Type as TypeIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Breakpoint,
  BuilderNode,
  componentRegistry,
} from "@/ui-builder/data/uiBuilderRegistry";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  parseSpacing,
  SpacingControl,
  buildSpacingClass,
} from "./SpacingControl";
import { ChartDataEditor } from "./ChartDataEditor";
import {
  ALIGN_ITEMS,
  BG_COLORS,
  BORDER_COLORS,
  BORDER_RADIUS,
  BORDER_WIDTHS,
  DISPLAYS,
  FLEX_DIRECTION,
  FLEX_WRAP,
  FONT_SIZES,
  FONT_WEIGHTS,
  GAPS,
  GRID_COLS,
  HEIGHT_PRESETS,
  JUSTIFY,
  MAX_HEIGHT_PRESETS,
  MAX_WIDTH_PRESETS,
  MIN_HEIGHT_PRESETS,
  MIN_WIDTH_PRESETS,
  OPACITY,
  OVERFLOW,
  POSITIONS,
  SHADOWS,
  TEXT_ALIGNS,
  TEXT_COLORS,
  WIDTH_PRESETS,
  Z_INDEX,
} from "./inspector/inspectorOptions";
import { LAYOUT_RECIPES, RESPONSIVE_RECIPES } from "./inspector/inspectorRecipes";
import { DimensionInput } from "./inspector/DimensionInput";
import { StyleSelect } from "./inspector/StyleSelect";

interface InspectorPanelProps {
  breakpoint: Breakpoint;
  onUpdateStylesAtBreakpoint?: (
    id: string,
    breakpoint: Breakpoint,
    key: string,
    value: string,
  ) => void;
  selectedNode: BuilderNode | null;
  onMoveNode?: (id: string, offset: number) => void;
  onUpdateStyles: (id: string, key: string, value: string) => void;
  onUpdateProps: (id: string, props: Record<string, unknown>) => void;
}

export function InspectorPanel({
  selectedNode,
  breakpoint,
  onUpdateProps,
  onUpdateStyles,
  onUpdateStylesAtBreakpoint,
  onMoveNode,
}: InspectorPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-full border-s border-border bg-card/30 flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">Select a component</p>
          <p className="text-xs mt-1 text-muted-foreground/70">
            Click on any element to inspect & edit
          </p>
        </div>
      </div>
    );
  }

  const entry = componentRegistry.find((c) => c.type === selectedNode.type);
  const currentStyles = {
    ...(selectedNode.styles.base || {}),
    ...(selectedNode.styles[breakpoint] || {}),
  };

  const handleStyleChange = (key: string, value: string) => {
    onUpdateStyles(selectedNode.id, key, value);
  };

  const variantProps =
    entry?.editableProps.filter((p) => p.type === "select") || [];
  const otherProps =
    entry?.editableProps.filter((p) => p.type !== "select") || [];

  return (
    <div className="w-full border-s border-border bg-card/30 flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          {entry && <entry.icon className="h-3.5 w-3.5 text-primary" />}
          <h3 className="text-xs font-semibold">
            {entry?.label || selectedNode.type}
          </h3>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          {(
            [
              { bp: "base" as Breakpoint, icon: Monitor, label: "Desktop" },
              { bp: "md" as Breakpoint, icon: Tablet, label: "Tablet" },
              { bp: "sm" as Breakpoint, icon: Smartphone, label: "Mobile" },
            ] as const
          ).map(({ bp, icon: Icon, label }) => (
            <div
              key={bp}
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                breakpoint === bp
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="h-3 w-3" />
              {breakpoint === bp && label}
            </div>
          ))}
          <span className="text-[9px] text-muted-foreground ms-auto">
            Editing:{" "}
            {breakpoint === "base"
              ? "All screens"
              : breakpoint === "md"
                ? "≤768px"
                : "≤640px"}
          </span>
        </div>
      </div>

      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="mx-2 mt-1.5 h-7">
          <TabsTrigger value="content" className="text-[10px] gap-1 h-6">
            <TypeIcon className="h-3 w-3" />
            Content
          </TabsTrigger>
          <TabsTrigger value="design" className="text-[10px] gap-1 h-6">
            <Paintbrush className="h-3 w-3" />
            Design
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-[10px] gap-1 h-6">
            <Box className="h-3 w-3" />
            Layout
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Content Tab */}
          <TabsContent value="content" className="p-3 space-y-3 mt-0">
            {variantProps.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Variants
                </span>
                {variantProps.map((prop) => (
                  <div key={prop.key} className="space-y-1">
                    <Label className="text-[11px]">{prop.label}</Label>
                    {prop.options && prop.options.length <= 6 ? (
                      <div className="flex flex-wrap gap-1">
                        {prop.options.map((o) => (
                          <button
                            key={o.value}
                            onClick={() =>
                              onUpdateProps(selectedNode.id, {
                                [prop.key]: o.value,
                              })
                            }
                            className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-medium border transition-all",
                              (selectedNode.props[prop.key] as string) ===
                                o.value
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                            )}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Select
                        value={(selectedNode.props[prop.key] as string) || ""}
                        onValueChange={(v) =>
                          onUpdateProps(selectedNode.id, { [prop.key]: v })
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {prop.options?.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
                {otherProps.length > 0 && <Separator />}
              </div>
            )}

            {otherProps.map((prop) => (
              <div key={prop.key} className="space-y-1">
                <Label className="text-[11px]">{prop.label}</Label>
                {/* Chart data gets visual editor */}
                {prop.key === "data" &&
                selectedNode.type.endsWith("-chart") ? (
                  <ChartDataEditor
                    value={(selectedNode.props[prop.key] as string) || ""}
                    onChange={(v) =>
                      onUpdateProps(selectedNode.id, { [prop.key]: v })
                    }
                  />
                ) : prop.type === "text" ||
                  prop.type === "url" ||
                  prop.type === "color" ? (
                  <Input
                    type={prop.type === "color" ? "color" : "text"}
                    value={(selectedNode.props[prop.key] as string) || ""}
                    onChange={(e) =>
                      onUpdateProps(selectedNode.id, {
                        [prop.key]: e.target.value,
                      })
                    }
                    placeholder={prop.placeholder}
                    className="h-7 text-xs"
                  />
                ) : prop.type === "textarea" ? (
                  <Textarea
                    value={(selectedNode.props[prop.key] as string) || ""}
                    onChange={(e) =>
                      onUpdateProps(selectedNode.id, {
                        [prop.key]: e.target.value,
                      })
                    }
                    placeholder={prop.placeholder}
                    className="text-xs min-h-[56px]"
                  />
                ) : prop.type === "number" ? (
                  <Input
                    type="number"
                    value={(selectedNode.props[prop.key] as number) || 0}
                    onChange={(e) =>
                      onUpdateProps(selectedNode.id, {
                        [prop.key]: Number(e.target.value),
                      })
                    }
                    className="h-7 text-xs"
                  />
                ) : prop.type === "boolean" ? (
                  <Switch
                    checked={!!selectedNode.props[prop.key]}
                    onCheckedChange={(v) =>
                      onUpdateProps(selectedNode.id, { [prop.key]: v })
                    }
                  />
                ) : null}
              </div>
            ))}
            {(!entry?.editableProps || entry.editableProps.length === 0) && (
              <p className="text-xs text-muted-foreground">
                No editable properties.
              </p>
            )}
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="p-3 space-y-3 mt-0">
            <SpacingControl
              label="Padding"
              prefix="p"
              values={parseSpacing(currentStyles, "p")}
              onChange={(side, value) => {
                const current = parseSpacing(currentStyles, "p");
                current[side as keyof typeof current] = value;
                handleStyleChange("padding", buildSpacingClass("p", current));
              }}
            />
            <SpacingControl
              label="Margin"
              prefix="m"
              values={parseSpacing(currentStyles, "m")}
              onChange={(side, value) => {
                const current = parseSpacing(currentStyles, "m");
                current[side as keyof typeof current] = value;
                handleStyleChange("margin", buildSpacingClass("m", current));
              }}
            />

            <Separator />

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Typography
              </span>
              <StyleSelect
                label="Font Size"
                value={currentStyles.fontSize}
                options={FONT_SIZES}
                onChange={(v) => handleStyleChange("fontSize", v)}
              />
              <StyleSelect
                label="Font Weight"
                value={currentStyles.fontWeight}
                options={FONT_WEIGHTS}
                onChange={(v) => handleStyleChange("fontWeight", v)}
              />
              <StyleSelect
                label="Text Align"
                value={currentStyles.textAlign}
                options={TEXT_ALIGNS}
                onChange={(v) => handleStyleChange("textAlign", v)}
              />
              <StyleSelect
                label="Text Color"
                value={currentStyles.color}
                options={TEXT_COLORS}
                onChange={(v) => handleStyleChange("color", v)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Background & Border
              </span>
              <StyleSelect
                label="Background"
                value={currentStyles.background}
                options={BG_COLORS}
                onChange={(v) => handleStyleChange("background", v)}
              />
              <StyleSelect
                label="Border Radius"
                value={currentStyles.borderRadius}
                options={BORDER_RADIUS}
                onChange={(v) => handleStyleChange("borderRadius", v)}
              />
              <StyleSelect
                label="Border Width"
                value={currentStyles.borderWidth}
                options={BORDER_WIDTHS}
                onChange={(v) => handleStyleChange("borderWidth", v)}
              />
              <StyleSelect
                label="Border Color"
                value={currentStyles.borderColor}
                options={BORDER_COLORS}
                onChange={(v) => handleStyleChange("borderColor", v)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Effects
              </span>
              <StyleSelect
                label="Shadow"
                value={currentStyles.shadow}
                options={SHADOWS}
                onChange={(v) => handleStyleChange("shadow", v)}
              />
              <StyleSelect
                label="Opacity"
                value={currentStyles.opacity}
                options={OPACITY}
                onChange={(v) => handleStyleChange("opacity", v)}
              />
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="p-3 space-y-3 mt-0">
          {(entry?.isContainer || entry?.isComposite) && (
            <>
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick layout
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {LAYOUT_RECIPES.map((recipe) => (
                      <button
                        key={recipe.label}
                        type="button"
                        onClick={() => {
                          handleStyleChange("display", recipe.display);
                          if (recipe.flexDirection)
                            handleStyleChange(
                              "flexDirection",
                              recipe.flexDirection,
                            );
                          if (recipe.flexWrap)
                            handleStyleChange("flexWrap", recipe.flexWrap);
                          if (recipe.gap) handleStyleChange("gap", recipe.gap);
                          if (recipe.alignItems)
                            handleStyleChange("alignItems", recipe.alignItems);
                          if (recipe.gridCols)
                            handleStyleChange("gridCols", recipe.gridCols);
                        }}
                        className={cn(
                          "rounded-lg border p-2 text-start transition-colors",
                          currentStyles.display === recipe.display &&
                            (!recipe.gridCols ||
                              currentStyles.gridCols === recipe.gridCols)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/40",
                        )}
                      >
                        <div className="text-[11px] font-medium text-foreground">
                          {recipe.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {recipe.description}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Select parent container, then choose layout.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Responsive per breakpoint
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {RESPONSIVE_RECIPES.map((recipe) => (
                      <button
                        key={recipe.label}
                        type="button"
                        onClick={() => {
                          if (onUpdateStylesAtBreakpoint) {
                            Object.entries(recipe.styles).forEach(
                              ([key, value]) => {
                                onUpdateStylesAtBreakpoint(
                                  selectedNode.id,
                                  recipe.applyTo,
                                  key,
                                  value,
                                );
                              },
                            );
                          }
                        }}
                        className="rounded-lg border border-border bg-background hover:border-primary/40 p-2 text-start transition-colors"
                      >
                        <div className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                          {recipe.applyTo === "sm" ? (
                            <Smartphone className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Tablet className="h-3 w-3 text-muted-foreground" />
                          )}
                          {recipe.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {recipe.description}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    Responsive recipes apply to the correct breakpoint
                    automatically.
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Move controls for any node */}
            {onMoveNode && (
              <>
                <Separator />
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Reorder
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onMoveNode(selectedNode.id, -1)}
                      className="flex-1 h-7 rounded border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground text-[10px] font-medium transition-all"
                    >
                      ↑ Up
                    </button>
                    <button
                      onClick={() => onMoveNode(selectedNode.id, 1)}
                      className="flex-1 h-7 rounded border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground text-[10px] font-medium transition-all"
                    >
                      ↓ Down
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Dimensions
              </span>
              <div className="grid grid-cols-2 gap-2">
                <DimensionInput
                  label="Width"
                  value={currentStyles.width}
                  presets={WIDTH_PRESETS}
                  onChange={(v) => handleStyleChange("width", v)}
                />
                <DimensionInput
                  label="Height"
                  value={currentStyles.height}
                  presets={HEIGHT_PRESETS}
                  onChange={(v) => handleStyleChange("height", v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DimensionInput
                  label="Min Width"
                  value={currentStyles.minWidth}
                  presets={MIN_WIDTH_PRESETS}
                  onChange={(v) => handleStyleChange("minWidth", v)}
                />
                <DimensionInput
                  label="Max Width"
                  value={currentStyles.maxWidth}
                  presets={MAX_WIDTH_PRESETS}
                  onChange={(v) => handleStyleChange("maxWidth", v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DimensionInput
                  label="Min Height"
                  value={currentStyles.minHeight}
                  presets={MIN_HEIGHT_PRESETS}
                  onChange={(v) => handleStyleChange("minHeight", v)}
                />
                <DimensionInput
                  label="Max Height"
                  value={currentStyles.maxHeight}
                  presets={MAX_HEIGHT_PRESETS}
                  onChange={(v) => handleStyleChange("maxHeight", v)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Display
              </span>
              <StyleSelect
                label="Display"
                value={currentStyles.display}
                options={DISPLAYS}
                onChange={(v) => handleStyleChange("display", v)}
              />
              <StyleSelect
                label="Overflow"
                value={currentStyles.overflow}
                options={OVERFLOW}
                onChange={(v) => handleStyleChange("overflow", v)}
              />
              <StyleSelect
                label="Position"
                value={currentStyles.position}
                options={POSITIONS}
                onChange={(v) => handleStyleChange("position", v)}
              />
              <StyleSelect
                label="Z-Index"
                value={currentStyles.zIndex}
                options={Z_INDEX}
                onChange={(v) => handleStyleChange("zIndex", v)}
              />
            </div>

            {(entry?.isContainer || entry?.isComposite) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Flex / Grid
                  </span>
                  <StyleSelect
                    label="Direction"
                    value={currentStyles.flexDirection}
                    options={FLEX_DIRECTION}
                    onChange={(v) => handleStyleChange("flexDirection", v)}
                  />
                  <StyleSelect
                    label="Wrap"
                    value={currentStyles.flexWrap}
                    options={FLEX_WRAP}
                    onChange={(v) => handleStyleChange("flexWrap", v)}
                  />
                  <StyleSelect
                    label="Justify"
                    value={currentStyles.justifyContent}
                    options={JUSTIFY}
                    onChange={(v) => handleStyleChange("justifyContent", v)}
                  />
                  <StyleSelect
                    label="Align Items"
                    value={currentStyles.alignItems}
                    options={ALIGN_ITEMS}
                    onChange={(v) => handleStyleChange("alignItems", v)}
                  />
                  <StyleSelect
                    label="Gap"
                    value={currentStyles.gap}
                    options={GAPS}
                    onChange={(v) => handleStyleChange("gap", v)}
                  />
                  <StyleSelect
                    label="Grid Columns"
                    value={currentStyles.gridCols}
                    options={GRID_COLS}
                    onChange={(v) => handleStyleChange("gridCols", v)}
                  />

                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      Quick Columns
                    </Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            handleStyleChange("display", "grid");
                            handleStyleChange("gridCols", `grid-cols-${n}`);
                          }}
                          className={cn(
                            "flex-1 h-7 rounded border text-[10px] font-medium transition-all",
                            currentStyles.gridCols === `grid-cols-${n}`
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/40",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

