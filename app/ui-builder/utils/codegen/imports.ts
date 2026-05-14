/**
 * Import bookkeeping for the UI-builder code generator.
 *
 * Each node renderer registers symbols it uses on the shared `ImportTracker`;
 * `buildImports` then emits the correct `import { … } from "@/…"` lines.
 *
 * Groupings are intentional:
 *   - `shadcn`      : `@/components/ui/<file>` — multiple symbols per file are
 *                     collapsed into a single import line.
 *   - `charts`      : shared `@/components/ui/charts` barrel — always one line.
 *   - `lucide`      : reserved for future use by renderers that want icons; no
 *                     renderer emits Lucide imports today, but the field is
 *                     kept so we don't break the shape consumed by tests.
 */

export interface ImportTracker {
    shadcn: Set<string>;
    lucide: Set<string>;
    charts: Set<string>;
}

export function createImportTracker(): ImportTracker {
    return { shadcn: new Set(), lucide: new Set(), charts: new Set() };
}

/**
 * Map every shadcn component symbol to the file it re-exports from. This is
 * purely for CLI-shadcn-style alias resolution: each file maps to
 * `@/components/ui/<file>`.
 */
const SHADCN_COMPONENT_FILE_MAP: Record<string, string> = {
    Button: "button", Card: "card", CardContent: "card", CardHeader: "card", CardTitle: "card",
    Badge: "badge", Separator: "separator", Input: "input", Textarea: "textarea",
    Label: "label", Checkbox: "checkbox", Switch: "switch", Progress: "progress",
    Select: "select", SelectContent: "select", SelectItem: "select",
    SelectTrigger: "select", SelectValue: "select",
    RadioGroup: "radio-group", RadioGroupItem: "radio-group",
    Avatar: "avatar", AvatarImage: "avatar", AvatarFallback: "avatar",
    Alert: "alert", AlertTitle: "alert", AlertDescription: "alert",
    Tabs: "tabs", TabsList: "tabs", TabsTrigger: "tabs", TabsContent: "tabs",
    Accordion: "accordion", AccordionItem: "accordion", AccordionTrigger: "accordion", AccordionContent: "accordion",
    Table: "table", TableHeader: "table", TableRow: "table", TableHead: "table", TableBody: "table", TableCell: "table",
};

export function buildImports(imports: ImportTracker): string {
    const lines: string[] = [];
    const shadcnGroups: Record<string, string[]> = {};
    for (const comp of imports.shadcn) {
        const file = SHADCN_COMPONENT_FILE_MAP[comp] || comp.toLowerCase();
        if (!shadcnGroups[file]) shadcnGroups[file] = [];
        shadcnGroups[file].push(comp);
    }
    for (const [file, comps] of Object.entries(shadcnGroups)) {
        lines.push(`import { ${comps.join(", ")} } from "@/components/ui/${file}";`);
    }
    if (imports.charts.size > 0) {
        lines.push(`import { ${Array.from(imports.charts).sort().join(", ")} } from "@/components/ui/charts";`);
    }
    return lines.join("\n");
}
