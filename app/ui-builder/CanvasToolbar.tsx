"use client";

import { useRef } from "react";
import { Monitor, Tablet, Smartphone, Undo2, Redo2, Code2, Trash2, Layers, Grid3X3, ZoomIn, ZoomOut, Download, Upload, Languages, Pointer } from "lucide-react";

import { Breakpoint } from "@/ui-builder/data/uiBuilderRegistry";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { TemplateGallery } from "./TemplateGallery";
import { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";

const BREAKPOINTS: { value: Breakpoint; icon: React.ElementType; label: string }[] = [
  { value: "base", icon: Monitor, label: "Desktop" },
  { value: "md", icon: Tablet, label: "Tablet" },
  { value: "sm", icon: Smartphone, label: "Mobile" },
];

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

interface CanvasToolbarProps {
  breakpoint: Breakpoint;
  showCode: boolean;
  showLayers: boolean;
  showGrid: boolean;
  interactivePreview: boolean;
  zoom: number;
  direction: "ltr" | "rtl";
  canUndo: boolean;
  canRedo: boolean;
  onBreakpoint: (bp: Breakpoint) => void;
  onToggleCode: () => void;
  onToggleLayers: () => void;
  onToggleGrid: () => void;
  onTogglePreview: () => void;
  onZoom: (z: number) => void;
  onDirection: (d: "ltr" | "rtl") => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onLoadTemplate: (nodes: BuilderNode[]) => void;
  onExportJSON: () => void;
  onImportJSON: (json: string) => void;
}

export function CanvasToolbar({
  breakpoint, showCode, showLayers, showGrid, interactivePreview, zoom, direction,
  canUndo, canRedo,
  onBreakpoint, onToggleCode, onToggleLayers, onToggleGrid,
  onTogglePreview,
  onZoom, onDirection, onUndo, onRedo, onClear,
  onLoadTemplate, onExportJSON, onImportJSON,
}: CanvasToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onImportJSON(ev.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-card/50 flex-wrap">
      {/* Breakpoints */}
      <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
        {BREAKPOINTS.map(bp => (
          <Tooltip key={bp.value}>
            <TooltipTrigger asChild>
              <Button
                variant={breakpoint === bp.value ? "default" : "ghost"}
                size="icon"
                className={cn("h-7 w-7", breakpoint === bp.value && "shadow-sm")}
                onClick={() => onBreakpoint(bp.value)}
              >
                <bp.icon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{bp.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onZoom(Math.max(50, zoom - 25))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>
        <Select value={String(zoom)} onValueChange={(v) => onZoom(Number(v))}>
          <SelectTrigger className="h-7 w-16 text-xs border-0 bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ZOOM_LEVELS.map(z => (
              <SelectItem key={z} value={String(z)} className="text-xs">{z}%</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onZoom(Math.min(200, zoom + 25))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Undo/Redo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Grid toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={showGrid ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={onToggleGrid}>
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle Grid</TooltipContent>
      </Tooltip>

      {/* Layer panel toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={showLayers ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={onToggleLayers}>
            <Layers className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle Layers (Ctrl+Shift+L)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={interactivePreview ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={onTogglePreview}>
            <Pointer className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Interactive preview for hover and click states</TooltipContent>
      </Tooltip>

      {/* RTL/LTR toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={direction === "rtl" ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => onDirection(direction === "ltr" ? "rtl" : "ltr")}
          >
            <Languages className="h-3.5 w-3.5" />
            {direction.toUpperCase()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle LTR/RTL Direction</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Templates */}
      <TemplateGallery onLoadTemplate={onLoadTemplate} />

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Import / Export */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onExportJSON}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export JSON</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Import JSON</TooltipContent>
      </Tooltip>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

      <div className="flex-1" />

      {/* Code toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={showCode ? "default" : "ghost"} size="sm" className="h-7 gap-1.5 text-xs" onClick={onToggleCode}>
            <Code2 className="h-3.5 w-3.5" />
            Code
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle code (Ctrl+Shift+C)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Clear canvas</TooltipContent>
      </Tooltip>
    </div>
  );
}
