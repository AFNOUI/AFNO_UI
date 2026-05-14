import type { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import type { ImportTracker } from "./imports";
import { esc } from "./esc";
import { resolveResponsiveClasses } from "./responsiveClasses";

/**
 * Form control renderers (label + control pairs). Every control shares the
 * same `space-y-2` wrapper pattern so downstream snapshots stay uniform.
 */

export function renderInput(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const p = node.props;
    imports.shadcn.add("Input");
    imports.shadcn.add("Label");
    return `${pad}<div className="space-y-2">\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}  <Input type="${p.inputType || "text"}" placeholder="${p.placeholder || ""}" />\n${pad}</div>`;
}

export function renderTextarea(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const p = node.props;
    imports.shadcn.add("Textarea");
    imports.shadcn.add("Label");
    return `${pad}<div className="space-y-2">\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}  <Textarea placeholder="${p.placeholder || ""}" rows={${p.rows || 4}} />\n${pad}</div>`;
}

export function renderSelect(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const p = node.props;
    imports.shadcn.add("Select");
    imports.shadcn.add("SelectContent");
    imports.shadcn.add("SelectItem");
    imports.shadcn.add("SelectTrigger");
    imports.shadcn.add("SelectValue");
    imports.shadcn.add("Label");
    const opts = ((p.options as string) || "").split("\n").filter(Boolean);
    return `${pad}<div className="space-y-2">\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}  <Select>\n${pad}    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>\n${pad}    <SelectContent>\n${opts.map((o) => `${pad}      <SelectItem value="${o}">${esc(o)}</SelectItem>`).join("\n")}\n${pad}    </SelectContent>\n${pad}  </Select>\n${pad}</div>`;
}

export function renderCheckbox(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const p = node.props;
    imports.shadcn.add("Checkbox");
    imports.shadcn.add("Label");
    return `${pad}<div className="flex items-center gap-2">\n${pad}  <Checkbox />\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}</div>`;
}

export function renderSwitchControl(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const p = node.props;
    imports.shadcn.add("Switch");
    imports.shadcn.add("Label");
    return `${pad}<div className="flex items-center gap-3">\n${pad}  <Switch />\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}</div>`;
}

export function renderRadioGroup(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const p = node.props;
    imports.shadcn.add("RadioGroup");
    imports.shadcn.add("RadioGroupItem");
    imports.shadcn.add("Label");
    const opts = ((p.options as string) || "").split("\n").filter(Boolean);
    return `${pad}<div className="space-y-2">\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}  <RadioGroup>\n${opts.map((o, i) => `${pad}    <div className="flex items-center gap-2">\n${pad}      <RadioGroupItem value="${o}" id="option-${i}" />\n${pad}      <Label htmlFor="option-${i}">${esc(o)}</Label>\n${pad}    </div>`).join("\n")}\n${pad}  </RadioGroup>\n${pad}</div>`;
}

export function renderDatePicker(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const p = node.props;
    imports.shadcn.add("Input");
    imports.shadcn.add("Label");
    return `${pad}<div className="space-y-2">\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}  <Input type="date" />\n${pad}</div>`;
}

export function renderFileUpload(node: BuilderNode, imports: ImportTracker, indent: number): string {
    const pad = " ".repeat(indent);
    const p = node.props;
    imports.shadcn.add("Label");
    return `${pad}<div className="space-y-2">\n${pad}  <Label>${esc(p.label as string)}</Label>\n${pad}  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">\n${pad}    <p className="text-sm text-muted-foreground">${esc(p.description as string)}</p>\n${pad}  </div>\n${pad}</div>`;
}

/** `resolveResponsiveClasses` isn't used by any form renderer today (they don't
 * attach `className` from breakpoints), but is re-exported here in case a
 * future form control wants to opt in. */
export { resolveResponsiveClasses };
