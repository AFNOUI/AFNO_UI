"use client";

import { useState, useCallback } from "react";
import { Upload, FileJson, Copy, Check } from "lucide-react";

import { toast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FormConfig, FormFieldConfig } from "@/forms/types/types";

/**
 * Walk every field in `config` and rename any duplicate `name` so React keys
 * stay unique in the canvas. Pasted/imported configs frequently contain
 * duplicates from copy-pasting, which previously caused selection / deletion
 * to misfire on the duplicates.
 */
function ensureUniqueFieldNames(config: FormConfig): {
  config: FormConfig;
  renamedCount: number;
} {
  const used = new Set<string>();
  let renamed = 0;
  const sections = config.sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => {
      const original = field.name;
      let candidate = original;
      let suffix = 2;
      while (used.has(candidate)) {
        candidate = `${original}_${suffix++}`;
      }
      used.add(candidate);
      if (candidate === original) return field;
      renamed += 1;
      return { ...field, name: candidate } as FormFieldConfig;
    }),
  }));
  return { config: { ...config, sections }, renamedCount: renamed };
}

interface JsonImportDialogProps {
  currentConfig: FormConfig;
  onImport: (config: FormConfig) => void;
}

export function JsonImportDialog({ onImport, currentConfig }: JsonImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = useCallback(() => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonText);

      // Validate basic structure
      if (!parsed.id || !parsed.sections || !Array.isArray(parsed.sections)) {
        setError("Invalid form config: must have 'id' and 'sections' array.");
        return;
      }

      for (const section of parsed.sections) {
        if (!section.id || !Array.isArray(section.fields)) {
          setError("Each section must have 'id' and 'fields' array.");
          return;
        }
        for (const field of section.fields) {
          if (!field.type || !field.name) {
            setError("Each field must have 'type' and 'name'.");
            return;
          }
        }
      }

      const { config: deduped, renamedCount } = ensureUniqueFieldNames(parsed as FormConfig);
      onImport(deduped);
      setOpen(false);
      setJsonText("");
      toast({
        title: "Form imported",
        description:
          renamedCount > 0
            ? `Loaded "${deduped.title || deduped.id}" — auto-renamed ${renamedCount} duplicate field name${renamedCount === 1 ? "" : "s"}.`
            : `Loaded "${deduped.title || deduped.id}"`,
      });
    } catch (e) {
      setError("Invalid JSON: " + (e instanceof Error ? e.message : "Parse error"));
    }
  }, [jsonText, onImport]);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(currentConfig, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "JSON copied", description: "Form config JSON copied to clipboard" });
  }, [currentConfig]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <FileJson className="h-4 w-4" />
          JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import / Export Form JSON</DialogTitle>
          <DialogDescription>
            Paste a form config JSON to load it, or export the current form to share.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export current */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div>
              <p className="text-sm font-medium">Export current form</p>
              <p className="text-xs text-muted-foreground">Copy JSON to clipboard for sharing</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy JSON"}
            </Button>
          </div>

          {/* Import */}
          <div className="space-y-2">
            <Label className="text-sm">Import JSON</Label>
            <Textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError(null);
              }}
              placeholder={`{
  "id": "my-form",
  "title": "My Form",
  "sections": [{
    "id": "section-1",
    "fields": [
      { "type": "text", "name": "name", "label": "Name" }
    ]
  }]
}`}
              className="min-h-[200px] font-mono text-xs"
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={!jsonText.trim()} className="gap-1.5">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
