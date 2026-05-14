/**
 * Settings sidebar for the Kanban Builder.
 * Edit board metadata, layout, columns, visible fields, and feature toggles.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  ALL_FIELDS, type KanbanBuilderConfig, type KanbanCardField, type KanbanColumnConfig,
} from "@/kanban-builder/data/kanbanBuilderTemplates";

interface Props {
  config: KanbanBuilderConfig;
  onChange: (next: KanbanBuilderConfig) => void;
}

const COLOR_OPTIONS = ["muted", "amber", "blue", "purple", "emerald"];

export function KanbanSettingsPanel({ config, onChange }: Props) {
  const update = <K extends keyof KanbanBuilderConfig>(key: K, value: KanbanBuilderConfig[K]) =>
    onChange({ ...config, [key]: value });

  const updateColumn = (idx: number, patch: Partial<KanbanColumnConfig>) => {
    const cols = config.columns.map((c, i) => i === idx ? { ...c, ...patch } : c);
    update("columns", cols);
  };

  const addColumn = () => {
    const id = `col-${Date.now()}`;
    update("columns", [...config.columns, { id, title: "New column", color: "muted" }]);
  };

  const removeColumn = (idx: number) => {
    update("columns", config.columns.filter((_, i) => i !== idx));
  };

  const toggleField = (key: KanbanCardField) => {
    const has = config.visibleFields.includes(key);
    update("visibleFields", has ? config.visibleFields.filter(k => k !== key) : [...config.visibleFields, key]);
  };

  return (
    <div className="space-y-3">
      <Accordion type="multiple" defaultValue={["meta", "layout", "columns", "fields", "features"]}>
        {/* Meta */}
        <AccordionItem value="meta">
          <AccordionTrigger className="text-sm">Board info</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input value={config.title} onChange={e => update("title", e.target.value)} className="h-8" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subtitle</Label>
              <Input value={config.subtitle ?? ""} onChange={e => update("subtitle", e.target.value)} className="h-8" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Layout */}
        <AccordionItem value="layout">
          <AccordionTrigger className="text-sm">Layout</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Layout type</Label>
              <Select value={config.layout} onValueChange={(v) => update("layout", v as KanbanBuilderConfig["layout"])}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="board">Classic board</SelectItem>
                  <SelectItem value="compact">Compact grid</SelectItem>
                  <SelectItem value="swimlane">Swimlane matrix</SelectItem>
                  <SelectItem value="timeline">Timeline (horizontal)</SelectItem>
                  <SelectItem value="calendar">Calendar (week grid)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.layout === "swimlane" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Group rows by</Label>
                <Select value={config.swimlaneKey ?? "assignee"} onValueChange={(v) => update("swimlaneKey", v as KanbanBuilderConfig["swimlaneKey"])}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignee">Assignee</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="swimlane">Custom (card.swimlane)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Compact cards</Label>
              <Switch checked={config.compactCards} onCheckedChange={(v) => update("compactCards", v)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Direction</Label>
              <Select
                value={config.direction ?? "ltr"}
                onValueChange={(v) => update("direction", v as "ltr" | "rtl")}
              >
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ltr">LTR (left-to-right)</SelectItem>
                  <SelectItem value="rtl">RTL (right-to-left)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Columns */}
        <AccordionItem value="columns">
          <AccordionTrigger className="text-sm">Columns ({config.columns.length})</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {config.columns.map((col, idx) => (
              <div key={col.id} className="rounded-md border border-border p-2 space-y-2 bg-muted/20">
                <div className="flex items-center gap-1.5">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input
                    value={col.title}
                    onChange={(e) => updateColumn(idx, { title: e.target.value })}
                    className="h-7 text-xs flex-1"
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeColumn(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Color</Label>
                    <Select value={col.color ?? "muted"} onValueChange={(v) => updateColumn(idx, { color: v })}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map(c => (
                          <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">WIP limit</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="—"
                      value={col.wipLimit ?? ""}
                      onChange={(e) => updateColumn(idx, { wipLimit: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full h-8 gap-1.5" onClick={addColumn}>
              <Plus className="h-3.5 w-3.5" /> Add column
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Visible fields */}
        <AccordionItem value="fields">
          <AccordionTrigger className="text-sm">Card fields</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {ALL_FIELDS.map(f => (
              <div key={f.key} className="flex items-center justify-between">
                <Label className="text-xs">{f.label}</Label>
                <Switch
                  checked={config.visibleFields.includes(f.key)}
                  onCheckedChange={() => toggleField(f.key)}
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Features */}
        <AccordionItem value="features">
          <AccordionTrigger className="text-sm">Features</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Drag &amp; drop</Label>
              <Switch checked={config.enableDnd} onCheckedChange={(v) => update("enableDnd", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Add card buttons</Label>
              <Switch checked={config.enableAddCard} onCheckedChange={(v) => update("enableAddCard", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">WIP limits</Label>
              <Switch checked={config.enableWipLimits} onCheckedChange={(v) => update("enableWipLimits", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Column totals</Label>
              <Switch checked={config.showColumnTotals} onCheckedChange={(v) => update("showColumnTotals", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-xs">Reduce motion</Label>
                <span className="text-[10px] text-muted-foreground">Disable card-shift animations during drag</span>
              </div>
              <Switch checked={!!config.reduceMotion} onCheckedChange={(v) => update("reduceMotion", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-xs">Infinite scroll</Label>
                <span className="text-[10px] text-muted-foreground">Load more when a column reaches the bottom</span>
              </div>
              <Switch
                checked={!!config.infiniteScroll?.enabled}
                onCheckedChange={(v) => update("infiniteScroll", { ...(config.infiniteScroll ?? {}), enabled: v })}
              />
            </div>
            {config.infiniteScroll?.enabled && (
              <div className="space-y-1.5">
                <Label className="text-xs">Load threshold (px)</Label>
                <Input
                  type="number"
                  min={24}
                  value={config.infiniteScroll.thresholdPx ?? 96}
                  onChange={(e) => update("infiniteScroll", { ...config.infiniteScroll, enabled: true, thresholdPx: Number(e.target.value) || 96 })}
                  className="h-8"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-xs">Scrollable columns</Label>
                <span className="text-[10px] text-muted-foreground">Constrain column height + auto-scroll while dragging</span>
              </div>
              <Switch
                checked={!!config.scrollableColumns}
                onCheckedChange={(v) => update("scrollableColumns", v)}
              />
            </div>
            {config.scrollableColumns && (
              <div className="space-y-1.5">
                <Label className="text-xs">Column max height (px)</Label>
                <Input
                  type="number"
                  min={200}
                  value={config.columnMaxHeightPx ?? 520}
                  onChange={(e) => update("columnMaxHeightPx", Number(e.target.value) || 520)}
                  className="h-8"
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Card click dialog */}
        <AccordionItem value="dialog">
          <AccordionTrigger className="text-sm">Card click dialog</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <p className="text-[11px] text-muted-foreground">
              Customize the dialog that opens when a card is clicked. Use{" "}
              <code className="rounded bg-muted px-1">{`{{row.field}}`}</code> tokens — e.g.{" "}
              <code className="rounded bg-muted px-1">{`{{row.title}}`}</code>.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Dialog title (optional)</Label>
              <Input
                value={config.cardClickAction?.dialogTitle ?? ""}
                onChange={(e) =>
                  update("cardClickAction", {
                    ...config.cardClickAction,
                    dialogTitle: e.target.value,
                  })
                }
                placeholder="{{row.title}}"
                className="h-8 font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dialog description (optional)</Label>
              <Input
                value={config.cardClickAction?.dialogDescription ?? ""}
                onChange={(e) =>
                  update("cardClickAction", {
                    ...config.cardClickAction,
                    dialogDescription: e.target.value,
                  })
                }
                placeholder="{{row.assignee}} · {{row.estimate}}"
                className="h-8 font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Width class</Label>
              <Input
                value={config.cardClickAction?.dialogWidthClass ?? ""}
                onChange={(e) =>
                  update("cardClickAction", {
                    ...config.cardClickAction,
                    dialogWidthClass: e.target.value,
                  })
                }
                placeholder="max-w-2xl"
                className="h-8 font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">HTML/Tailwind template</Label>
              <Textarea
                value={config.cardClickAction?.dialogTemplate ?? ""}
                onChange={(e) =>
                  update("cardClickAction", {
                    ...config.cardClickAction,
                    dialogTemplate: e.target.value,
                  })
                }
                placeholder={`<div class="space-y-2">\n  <p>{{row.title}}</p>\n</div>`}
                className="min-h-[120px] font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sandboxed JS (after mount)</Label>
              <Textarea
                value={config.cardClickAction?.dialogJs ?? ""}
                onChange={(e) =>
                  update("cardClickAction", {
                    ...config.cardClickAction,
                    dialogJs: e.target.value,
                  })
                }
                placeholder={`// Has access to: row, value, el\nel.querySelector('button')?.addEventListener('click', () => alert(row.title));`}
                className="min-h-[100px] font-mono text-xs"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* onCardChange hook */}
        <AccordionItem value="onchange">
          <AccordionTrigger className="text-sm">On card change (DnD)</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Sandboxed snippet executed every time DnD moves a card. Receives{" "}
              <code className="rounded bg-muted px-1">row</code> = {"{ card, fromColumnId, toColumnId, fromIndex, toIndex, cards }"}.
              Use it to call your backend.
            </p>
            <Textarea
              value={config.onCardChangeJs ?? ""}
              onChange={(e) => update("onCardChangeJs", e.target.value)}
              placeholder={`// Persist the change to your backend\nfetch('/api/cards/' + row.card.id, {\n  method: 'PATCH',\n  headers: { 'content-type': 'application/json' },\n  body: JSON.stringify({ columnId: row.toColumnId, position: row.toIndex }),\n});`}
              className="min-h-[140px] font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}