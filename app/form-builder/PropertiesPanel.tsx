import { useCallback } from "react";
import { Plus, Trash2, TextCursorInput, HelpCircle, Layers, GitBranch, Globe, Server, Eye, Space } from "lucide-react";

import type {
  FormFieldConfig,
  AsyncApiConfig,
  FieldOption,
  OptionFieldConfig,
  PreviewFieldConfig,
  EmptyFieldConfig,
  PreviewCalculationRule,
  DateFieldConfig,
  WatchTransform,
} from "@/forms/react-hook-form";

type ConditionOperator = NonNullable<NonNullable<FormFieldConfig["condition"]>["operator"]>;
type PreviewVariant = NonNullable<PreviewFieldConfig["variant"]>;
type FieldWithApi = FormFieldConfig & { apiConfig?: AsyncApiConfig };

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { DatePickerInput } from "@/components/ui/datePickerInput";
import { JsonObjectInput } from "./JsonObjectInput";

interface PropertiesPanelProps {
  selectedField: FormFieldConfig | null;
  selectedFieldIndex: number | null;
  allFieldNames: { label: string; value: string }[];
  updateField: (index: number, updates: Partial<FormFieldConfig>) => void;
}

/** Types that are display-only layout fields */
const isLayoutType = (type: string) => type === 'empty' || type === 'preview';

function hasOptionsField(f: FormFieldConfig): f is OptionFieldConfig {
  return "options" in f && Array.isArray(f.options);
}

export function PropertiesPanel({ selectedField, selectedFieldIndex, allFieldNames, updateField }: PropertiesPanelProps) {
  const addOption = useCallback(() => {
    if (selectedFieldIndex === null || !selectedField || !hasOptionsField(selectedField)) return;
    const opts = selectedField.options;
    const newOption = { label: `Option ${opts.length + 1}`, value: `option${opts.length + 1}` };
    updateField(selectedFieldIndex, { options: [...opts, newOption] });
  }, [selectedFieldIndex, selectedField, updateField]);

  const removeOption = useCallback((optionIndex: number) => {
    if (selectedFieldIndex === null || !selectedField || !hasOptionsField(selectedField)) return;
    updateField(selectedFieldIndex, {
      options: selectedField.options.filter((_, i: number) => i !== optionIndex),
    });
  }, [selectedFieldIndex, selectedField, updateField]);

  // ─── Preview field properties ───
  const renderPreviewProperties = () => {
    if (!selectedField || selectedFieldIndex === null || selectedField.type !== 'preview') return null;
    const f: PreviewFieldConfig = selectedField;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-primary" />
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Preview Settings
          </Label>
        </div>

        {/* Watch Fields */}
        <div className="space-y-1">
          <Label className="text-xs">Watch Fields</Label>
          <Input
            value={(f.watchFields || []).join(', ')}
            onChange={(e) => {
              const fields = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
              updateField(selectedFieldIndex, { watchFields: fields });
            }}
            className="h-8 text-sm font-mono"
            placeholder="field1, field2"
          />
          <p className="text-[10px] text-muted-foreground">Comma-separated field names to watch</p>
          {allFieldNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {allFieldNames
                .filter(fn => fn.value !== selectedField.name && !['empty', 'preview'].includes(fn.value))
                .slice(0, 8)
                .map(fn => (
                  <Badge
                    key={fn.value}
                    variant="outline"
                    className="text-[9px] cursor-pointer hover:bg-accent"
                    onClick={() => {
                      const current = f.watchFields || [];
                      if (!current.includes(fn.value)) {
                        updateField(selectedFieldIndex, { watchFields: [...current, fn.value] });
                      }
                    }}
                  >
                    + {fn.label || fn.value}
                  </Badge>
                ))}
            </div>
          )}
        </div>

        {/* Calculation Rule */}
        <div className="space-y-1">
          <Label className="text-xs">Calculation Rule</Label>
          <Select
            value={f.calculation?.rule || 'concat'}
            onValueChange={(v) => updateField(selectedFieldIndex, {
              calculation: {
                rule: v as PreviewCalculationRule,
                customExpression: f.calculation?.customExpression,
              },
            })}
          >
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="concat">Concatenate (text join)</SelectItem>
              <SelectItem value="sum">Sum</SelectItem>
              <SelectItem value="subtract">Subtract</SelectItem>
              <SelectItem value="multiply">Multiply</SelectItem>
              <SelectItem value="divide">Divide</SelectItem>
              <SelectItem value="average">Average</SelectItem>
              <SelectItem value="min">Min</SelectItem>
              <SelectItem value="max">Max</SelectItem>
              <SelectItem value="custom">Custom Expression</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Expression */}
        {f.calculation?.rule === 'custom' && (
          <div className="space-y-1">
            <Label className="text-xs">Custom Expression</Label>
            <Input
              value={f.calculation?.customExpression || ''}
              onChange={(e) => updateField(selectedFieldIndex, {
                calculation: {
                  rule: f.calculation?.rule ?? "custom",
                  customExpression: e.target.value,
                },
              })}
              className="h-8 text-sm font-mono"
              placeholder="{price} * {quantity} * (1 + {tax} / 100)"
            />
            <p className="text-[10px] text-muted-foreground">Use {'{fieldName}'} for field values. Supports +, -, *, /, ()</p>
          </div>
        )}

        {/* Format Template */}
        <div className="space-y-1">
          <Label className="text-xs">Format Template</Label>
          <Input
            value={f.format || ''}
            onChange={(e) => updateField(selectedFieldIndex, { format: e.target.value || undefined })}
            className="h-8 text-sm font-mono"
            placeholder="${value} or {qty}x {item}"
          />
          <p className="text-[10px] text-muted-foreground">{'{value}'} = calculated result. {'{fieldName}'} = raw field value</p>
        </div>

        {/* Decimals */}
        <div className="space-y-1">
          <Label className="text-xs">Decimal Places</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={f.decimals ?? ''}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              updateField(selectedFieldIndex, { decimals: !isNaN(v) && v >= 0 ? v : undefined });
            }}
            className="h-8 text-sm"
            placeholder="Auto"
          />
        </div>

        {/* Prefix / Suffix */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="space-y-1">
            <Label className="text-xs">Prefix</Label>
            <Input
              value={f.prefix || ''}
              onChange={(e) => updateField(selectedFieldIndex, { prefix: e.target.value })}
              className="h-8 text-sm"
              placeholder="$"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Suffix</Label>
            <Input
              value={f.suffix || ''}
              onChange={(e) => updateField(selectedFieldIndex, { suffix: e.target.value })}
              className="h-8 text-sm"
              placeholder="USD"
            />
          </div>
        </div>

        {/* Empty Text */}
        <div className="space-y-1">
          <Label className="text-xs">Empty Text</Label>
          <Input
            value={f.emptyText || ''}
            onChange={(e) => updateField(selectedFieldIndex, { emptyText: e.target.value })}
            className="h-8 text-sm"
            placeholder="—"
          />
          <p className="text-[10px] text-muted-foreground">Shown when all watched fields are empty</p>
        </div>

        {/* Variant */}
        <div className="space-y-1">
          <Label className="text-xs">Display Variant</Label>
          <Select
            value={f.variant || 'default'}
            onValueChange={(v) => updateField(selectedFieldIndex, { variant: v as PreviewVariant })}
          >
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (bordered box)</SelectItem>
              <SelectItem value="card">Card (elevated)</SelectItem>
              <SelectItem value="inline">Inline (minimal)</SelectItem>
              <SelectItem value="highlight">Highlight (primary accent)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // ─── Empty (Spacer) properties ───
  const renderEmptyProperties = () => {
    if (!selectedField || selectedFieldIndex === null || selectedField.type !== 'empty') return null;
    const f: EmptyFieldConfig = selectedField;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Space className="h-3.5 w-3.5 text-primary" />
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Spacer Settings
          </Label>
        </div>
        <p className="text-[10px] text-muted-foreground">
          An invisible element that occupies grid space. Useful for alignment in multi-column layouts.
        </p>
        <div className="space-y-1">
          <Label className="text-xs">Height</Label>
          <Input
            value={f.height || ''}
            onChange={(e) => updateField(selectedFieldIndex, { height: e.target.value })}
            className="h-8 text-sm"
            placeholder="auto"
          />
          <p className="text-[10px] text-muted-foreground">CSS value e.g. &quot;40px&quot;, &quot;2rem&quot;, &quot;auto&quot;</p>
        </div>
      </div>
    );
  };

  const renderFieldSpecificProperties = () => {
    if (!selectedField || selectedFieldIndex === null) return null;
    switch (selectedField.type) {
      case "text": case "email": case "password": case "tel": case "url":
        return (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Min Length</Label>
              <Input type="number" min={0} value={selectedField.minLength || ""} onChange={(e) => { const v = parseInt(e.target.value); updateField(selectedFieldIndex, { minLength: !isNaN(v) && v >= 0 ? v : undefined }); }} className="h-8 text-sm" placeholder="No minimum" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Length</Label>
              <Input type="number" min={0} value={selectedField.maxLength || ""} onChange={(e) => { const v = parseInt(e.target.value); updateField(selectedFieldIndex, { maxLength: !isNaN(v) && v >= 0 ? v : undefined }); }} className="h-8 text-sm" placeholder="No maximum" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pattern (Regex)</Label>
              <Input value={selectedField.pattern || ""} onChange={(e) => updateField(selectedFieldIndex, { pattern: e.target.value })} className="h-8 text-sm font-mono" placeholder="e.g. [A-Za-z]+" />
            </div>
          </>
        );
      case "number":
        return (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Minimum Value</Label>
              <Input type="number" value={selectedField.min ?? ""} onChange={(e) => updateField(selectedFieldIndex, { min: e.target.value ? parseFloat(e.target.value) : undefined })} className="h-8 text-sm" placeholder="No minimum" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Maximum Value</Label>
              <Input type="number" value={selectedField.max ?? ""} onChange={(e) => updateField(selectedFieldIndex, { max: e.target.value ? parseFloat(e.target.value) : undefined })} className="h-8 text-sm" placeholder="No maximum" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Step</Label>
              <Input type="number" min={0} value={selectedField.step ?? ""} onChange={(e) => updateField(selectedFieldIndex, { step: e.target.value ? parseFloat(e.target.value) : undefined })} className="h-8 text-sm" placeholder="Default (1)" />
              <p className="text-[10px] text-muted-foreground">Increment/decrement interval</p>
            </div>
          </>
        );
      case "textarea":
        return (
          <div className="space-y-1">
            <Label className="text-xs">Rows</Label>
            <Input type="number" value={selectedField.rows || 4} onChange={(e) => { const v = parseInt(e.target.value); updateField(selectedFieldIndex, { rows: !isNaN(v) && v >= 2 ? Math.min(v, 20) : 4 }); }} className="h-8 text-sm" min={2} max={20} />
          </div>
        );
      case "file":
        return (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Accept (file types)</Label>
              <Input value={selectedField.accept || ""} onChange={(e) => updateField(selectedFieldIndex, { accept: e.target.value })} className="h-8 text-sm font-mono" placeholder=".pdf,.doc,.jpg" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Allow Multiple Files</Label>
              <Switch checked={selectedField.multiple || false} onCheckedChange={(checked) => updateField(selectedFieldIndex, { multiple: checked })} />
            </div>
          </>
        );
      case "radio": case "checkboxgroup":
        return (
          <div className="space-y-1">
            <Label className="text-xs">Orientation</Label>
            <Select value={selectedField.orientation || "vertical"} onValueChange={(v) => updateField(selectedFieldIndex, { orientation: v as "horizontal" | "vertical" })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-1">
            <Label className="text-xs">Checkbox Label</Label>
            <Input value={selectedField.checkboxLabel || ""} onChange={(e) => updateField(selectedFieldIndex, { checkboxLabel: e.target.value })} className="h-8 text-sm" />
          </div>
        );
      case "switch":
        return (
          <div className="space-y-1">
            <Label className="text-xs">Switch Label</Label>
            <Input value={selectedField.switchLabel || ""} onChange={(e) => updateField(selectedFieldIndex, { switchLabel: e.target.value })} className="h-8 text-sm" />
          </div>
        );
      case "combobox": case "asynccombobox": case "infinitecombobox":
        return (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Search Placeholder</Label>
              <Input value={selectedField.searchPlaceholder || ""} onChange={(e) => updateField(selectedFieldIndex, { searchPlaceholder: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Empty Message</Label>
              <Input value={selectedField.emptyMessage || ""} onChange={(e) => updateField(selectedFieldIndex, { emptyMessage: e.target.value })} className="h-8 text-sm" />
            </div>
          </>
        );
      case "multiselect": case "multicombobox":
      case "asyncmultiselect":
      case "infinitemultiselect": case "infinitemulticombobox":
      case "asyncmulticombobox":
        return (
          <div className="space-y-1">
            <Label className="text-xs">Max Items</Label>
            <Input type="number" min={0} value={selectedField.maxItems || ""} onChange={(e) => { const v = parseInt(e.target.value); updateField(selectedFieldIndex, { maxItems: !isNaN(v) && v >= 0 ? v : undefined }); }} className="h-8 text-sm" placeholder="No limit" />
          </div>
        );
      case "date": {
        const df: DateFieldConfig = selectedField;
        return (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Date Settings
              </Label>
            </div>

            {/* Show Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs">Show Time Picker</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">Display hour/minute picker alongside the calendar.</p></TooltipContent>
                </Tooltip>
              </div>
              <Switch
                checked={df.showTime || false}
                onCheckedChange={(checked) => updateField(selectedFieldIndex, { showTime: checked })}
              />
            </div>

            {/* Time Format — only when showTime */}
            {df.showTime && (
              <div className="space-y-1">
                <Label className="text-xs">Time Format</Label>
                <Select
                  value={df.timeFormat || '24h'}
                  onValueChange={(v) => updateField(selectedFieldIndex, { timeFormat: v as NonNullable<DateFieldConfig["timeFormat"]> })}
                >
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24-hour</SelectItem>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show Seconds — only when showTime */}
            {df.showTime && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Show Seconds Picker</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[240px]"><p className="text-xs">Add a seconds scroller. Submitted value is always a full ISO timestamp (e.g. 2026-04-19T10:22:10.170Z).</p></TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  checked={df.showSeconds || false}
                  onCheckedChange={(checked) => updateField(selectedFieldIndex, { showSeconds: checked })}
                />
              </div>
            )}

            {/* Year Range */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-1">
                <Label className="text-xs">From Year</Label>
                <Input
                  type="number"
                  value={df.fromYear ?? ''}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    updateField(selectedFieldIndex, { fromYear: !isNaN(v) ? v : undefined });
                  }}
                  className="h-8 text-sm"
                  placeholder="1920"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To Year</Label>
                <Input
                  type="number"
                  value={df.toYear ?? ''}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    updateField(selectedFieldIndex, { toYear: !isNaN(v) ? v : undefined });
                  }}
                  className="h-8 text-sm"
                  placeholder="2100"
                />
              </div>
            </div>

            {/* Date Constraint Preset */}
            <div className="space-y-1">
              <Label className="text-xs">Date Constraint</Label>
              <Select
                value={df.dateConstraint || '__none__'}
                onValueChange={(v) => updateField(selectedFieldIndex, {
                  dateConstraint: v === '__none__' ? undefined : (v as NonNullable<DateFieldConfig["dateConstraint"]>),
                })}
              >
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="No constraint" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No constraint</SelectItem>
                  <SelectItem value="futureOnly">Future only (today + future)</SelectItem>
                  <SelectItem value="pastOnly">Past only (today + past)</SelectItem>
                  <SelectItem value="todayOnly">Today only</SelectItem>
                  <SelectItem value="noWeekends">No weekends</SelectItem>
                  <SelectItem value="futureNoWeekends">Future + no weekends</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">Quick preset to restrict selectable dates</p>
            </div>

            {/* Fixed Min Date */}
            <div className="space-y-1">
              <DatePickerInput
                label="Min Date (fixed)"
                placeholder="dd/mm/yyyy"
                value={df.minDate ? new Date(df.minDate).toISOString() : ''}
                onChange={(iso) => updateField(selectedFieldIndex, {
                  minDate: iso ? new Date(iso) : undefined,
                })}
              />
              <p className="text-[10px] text-muted-foreground">Cannot select dates before this date</p>
            </div>

            {/* Fixed Max Date */}
            <div className="space-y-1">
              <DatePickerInput
                label="Max Date (fixed)"
                placeholder="dd/mm/yyyy"
                value={df.maxDate ? new Date(df.maxDate).toISOString() : ''}
                onChange={(iso) => updateField(selectedFieldIndex, {
                  maxDate: iso ? new Date(iso) : undefined,
                })}
              />
              <p className="text-[10px] text-muted-foreground">Cannot select dates after this date</p>
            </div>

            {/* Linked Min Date Field */}
            <div className="space-y-1">
              <Label className="text-xs">Min Date from Field</Label>
              <Select value={df.minDateField || "__none__"} onValueChange={(v) => updateField(selectedFieldIndex, { minDateField: v === "__none__" ? undefined : v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="No constraint" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No constraint</SelectItem>
                  {allFieldNames.filter(f => f.value !== selectedField.name).map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">Can&apos;t select before another date field&apos;s value</p>
            </div>

            {/* Linked Max Date Field */}
            <div className="space-y-1">
              <Label className="text-xs">Max Date from Field</Label>
              <Select value={df.maxDateField || "__none__"} onValueChange={(v) => updateField(selectedFieldIndex, { maxDateField: v === "__none__" ? undefined : v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="No constraint" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No constraint</SelectItem>
                  {allFieldNames.filter(f => f.value !== selectedField.name).map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">Can&apos;t select after another date field&apos;s value</p>
            </div>
          </>
        );
      }
      default:
        return null;
    }
  };

  const renderDefaultValueEditor = () => {
    if (!selectedField || selectedFieldIndex === null) return null;
    if (selectedField.type === "file" || isLayoutType(selectedField.type)) return null;

    if (selectedField.type === "checkbox" || selectedField.type === "switch") {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label className="text-xs">Default Value</Label>
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">Initial value when the form loads. For checkbox/switch: on or off.</p></TooltipContent>
            </Tooltip>
          </div>
          <Switch checked={!!selectedField.defaultValue} onCheckedChange={(checked) => updateField(selectedFieldIndex, { defaultValue: checked })} />
        </div>
      );
    }

    if (
      (selectedField.type === "select" || selectedField.type === "radio" || selectedField.type === "combobox") &&
      hasOptionsField(selectedField) &&
      selectedField.options.length > 0
    ) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Label className="text-xs">Default Value</Label>
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">Pre-selected option when the form loads.</p></TooltipContent>
            </Tooltip>
          </div>
          <Select value={String(selectedField.defaultValue || "__none__")} onValueChange={(v) => updateField(selectedFieldIndex, { defaultValue: v === "__none__" ? undefined : v })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="No default" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No default</SelectItem>
              {selectedField.options.map((o: FieldOption) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Label className="text-xs">Default Value</Label>
          <Tooltip>
            <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">Initial value when the form loads.</p></TooltipContent>
          </Tooltip>
        </div>
        <Input
          value={String(selectedField.defaultValue || "")}
          onChange={(e) => updateField(selectedFieldIndex, { defaultValue: e.target.value || undefined })}
          className="h-8 text-sm" placeholder="No default"
        />
      </div>
    );
  };

  const isAsyncOrInfinite = (type: string) =>
    type.startsWith('async') || type.startsWith('infinite');

  const isInfinite = (type: string) => type.startsWith('infinite');

  const renderApiConfigEditor = () => {
    if (!selectedField || selectedFieldIndex === null) return null;
    if (!isAsyncOrInfinite(selectedField.type)) return null;

    const apiConfig: AsyncApiConfig | undefined = (selectedField as FieldWithApi).apiConfig;
    const defaultApiConfig: AsyncApiConfig = {
      url: '',
      method: 'GET',
      responseMapping: { dataPath: 'data', labelKey: 'name', valueKey: 'id' },
    };

    const updateApiConfig = (updates: Partial<AsyncApiConfig>) => {
      const current = apiConfig || defaultApiConfig;
      updateField(selectedFieldIndex, { apiConfig: { ...current, ...updates } });
    };

    const updateResponseMapping = (updates: Partial<AsyncApiConfig['responseMapping']>) => {
      const current = apiConfig || defaultApiConfig;
      updateField(selectedFieldIndex, {
        apiConfig: { ...current, responseMapping: { ...current.responseMapping, ...updates } },
      });
    };

    return (
      <>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              API Configuration
            </Label>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isInfinite(selectedField.type)
              ? "Configure the API endpoint for infinite scroll loading."
              : "Configure the API endpoint to fetch options when the component mounts."}
          </p>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable API Config</Label>
            <Switch
              checked={!!apiConfig}
              onCheckedChange={(checked) => {
                if (checked) updateField(selectedFieldIndex, { apiConfig: defaultApiConfig });
                else updateField(selectedFieldIndex, { apiConfig: undefined });
              }}
            />
          </div>

          {apiConfig && (
            <div className="space-y-2 pl-1">
              <div className="space-y-1">
                <Label className="text-xs">Endpoint URL</Label>
                <Input
                  value={apiConfig.url}
                  onChange={(e) => updateApiConfig({ url: e.target.value })}
                  className="h-8 text-sm font-mono"
                  placeholder="https://api.example.com/items"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">HTTP Method</Label>
                <Select value={apiConfig.method} onValueChange={(v) => updateApiConfig({ method: v as AsyncApiConfig["method"] })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {['POST', 'PUT', 'PATCH'].includes(apiConfig.method) && (
                <div className="space-y-1">
                  <Label className="text-xs">JSON Payload</Label>
                  <JsonObjectInput
                    key={`api-payload-${selectedField.name}`}
                    value={apiConfig.payload as Record<string, unknown> | undefined}
                    onChange={(payload) => updateApiConfig({ payload })}
                    placeholder='{"key": "value"}'
                  />
                  <p className="text-[10px] text-muted-foreground">JSON body sent with the request</p>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Custom Headers (optional)</Label>
                <JsonObjectInput
                  key={`api-headers-${selectedField.name}`}
                  value={apiConfig.headers as Record<string, unknown> | undefined}
                  onChange={(headers) => updateApiConfig({ headers: headers as Record<string, string> | undefined })}
                  placeholder='{"Authorization": "Bearer ..."}'
                />
              </div>

              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-3 w-3 text-primary" />
                  <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Response Mapping</Label>
                </div>
                <p className="text-[10px] text-muted-foreground">Map API response to {'{label, value}'} format</p>

                <div className="space-y-1">
                  <Label className="text-xs">Data Path</Label>
                  <Input
                    value={apiConfig.responseMapping.dataPath}
                    onChange={(e) => updateResponseMapping({ dataPath: e.target.value })}
                    className="h-8 text-sm font-mono"
                    placeholder="data.items"
                  />
                  <p className="text-[10px] text-muted-foreground">Dot-notation path to array. Leave empty if response is the array itself.</p>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Label Key</Label>
                    <Input
                      value={apiConfig.responseMapping.labelKey}
                      onChange={(e) => updateResponseMapping({ labelKey: e.target.value })}
                      className="h-8 text-sm font-mono"
                      placeholder="name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Value Key</Label>
                    <Input
                      value={apiConfig.responseMapping.valueKey}
                      onChange={(e) => updateResponseMapping({ valueKey: e.target.value })}
                      className="h-8 text-sm font-mono"
                      placeholder="id"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Extra Keys</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[220px]"><p className="text-xs">Extra keys from each fetched item to preserve. When a user selects an option, these values become available as <code className="font-mono text-[10px]">{'{fieldName}__{key}'}</code> for other fields to watch.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    value={(apiConfig.responseMapping.extraKeys || []).join(', ')}
                    onChange={(e) => {
                      const keys = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                      updateResponseMapping({ extraKeys: keys.length ? keys : undefined });
                    }}
                    className="h-8 text-sm font-mono"
                    placeholder="city_code, region"
                  />
                  <p className="text-[10px] text-muted-foreground">Comma-separated. Watching fields use <code className="font-mono">{'{fieldName}__{key}'}</code> as watch field name.</p>
                </div>
              </div>

              {/* Infinite-specific settings */}
              {isInfinite(selectedField.type) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Infinite Scroll Settings</Label>
                    <p className="text-[10px] text-muted-foreground">Configure pagination and search-as-you-type behavior</p>

                    <div className="space-y-1">
                      <Label className="text-xs">Search Param</Label>
                      <Input
                        value={apiConfig.searchParam || ''}
                        onChange={(e) => updateApiConfig({ searchParam: e.target.value || undefined })}
                        className="h-8 text-sm font-mono"
                        placeholder="q"
                      />
                      <p className="text-[10px] text-muted-foreground">Query param name for search term</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="space-y-1">
                        <Label className="text-xs">Page Param</Label>
                        <Input
                          value={apiConfig.pageParam || ''}
                          onChange={(e) => updateApiConfig({ pageParam: e.target.value || undefined })}
                          className="h-8 text-sm font-mono"
                          placeholder="page"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Page Size Param</Label>
                        <Input
                          value={apiConfig.pageSizeParam || ''}
                          onChange={(e) => updateApiConfig({ pageSizeParam: e.target.value || undefined })}
                          className="h-8 text-sm font-mono"
                          placeholder="limit"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Page Size</Label>
                      <Input
                        type="number"
                        min={1}
                        value={apiConfig.pageSize || 20}
                        onChange={(e) => { const v = parseInt(e.target.value); updateApiConfig({ pageSize: !isNaN(v) && v >= 1 ? v : 20 }); }}
                        className="h-8 text-sm"
                        placeholder="20"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Total Count Path</Label>
                      <Input
                        value={apiConfig.hasMorePath || ''}
                        onChange={(e) => updateApiConfig({ hasMorePath: e.target.value || undefined })}
                        className="h-8 text-sm font-mono"
                        placeholder="total"
                      />
                      <p className="text-[10px] text-muted-foreground">Path to total count or boolean hasMore in response</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs">Offset-based pagination</Label>
                        <Tooltip>
                          <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">Use skip/offset instead of page number. The page param value will be calculated as (page - 1) * pageSize.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch
                        checked={apiConfig.offsetBased || false}
                        onCheckedChange={(checked) => updateApiConfig({ offsetBased: checked })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderDependentOptionsEditor = () => {
    if (!selectedField || selectedFieldIndex === null) return null;
    if (isLayoutType(selectedField.type)) return null;
    const hasOptions = ['select', 'combobox', 'radio', 'multiselect', 'multicombobox', 'checkboxgroup',
      'asyncselect', 'asynccombobox', 'asyncmultiselect', 'asyncmulticombobox',
      'infiniteselect', 'infinitecombobox', 'infinitemultiselect', 'infinitemulticombobox'].includes(selectedField.type);
    if (!hasOptions) return null;
    const depConfig = selectedField.dependentOptions;

    return (
      <>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-3.5 w-3.5 text-primary" />
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dependent Options</Label>
          </div>
          <p className="text-[10px] text-muted-foreground">Options change based on another field&apos;s value</p>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable</Label>
            <Switch checked={!!depConfig} onCheckedChange={(checked) => {
              if (checked) updateField(selectedFieldIndex, { dependentOptions: { watchField: '', optionsMap: {} } });
              else updateField(selectedFieldIndex, { dependentOptions: undefined });
            }} />
          </div>
          {depConfig && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Watch Field</Label>
                <Select value={depConfig.watchField || ""} onValueChange={(v) => updateField(selectedFieldIndex, { dependentOptions: { ...depConfig, watchField: v } })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select parent field" /></SelectTrigger>
                  <SelectContent>
                    {allFieldNames.filter(f => f.value !== selectedField.name).map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Options Map</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                    const newKey = `value_${Object.keys(depConfig.optionsMap).length + 1}`;
                    updateField(selectedFieldIndex, { dependentOptions: { ...depConfig, optionsMap: { ...depConfig.optionsMap, [newKey]: [{ label: "Option 1", value: "opt1" }] } } });
                  }}><Plus className="h-3 w-3 mr-1" /> Add Group</Button>
                </div>
                <p className="text-[10px] text-muted-foreground">When parent field = key, show these options</p>
                {Object.entries(depConfig.optionsMap || {}).map(([key, options]: [string, FieldOption[]]) => (
                  <div key={key} className="p-2 rounded border border-border space-y-2 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">When =</span>
                      <Input value={key} onChange={(e) => {
                        const newMap = { ...depConfig.optionsMap }; const opts = newMap[key]; delete newMap[key]; newMap[e.target.value] = opts;
                        updateField(selectedFieldIndex, { dependentOptions: { ...depConfig, optionsMap: newMap } });
                      }} className="h-6 text-xs flex-1 font-mono" />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                        const newMap = { ...depConfig.optionsMap }; delete newMap[key];
                        updateField(selectedFieldIndex, { dependentOptions: { ...depConfig, optionsMap: newMap } });
                      }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                    {options.map((opt: FieldOption, oi: number) => (
                      <div key={oi} className="flex gap-1 pl-4">
                        <Input value={opt.label} onChange={(e) => {
                          const newMap = { ...depConfig.optionsMap }; const newOpts = [...newMap[key]]; newOpts[oi] = { ...newOpts[oi], label: e.target.value }; newMap[key] = newOpts;
                          updateField(selectedFieldIndex, { dependentOptions: { ...depConfig, optionsMap: newMap } });
                        }} placeholder="Label" className="h-6 text-[10px] flex-1" />
                        <Input value={opt.value} onChange={(e) => {
                          const newMap = { ...depConfig.optionsMap }; const newOpts = [...newMap[key]]; newOpts[oi] = { ...newOpts[oi], value: e.target.value }; newMap[key] = newOpts;
                          updateField(selectedFieldIndex, { dependentOptions: { ...depConfig, optionsMap: newMap } });
                        }} placeholder="Value" className="h-6 text-[10px] flex-1 font-mono" />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                          const newMap = { ...depConfig.optionsMap }; newMap[key] = newMap[key].filter((_, i: number) => i !== oi);
                          updateField(selectedFieldIndex, { dependentOptions: { ...depConfig, optionsMap: newMap } });
                        }}><Trash2 className="h-2.5 w-2.5" /></Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="h-5 text-[10px] ml-4" onClick={() => {
                      const newMap = { ...depConfig.optionsMap }; newMap[key] = [...newMap[key], { label: `Option ${newMap[key].length + 1}`, value: `opt${newMap[key].length + 1}` }];
                      updateField(selectedFieldIndex, { dependentOptions: { ...depConfig, optionsMap: newMap } });
                    }}><Plus className="h-2.5 w-2.5 mr-0.5" /> Option</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderDependentApiConfigEditor = () => {
    if (!selectedField || selectedFieldIndex === null) return null;
    if (isLayoutType(selectedField.type)) return null;
    const supportedTypes = [
      'asyncselect', 'asynccombobox', 'asyncmultiselect', 'asyncmulticombobox',
      'infiniteselect', 'infinitecombobox', 'infinitemultiselect', 'infinitemulticombobox',
    ];
    if (!supportedTypes.includes(selectedField.type)) return null;

    const depApiConfig = (selectedField as any).dependentApiConfig;

    const updateDepApi = (updates: Partial<any>) => {
      const current = depApiConfig || {
        watchField: '', url: '', method: 'GET',
        responseMapping: { dataPath: 'data', labelKey: 'name', valueKey: 'id' },
      };
      updateField(selectedFieldIndex, { dependentApiConfig: { ...current, ...updates } } as any);
    };

    const updateDepApiMapping = (updates: Partial<any>) => {
      const current = depApiConfig || {
        watchField: '', url: '', method: 'GET',
        responseMapping: { dataPath: 'data', labelKey: 'name', valueKey: 'id' },
      };
      updateField(selectedFieldIndex, {
        dependentApiConfig: { ...current, responseMapping: { ...current.responseMapping, ...updates } }
      } as any);
    };

    return (
      <>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Dependent API (Dynamic)
            </Label>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Refetch options when another field changes (e.g. country → cities). Use{' '}
            <code className="font-mono">{'{value}'}</code> or path params{' '}
            <code className="font-mono">/:id</code> in the URL. JSON below becomes query params (GET / DELETE) or body
            (POST / PUT / PATCH).
          </p>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable</Label>
            <Switch
              checked={!!depApiConfig}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateField(selectedFieldIndex, {
                    dependentApiConfig: {
                      watchField: '', url: '', method: 'GET',
                      responseMapping: { dataPath: 'data', labelKey: 'name', valueKey: 'id' },
                    }
                  } as any);
                } else {
                  updateField(selectedFieldIndex, { dependentApiConfig: undefined } as any);
                }
              }}
            />
          </div>

          {depApiConfig && (
            <div className="space-y-2 pl-1">
              <div className="space-y-1">
                <Label className="text-xs">Watch Field</Label>
                <Select value={depApiConfig.watchField || ""} onValueChange={(v) => updateDepApi({ watchField: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select parent field" /></SelectTrigger>
                  <SelectContent>
                    {allFieldNames.filter(f => f.value !== selectedField.name).map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Tip: use <code className="font-mono">{'{fieldName}__{key}'}</code> to watch an extra key from a parent field.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">API URL</Label>
                <Input
                  value={depApiConfig.url || ''}
                  onChange={(e) => updateDepApi({ url: e.target.value })}
                  className="h-8 text-sm font-mono"
                  placeholder="https://api.example.com/countries/:id/cities"
                />
                <p className="text-[10px] text-muted-foreground">
                  Examples: query <code className="font-mono">?country={'{value}'}</code>, path{' '}
                  <code className="font-mono">/regions/{'{value}'}/cities</code> or{' '}
                  <code className="font-mono">/countries/:id/cities</code>.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">HTTP Method</Label>
                <Select value={depApiConfig.method || 'GET'} onValueChange={(v) => updateDepApi({ method: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(() => {
                const method = depApiConfig.method || 'GET';
                const isBody = ['POST', 'PUT', 'PATCH'].includes(method);
                return (
                  <div className="space-y-1">
                    <Label className="text-xs">{isBody ? 'JSON body' : 'Query params (JSON object)'}</Label>
                    <JsonObjectInput
                      key={`dep-payload-${selectedField.name}`}
                      value={depApiConfig.payload as Record<string, unknown> | undefined}
                      onChange={(payload) => updateDepApi({ payload })}
                      placeholder={isBody ? '{"country": "{value}"}' : '{"countryId":"{value}"}'}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {isBody
                        ? 'Sent as JSON body; string values may use {value}.'
                        : 'Merged into the query string; string values may use {value}.'}
                    </p>
                  </div>
                );
              })()}

              <Separator />
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Response Mapping</Label>
                <div className="space-y-1">
                  <Label className="text-xs">Data Path</Label>
                  <Input
                    value={depApiConfig.responseMapping?.dataPath || ''}
                    onChange={(e) => updateDepApiMapping({ dataPath: e.target.value })}
                    className="h-8 text-sm font-mono"
                    placeholder="data"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Label Key</Label>
                    <Input
                      value={depApiConfig.responseMapping?.labelKey || ''}
                      onChange={(e) => updateDepApiMapping({ labelKey: e.target.value })}
                      className="h-8 text-sm font-mono"
                      placeholder="name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Value Key</Label>
                    <Input
                      value={depApiConfig.responseMapping?.valueKey || ''}
                      onChange={(e) => updateDepApiMapping({ valueKey: e.target.value })}
                      className="h-8 text-sm font-mono"
                      placeholder="id"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">Properties</CardTitle>
        <CardDescription className="text-xs">
          {selectedField ? `Editing: ${selectedField.label || selectedField.name}` : "Select a field"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[520px]">
          {selectedField && selectedFieldIndex !== null ? (
            <div className="space-y-3 p-2">
              {/* Basic Properties — always shown */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input value={selectedField.label || ""} onChange={(e) => updateField(selectedFieldIndex, { label: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Name (ID)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">Unique identifier used in code. Becomes the key in submitted data.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input value={selectedField.name} onChange={(e) => updateField(selectedFieldIndex, { name: e.target.value })} className="h-8 text-sm font-mono" />
                </div>
                {/* Placeholder — hide for layout types */}
                {!isLayoutType(selectedField.type) && (
                  <div className="space-y-1">
                    <Label className="text-xs">Placeholder</Label>
                    <Input value={selectedField.placeholder || ""} onChange={(e) => updateField(selectedFieldIndex, { placeholder: e.target.value })} className="h-8 text-sm" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input value={selectedField.description || ""} onChange={(e) => updateField(selectedFieldIndex, { description: e.target.value })} className="h-8 text-sm" />
                </div>
                {renderDefaultValueEditor()}
              </div>

              {/* Column Span — always available */}
              <Separator />
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Column Span</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">How many grid columns this field spans. Only useful in multi-column sections.</p></TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={String(selectedField.colSpan || 1)}
                  onValueChange={(v) => updateField(selectedFieldIndex, { colSpan: parseInt(v) === 1 ? undefined : parseInt(v) })}
                >
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (default)</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4 (full width)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Required / Disabled / Exclude — hide for layout types */}
              {!isLayoutType(selectedField.type) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs">Required</Label>
                        <Tooltip>
                          <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">Field must be filled before form can be submitted.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch checked={selectedField.required || false} onCheckedChange={(checked) => updateField(selectedFieldIndex, { required: checked })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs">Disabled</Label>
                        <Tooltip>
                          <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">Grays out the field and prevents user interaction.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch checked={selectedField.disabled || false} onCheckedChange={(checked) => updateField(selectedFieldIndex, { disabled: checked })} />
                    </div>
                  </div>
                </>
              )}

              {/* Exclude from Submit — always on for layout types, toggleable for others */}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Exclude from Submit</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">{isLayoutType(selectedField.type) ? "Layout fields are always excluded from submitted data." : "When enabled, this field's value won't be sent to the server on form submission."}</p></TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  disabled={isLayoutType(selectedField.type)}
                  checked={isLayoutType(selectedField.type) ? true : (selectedField.excludeFromSubmit || false)}
                  onCheckedChange={(checked) => updateField(selectedFieldIndex, { excludeFromSubmit: checked })}
                />
              </div>

              {/* Preview-specific properties */}
              {selectedField.type === 'preview' && (
                <>
                  <Separator />
                  {renderPreviewProperties()}
                </>
              )}

              {/* Empty-specific properties */}
              {selectedField.type === 'empty' && (
                <>
                  <Separator />
                  {renderEmptyProperties()}
                </>
              )}

              {/* Field-Specific (text, number, etc) */}
              {!isLayoutType(selectedField.type) && renderFieldSpecificProperties() && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{selectedField.type} Settings</Label>
                    {renderFieldSpecificProperties()}
                  </div>
                </>
              )}

              {/* API Config for async/infinite fields */}
              {renderApiConfigEditor()}

              {/* Options */}
              {!isLayoutType(selectedField.type) && hasOptionsField(selectedField) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Options</Label>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={addOption}><Plus className="h-3 w-3 mr-1" /> Add</Button>
                    </div>
                    {selectedField.options.map((opt: FieldOption, idx: number) => (
                      <div key={idx} className="flex gap-1.5">
                        <Input value={opt.label} onChange={(e) => {
                          const newOptions = [...selectedField.options]; newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                          updateField(selectedFieldIndex, { options: newOptions });
                        }} placeholder="Label" className="h-7 text-xs flex-1" />
                        <Input value={opt.value} onChange={(e) => {
                          const newOptions = [...selectedField.options]; newOptions[idx] = { ...newOptions[idx], value: e.target.value };
                          updateField(selectedFieldIndex, { options: newOptions });
                        }} placeholder="Value" className="h-7 text-xs flex-1 font-mono" />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOption(idx)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Dependent Options (static) */}
              {renderDependentOptionsEditor()}

              {/* Dependent API (dynamic) */}
              {renderDependentApiConfigEditor()}

              {/* Conditional Visibility — not for layout types */}
              {!isLayoutType(selectedField.type) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Conditional Visibility</Label>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Enable</Label>
                      <Switch
                        checked={!!selectedField.condition}
                        onCheckedChange={(checked) => {
                          if (checked) updateField(selectedFieldIndex, { condition: { field: '', operator: 'equals', value: '' } });
                          else updateField(selectedFieldIndex, { condition: undefined });
                        }}
                      />
                    </div>
                    {selectedField.condition && (
                      <div className="space-y-2 pl-1">
                        <div className="space-y-1">
                          <Label className="text-xs">Watch Field</Label>
                          <Select value={selectedField.condition.field || ""} onValueChange={(v) => updateField(selectedFieldIndex, { condition: { ...selectedField.condition!, field: v } })}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select field" /></SelectTrigger>
                            <SelectContent>
                              {allFieldNames.filter(f => f.value !== selectedField.name).map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Operator</Label>
                          <Select value={selectedField.condition.operator || "equals"} onValueChange={(v) => updateField(selectedFieldIndex, { condition: { ...selectedField.condition!, operator: v as ConditionOperator } })}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="notEquals">Not Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="in">In (comma-separated)</SelectItem>
                              <SelectItem value="notEmpty">Not Empty</SelectItem>
                              <SelectItem value="empty">Is Empty</SelectItem>
                              <SelectItem value="isTrue">Is True (for checkbox/switch)</SelectItem>
                              <SelectItem value="isFalse">Is False (for checkbox/switch)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {['equals', 'notEquals', 'contains', 'in'].includes(selectedField.condition.operator) && (
                          <div className="space-y-1">
                            <Label className="text-xs">Value</Label>
                            <Input value={selectedField.condition.value || ""} onChange={(e) => updateField(selectedFieldIndex, { condition: { ...selectedField.condition!, value: e.target.value } })} className="h-8 text-sm" placeholder="Expected value" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Watch / Auto-Populate */}
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Auto-Populate (Watch)</Label>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Enable</Label>
                      <Switch
                        checked={!!selectedField.watchConfig}
                        onCheckedChange={(checked) => {
                          if (checked) updateField(selectedFieldIndex, { watchConfig: { watchField: '' } });
                          else updateField(selectedFieldIndex, { watchConfig: undefined });
                        }}
                      />
                    </div>
                    {selectedField.watchConfig && (
                      <div className="space-y-3 pl-1">
                        <div className="space-y-1">
                          <Label className="text-xs">Source Field</Label>
                          <Select value={selectedField.watchConfig.watchField || ""} onValueChange={(v) => updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, watchField: v } })}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select field" /></SelectTrigger>
                            <SelectContent>
                              {allFieldNames.filter(f => f.value !== selectedField.name).map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-muted-foreground">
                            Extra API keys (async/infinite <span className="font-mono">Extra keys</span>) appear as <span className="font-mono">fieldName__key</span> in this list.
                          </p>
                        </div>

                        {/* Transform Constraints */}
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Transform Constraints</Label>
                          <p className="text-[10px] text-muted-foreground">Apply transformations to the watched value before populating this field</p>
                          <div className="space-y-1.5">
                            <div className="space-y-1">
                              <Label className="text-xs">Filter Characters</Label>
                              <Select value={selectedField.watchConfig?.transform?.filter || "__none__"} onValueChange={(v) => {
                                const transform: WatchTransform = {
                                  ...selectedField.watchConfig?.transform,
                                  filter: v === "__none__" ? undefined : (v as NonNullable<WatchTransform["filter"]>),
                                };
                                updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, transform } });
                              }}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">No filter</SelectItem>
                                  <SelectItem value="numbers">Numbers only</SelectItem>
                                  <SelectItem value="letters">Letters only</SelectItem>
                                  <SelectItem value="alphanumeric">Alphanumeric</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Text Case</Label>
                              <Select value={selectedField.watchConfig?.transform?.case || "__none__"} onValueChange={(v) => {
                                const transform: WatchTransform = {
                                  ...selectedField.watchConfig?.transform,
                                  case: v === "__none__" ? undefined : (v as NonNullable<WatchTransform["case"]>),
                                };
                                updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, transform } });
                              }}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">No transform</SelectItem>
                                  <SelectItem value="upper">UPPERCASE</SelectItem>
                                  <SelectItem value="lower">lowercase</SelectItem>
                                  <SelectItem value="capitalize">Capitalize first</SelectItem>
                                  <SelectItem value="title">Title Case</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="space-y-1">
                                <Label className="text-xs">Slice Start</Label>
                                <Input type="number" value={selectedField.watchConfig?.transform?.slice?.start ?? ""} onChange={(e) => {
                                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                                  const currentSlice = selectedField.watchConfig?.transform?.slice;
                                  const slice = val !== undefined ? { start: val, end: currentSlice?.end } : undefined;
                                  const transform: WatchTransform = { ...selectedField.watchConfig?.transform, slice };
                                  updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, transform } });
                                }} className="h-7 text-xs" placeholder="0" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Slice End</Label>
                                <Input type="number" value={selectedField.watchConfig?.transform?.slice?.end ?? ""} onChange={(e) => {
                                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                                  const currentSlice = selectedField.watchConfig?.transform?.slice;
                                  const transform: WatchTransform = {
                                    ...selectedField.watchConfig?.transform,
                                    slice: { start: currentSlice?.start ?? 0, end: val },
                                  };
                                  updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, transform } });
                                }} className="h-7 text-xs" placeholder="No limit" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Template</Label>
                              <Input value={selectedField.watchConfig?.transform?.template || ""} onChange={(e) => {
                                const transform: WatchTransform = {
                                  ...selectedField.watchConfig?.transform,
                                  template: e.target.value || undefined,
                                };
                                updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, transform } });
                              }} className="h-7 text-xs font-mono" placeholder="PREFIX-{value}-SUFFIX" />
                              <p className="text-[10px] text-muted-foreground">Use {'{value}'} as placeholder for the transformed value</p>
                            </div>
                          </div>
                        </div>

                        {/* Value Map */}
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Use Value Map</Label>
                          <Switch
                            checked={!!selectedField.watchConfig.valueMap}
                            onCheckedChange={(checked) => {
                              if (checked) updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, valueMap: {} } });
                              else {
                                const rest = { ...selectedField.watchConfig! };
                                delete rest.valueMap;
                                updateField(selectedFieldIndex, { watchConfig: rest });
                              }
                            }}
                          />
                        </div>
                        {selectedField.watchConfig.valueMap && (
                          <div className="space-y-1.5">
                            {Object.entries(selectedField.watchConfig.valueMap).map(([key, val], idx) => (
                              <div key={idx} className="flex gap-1.5">
                                <Input value={key} onChange={(e) => {
                                  const newMap = { ...selectedField.watchConfig!.valueMap! }; const oldVal = newMap[key]; delete newMap[key]; newMap[e.target.value] = oldVal;
                                  updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, valueMap: newMap } });
                                }} placeholder="When" className="h-6 text-[10px] flex-1" />
                                <Input value={val as string} onChange={(e) => {
                                  const newMap = { ...selectedField.watchConfig!.valueMap! }; newMap[key] = e.target.value;
                                  updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, valueMap: newMap } });
                                }} placeholder="Show" className="h-6 text-[10px] flex-1" />
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                  const newMap = { ...selectedField.watchConfig!.valueMap! }; delete newMap[key];
                                  updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, valueMap: newMap } });
                                }}><Trash2 className="h-2.5 w-2.5" /></Button>
                              </div>
                            ))}
                            <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => {
                              const newMap = { ...selectedField.watchConfig!.valueMap!, [`key_${Date.now()}`]: '' };
                              updateField(selectedFieldIndex, { watchConfig: { ...selectedField.watchConfig!, valueMap: newMap } });
                            }}><Plus className="h-2.5 w-2.5 mr-0.5" /> Mapping</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <TextCursorInput className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No field selected</p>
              <p className="text-xs text-muted-foreground mt-1">Click a field in the canvas to edit</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
