import { useState } from "react";
import { Plus, Trash2, GripVertical, Copy, Type, HelpCircle, X, Eraser } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FormConfig, FormSection } from "@/forms/react-hook-form";
import { fieldTypes } from "@/form-builder/config/constants";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface FormCanvasProps {
  formConfig: FormConfig;
  onAddSection: () => void;
  selectedSectionIndex: number;
  onClearSectionFields: () => void;
  selectedFieldIndex: number | null;
  onRemoveField: (index: number) => void;
  currentSection: FormSection | undefined;
  onSelectSection: (index: number) => void;
  onDeleteSection: (index: number) => void;
  onDuplicateField: (index: number) => void;
  onSelectField: (index: number | null) => void;
  onMoveField: (from: number, to: number) => void;
  onUpdateSection: (updates: Partial<FormSection>) => void;
  onMoveFieldToSection?: (fieldIndex: number, targetSectionIndex: number) => void;
}

export function FormCanvas({
  formConfig, currentSection, selectedSectionIndex, selectedFieldIndex,
  onSelectSection, onSelectField, onAddSection, onUpdateSection,
  onMoveField, onDuplicateField, onRemoveField, onMoveFieldToSection,
  onClearSectionFields, onDeleteSection,
}: FormCanvasProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTargetSection, setDropTargetSection] = useState<number | null>(null);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Form Canvas</CardTitle>
            <CardDescription className="text-xs">
              {currentSection?.fields.length || 0} fields
              {formConfig.sections.length > 1 && " · Drag onto section badge to move"}
            </CardDescription>
          </div>
          <div className="flex gap-1.5">
            {formConfig.sections.map((section, idx) => (
              <div key={section.id} className="relative group/section">
                <Badge
                  variant={selectedSectionIndex === idx ? "default" : dropTargetSection === idx ? "secondary" : "outline"}
                  className={cn(
                    "cursor-pointer h-6 px-2 text-xs transition-all",
                    dropTargetSection === idx && idx !== selectedSectionIndex && "ring-2 ring-primary scale-110"
                  )}
                  onClick={() => { onSelectSection(idx); onSelectField(null); }}
                  onDragOver={(e) => {
                    if (dragIndex !== null && idx !== selectedSectionIndex) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDropTargetSection(idx);
                    }
                  }}
                  onDragLeave={() => setDropTargetSection(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDropTargetSection(null);
                    if (dragIndex !== null && idx !== selectedSectionIndex && onMoveFieldToSection) {
                      onMoveFieldToSection(dragIndex, idx);
                    }
                    setDragIndex(null);
                  }}
                >
                  {idx + 1}
                </Badge>
                {formConfig.sections.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSection(idx); }}
                    className="cursor-pointer absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity"
                    title={`Delete section ${idx + 1}`}
                  >
                    <X className="h-2 w-2" />
                  </button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddSection}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[520px]">
          <div className="space-y-2 p-2">
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <Input value={currentSection?.title || ""} onChange={(e) => onUpdateSection({ title: e.target.value })} placeholder="Section title" className="h-8 text-sm font-medium" />
              <Input value={currentSection?.description || ""} onChange={(e) => onUpdateSection({ description: e.target.value })} placeholder="Description (optional)" className="h-7 text-xs" />
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Columns:</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[200px]"><p className="text-xs">How many columns fields are arranged in on desktop.</p></TooltipContent>
                </Tooltip>
                <Select value={String(currentSection?.columns || 1)} onValueChange={(v) => onUpdateSection({ columns: parseInt(v) as 1 | 2 | 3 | 4 })}>
                  <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
                {(currentSection?.fields.length ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive gap-1" onClick={onClearSectionFields}>
                        <Eraser className="h-3 w-3" />Clear All
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove all fields from this section</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {currentSection?.fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No fields yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click a field type from the left panel to add it</p>
              </div>
            ) : (
              currentSection?.fields.map((field, index) => {
                const fieldType = fieldTypes.find(f => f.type === field.type);
                const Icon = fieldType?.icon || Type;
                return (
                  <div
                    key={`${currentSection?.id ?? "section"}-${index}-${field.name}`}
                    draggable
                    onDragStart={(e) => { setDragIndex(index); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(e) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== index) onMoveField(dragIndex, index); setDragIndex(null); setDropTargetSection(null); }}
                    onDragEnd={() => { setDragIndex(null); setDropTargetSection(null); }}
                    onClick={() => onSelectField(index)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all",
                      selectedFieldIndex === index ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground",
                      dragIndex === index && "opacity-50"
                    )}
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab shrink-0" />
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{field.label || field.name}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{field.type}</span>
                        {field.condition && <Badge variant="outline" className="text-[9px] h-3.5 px-1">Conditional</Badge>}
                        {field.watchConfig && <Badge variant="outline" className="text-[9px] h-3.5 px-1">Watch</Badge>}
                        {field.dependentOptions && <Badge variant="outline" className="text-[9px] h-3.5 px-1 border-primary/50 text-primary">Dependent</Badge>}
                      </div>
                    </div>
                    {field.required && <Badge variant="secondary" className="text-[10px] h-5 shrink-0">Required</Badge>}
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => { e.stopPropagation(); onDuplicateField(index); }}><Copy className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); onRemoveField(index); }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
