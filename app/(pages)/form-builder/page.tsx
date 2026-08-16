"use client";

import { useState, useCallback, useMemo } from "react";
import { TextCursorInput, Eye, Code2, BookOpen, Sparkles, HelpCircle } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import type { FormConfig, FormFieldConfig } from "@/forms/react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BuilderHeader,
  useBuilderHistory,
  useTemplateOptions,
  BuilderTemplatePicker,
} from "@/components/shared/builder-header";
import { useBuilderWorkspace } from "@/components/shared/builder-workspace";
import {
  BuilderDiffPanel,
  useBuilderDiff,
  resetDiffEntry,
  resetAllDiffEntries,
  type BuilderDiffEntry,
} from "@/components/shared/builder-diff";

// Form Builder Components
import { isFormDraft, type FormDraft } from "@/form-builder/utils/formDraft";
import { formTemplates } from "@/form-builder/data/formBuilderTemplates";
import { createField, initialConfig } from "@/form-builder/config/constants";

import { ExportTab } from "@/form-builder/ExportTab";
import { FormCanvas } from "@/form-builder/FormCanvas";
import { PreviewTab } from "@/form-builder/PreviewTab";
import { FieldPalette } from "@/form-builder/FieldPalette";
import { PropertiesPanel } from "@/form-builder/PropertiesPanel";
import { FormBuilderGuide } from "@/form-builder/FormBuilderGuide";
import { JsonImportDialog } from "@/form-builder/JsonImportDialog";
import { LayoutPicker, FormLayoutType, createLayoutConfig } from "@/form-builder/LayoutPicker";

export default function FormBuilder() {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [currentLayout, setCurrentLayout] = useState<FormLayoutType>("single");
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"builder" | "preview" | "code" | "guide">("builder");
  const { state: formConfig, set: setFormConfig, reset: resetHistory, history } = useBuilderHistory<FormConfig>(initialConfig);
  const templateOptions = useTemplateOptions(formTemplates);

  const activeTemplate = selectedTemplateKey ? formTemplates[selectedTemplateKey] : undefined;
  const diff = useBuilderDiff({
    current: formConfig,
    template: activeTemplate,
    templateName: activeTemplate?.title,
    // Sections hold every field. Walking them would drown the form-level
    // settings this panel exists to surface, and "reset section 2's third
    // field" is the Builder tab's job, not a diff row's.
    options: { atomic: ["sections"] },
  });

  const handleResetSetting = useCallback((entry: BuilderDiffEntry) => {
    setFormConfig((prev) => resetDiffEntry(prev, entry));
  }, [setFormConfig]);

  const handleResetAllSettings = useCallback((entries: BuilderDiffEntry[]) => {
    setFormConfig((prev) => resetAllDiffEntries(prev, entries));
    toast({ title: "Reset to template", description: `${entries.length} settings restored.` });
  }, [setFormConfig]);

  // Names a new saved build after the template it started from, so a
  // workspace reads "Sprint Board" rather than "Untitled 3".
  const workspaceLabel = selectedTemplateKey
    ? formTemplates[selectedTemplateKey]?.title
    : undefined;

  const workspace = useBuilderWorkspace<FormDraft>({
    id: "form",
    deps: [formConfig, currentLayout, selectedTemplateKey],
    snapshot: () => ({ config: formConfig, layout: currentLayout, templateKey: selectedTemplateKey }),
    label: workspaceLabel,
    validate: isFormDraft,
    onRestore: (saved) => {
      setSelectedTemplateKey(saved.templateKey);
      setCurrentLayout(saved.layout);
      resetHistory(saved.config);
      // The restored form may have fewer sections than the one on screen, so
      // reset both cursors rather than leaving them pointing past the end.
      setSelectedFieldIndex(null);
      setSelectedSectionIndex(0);
      toast({ title: "Draft restored", description: "Picked up where you left off." });
    },
  });

  const currentSection = formConfig.sections[selectedSectionIndex];
  const selectedField = selectedFieldIndex !== null ? currentSection?.fields[selectedFieldIndex] : null;
  const allFieldNames = useMemo(() => {
    const flat = formConfig.sections.flatMap((s) => s.fields);
    const base = flat.map((f) => ({ label: f.label || f.name, value: f.name }));
    const fromExtraKeys = flat.flatMap((f) => {
      const api = "apiConfig" in f ? f.apiConfig : undefined;
      const keys = api?.responseMapping?.extraKeys;
      if (!keys?.length) return [];
      return keys.map((key: string) => ({
        label: `${f.label || f.name} · (${f.name}__${key})`,
        value: `${f.name}__${key}`,
      }));
    });
    return [...base, ...fromExtraKeys];
  }, [formConfig]);

  // ─── Field CRUD ───
  const addField = useCallback((type: string) => {
    setFormConfig(prev => {
      const newConfig = { ...prev };
      const section = newConfig.sections[selectedSectionIndex];
      if (section) {
        const newField = createField(type, section.fields.length);
        section.fields = [...section.fields, newField];
      }
      return { ...newConfig };
    });
    toast({ title: "Field added", description: `Added ${type} field` });
  }, [selectedSectionIndex, setFormConfig]);

  const removeField = useCallback((index: number) => {
    setFormConfig(prev => {
      const newConfig = { ...prev };
      const section = newConfig.sections[selectedSectionIndex];
      if (section) section.fields = section.fields.filter((_, i) => i !== index);
      return { ...newConfig };
    });
    setSelectedFieldIndex(null);
  }, [selectedSectionIndex, setFormConfig]);

  const updateField = useCallback((index: number, updates: Partial<FormFieldConfig>) => {
    setFormConfig(prev => {
      const newConfig = { ...prev };
      const section = newConfig.sections[selectedSectionIndex];
      if (section && section.fields[index]) {
        section.fields[index] = { ...section.fields[index], ...updates } as FormFieldConfig;
      }
      return { ...newConfig };
    });
  }, [selectedSectionIndex, setFormConfig]);

  const updateFormConfig = useCallback((updates: Partial<FormConfig>) => {
    setFormConfig(prev => ({ ...prev, ...updates }));
  }, [setFormConfig]);

  const updateSection = useCallback((updates: Partial<typeof currentSection>) => {
    setFormConfig(prev => {
      const newConfig = { ...prev };
      if (newConfig.sections[selectedSectionIndex]) {
        newConfig.sections[selectedSectionIndex] = { ...newConfig.sections[selectedSectionIndex], ...updates };
      }
      return { ...newConfig };
    });
  }, [selectedSectionIndex, setFormConfig]);

  const addSection = useCallback(() => {
    setFormConfig(prev => ({
      ...prev,
      sections: [...prev.sections, {
        id: `section-${Date.now()}`,
        title: `Section ${prev.sections.length + 1}`,
        description: "",
        columns: 1,
        fields: [],
      }],
    }));
    setSelectedSectionIndex(formConfig.sections.length);
  }, [formConfig.sections.length, setFormConfig]);

  const clearSectionFields = useCallback(() => {
    setFormConfig(prev => {
      const newConfig = { ...prev, sections: [...prev.sections] };
      if (newConfig.sections[selectedSectionIndex]) {
        newConfig.sections[selectedSectionIndex] = { ...newConfig.sections[selectedSectionIndex], fields: [] };
      }
      return newConfig;
    });
    setSelectedFieldIndex(null);
    toast({ title: "Section cleared", description: "All fields removed from this section" });
  }, [selectedSectionIndex, setFormConfig]);

  const deleteSection = useCallback((index: number) => {
    const oldLen = formConfig.sections.length;
    if (oldLen <= 1) return;
    setFormConfig(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
    setSelectedSectionIndex(prevSel => {
      if (index < prevSel) return prevSel - 1;
      if (index === prevSel) return Math.max(0, Math.min(prevSel, oldLen - 2));
      return prevSel;
    });
    setSelectedFieldIndex(null);
    toast({ title: "Section deleted", description: `Section ${index + 1} removed` });
  }, [formConfig.sections, setFormConfig]);

  const duplicateField = useCallback((index: number) => {
    setFormConfig(prev => {
      const newConfig = { ...prev };
      const section = { ...newConfig.sections[selectedSectionIndex] };
      if (section && section.fields[index]) {
        const original = section.fields[index];
        const duplicate = { ...original, name: `${original.name}_copy_${Date.now()}`, label: `${original.label || ''} (Copy)` } as FormFieldConfig;
        section.fields = [...section.fields.slice(0, index + 1), duplicate, ...section.fields.slice(index + 1)];
        newConfig.sections = [...newConfig.sections];
        newConfig.sections[selectedSectionIndex] = section;
      }
      return newConfig;
    });
  }, [selectedSectionIndex, setFormConfig]);

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setFormConfig(prev => {
      const newConfig = { ...prev };
      const section = { ...newConfig.sections[selectedSectionIndex] };
      if (section) {
        const fields = [...section.fields];
        const [moved] = fields.splice(fromIndex, 1);
        fields.splice(toIndex, 0, moved);
        section.fields = fields;
        newConfig.sections = [...newConfig.sections];
        newConfig.sections[selectedSectionIndex] = section;
      }
      return newConfig;
    });
  }, [selectedSectionIndex, setFormConfig]);

  const moveFieldToSection = useCallback((fieldIndex: number, targetSectionIndex: number) => {
    setFormConfig(prev => {
      const newConfig = { ...prev, sections: prev.sections.map(s => ({ ...s, fields: [...s.fields] })) };
      const [movedField] = newConfig.sections[selectedSectionIndex].fields.splice(fieldIndex, 1);
      newConfig.sections[targetSectionIndex].fields.push(movedField);
      return newConfig;
    });
    setSelectedSectionIndex(targetSectionIndex);
    setSelectedFieldIndex(null);
    toast({ title: "Field moved", description: `Moved to section ${targetSectionIndex + 1}` });
  }, [selectedSectionIndex, setFormConfig]);

  const loadTemplate = useCallback((templateKey: string) => {
    const template = formTemplates[templateKey];
    if (template) {
      setSelectedTemplateKey(templateKey);
      resetHistory(structuredClone(template));
      setSelectedFieldIndex(null);
      setSelectedSectionIndex(0);
      toast({ title: "Template loaded", description: `Loaded "${template.title}"` });
    }
  }, [resetHistory]);

  const handleSubmit = (data: Record<string, unknown>) => {
    console.log("Form submitted:", data);
    setSubmittedData(data);
    toast({ title: "Form Submitted", description: "Submitted data is shown below the form" });
  };

  const handleLayoutChange = useCallback((layout: FormLayoutType) => {
    const newConfig = createLayoutConfig(layout);
    resetHistory(newConfig);
    setSelectedTemplateKey(undefined);
    setCurrentLayout(layout);
    setSelectedFieldIndex(null);
    setSelectedSectionIndex(0);
    toast({ title: "Layout changed", description: `Switched to ${layout} layout` });
  }, [resetHistory]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <PageBreadcrumb items={[{ label: "Form Builder" }]} />

          <BuilderHeader
            icon={Sparkles}
            title="Form Builder"
            description="Build forms visually, export production-ready code"
            templatePicker={
              <BuilderTemplatePicker
                options={templateOptions}
                value={selectedTemplateKey}
                onSelect={loadTemplate}
              />
            }
            jsonActions={
              <JsonImportDialog
                onImport={(config) => {
                  setSelectedTemplateKey(undefined);
                  resetHistory(config);
                  setSelectedFieldIndex(null);
                  setSelectedSectionIndex(0);
                }}
                currentConfig={formConfig}
              />
            }
            history={history}
            workspace={workspace.header}
            workspaceName={workspaceLabel}
          />

          {/* Layout Picker */}
          <div className="mb-4">
            <LayoutPicker currentLayout={currentLayout} onSelectLayout={handleLayoutChange} />
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "builder" | "preview" | "code" | "guide")} className="space-y-4">
            <TabsList className="h-10">
              <TabsTrigger value="builder" className="gap-2 px-4 cursor-pointer"><TextCursorInput className="h-4 w-4" />Builder</TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 px-4 cursor-pointer"><Eye className="h-4 w-4" />Preview</TabsTrigger>
              <TabsTrigger value="code" className="gap-2 px-4 cursor-pointer"><Code2 className="h-4 w-4" />Export Code</TabsTrigger>
              <TabsTrigger value="guide" className="gap-2 px-4 cursor-pointer"><BookOpen className="h-4 w-4" />Guide</TabsTrigger>
            </TabsList>

            {/* BUILDER TAB */}
            <TabsContent value="builder" className="mt-0">
              <div className="grid lg:grid-cols-[260px_1fr_280px] gap-4">
                <FieldPalette onAddField={addField} />
                <FormCanvas
                  formConfig={formConfig}
                  currentSection={currentSection}
                  selectedSectionIndex={selectedSectionIndex}
                  selectedFieldIndex={selectedFieldIndex}
                  onSelectSection={setSelectedSectionIndex}
                  onSelectField={setSelectedFieldIndex}
                  onAddSection={addSection}
                  onUpdateSection={updateSection}
                  onMoveField={moveField}
                  onDuplicateField={duplicateField}
                  onRemoveField={removeField}
                  onMoveFieldToSection={moveFieldToSection}
                  onClearSectionFields={clearSectionFields}
                  onDeleteSection={deleteSection}
                />
                <PropertiesPanel
                  selectedField={selectedField}
                  selectedFieldIndex={selectedFieldIndex}
                  allFieldNames={allFieldNames}
                  updateField={updateField}
                />
              </div>

              {/* Form Settings Bar */}
              <Card className="mt-4 border-border">
                <CardContent className="py-3 px-4">
                  <div className="grid md:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Form Title</Label>
                      <Input value={formConfig.title || ""} onChange={(e) => updateFormConfig({ title: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input value={formConfig.description || ""} onChange={(e) => updateFormConfig({ description: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Submit Button</Label>
                      <Input value={formConfig.submitLabel || ""} onChange={(e) => updateFormConfig({ submitLabel: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="flex items-center gap-2 h-8">
                      <Switch id="showReset" checked={formConfig.showReset || false} onCheckedChange={(checked) => updateFormConfig({ showReset: checked })} />
                      <Label htmlFor="showReset" className="text-xs">Show Reset</Label>
                      <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]"><p className="text-xs">Adds a &quot;Reset&quot; button next to Submit.</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PREVIEW TAB */}
            <TabsContent value="preview" className="mt-0">
              <div className="space-y-4">
                <PreviewTab
                  formConfig={formConfig}
                  onSubmit={handleSubmit}
                  submittedData={submittedData}
                  onClearSubmittedData={() => setSubmittedData(null)}
                />
                <BuilderDiffPanel
                  diff={diff}
                  onReset={handleResetSetting}
                  onResetAll={handleResetAllSettings}
                />
              </div>
            </TabsContent>

            {/* CODE EXPORT TAB */}
            <TabsContent value="code" className="mt-0">
              <ExportTab formConfig={formConfig} />
            </TabsContent>

            {/* GUIDE TAB */}
            <TabsContent value="guide" className="mt-0">
              <FormBuilderGuide />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
