import { useState, useCallback } from "react";
import { Upload, FileJson, Copy, Check } from "lucide-react";

import { toast } from "@/hooks/use-toast";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogHeader, DialogTitle, DialogTrigger,
  Dialog, DialogContent, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

import { TableBuilderConfig, TableRow } from "@/table-builder/data/tableBuilderTemplates";

interface TableJsonImportDialogProps {
  currentSampleData: TableRow[];
  currentConfig: TableBuilderConfig;
  onImport: (config: TableBuilderConfig, sampleData?: TableRow[]) => void;
}

interface ImportPayload {
  sampleData?: TableRow[];
  config: TableBuilderConfig;
}

function isImportPayload(value: unknown): value is ImportPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as { config?: unknown };
  if (!v.config || typeof v.config !== "object") return false;
  const cfg = v.config as { columns?: unknown };
  return Array.isArray(cfg.columns);
}

function isBareConfig(value: unknown): value is TableBuilderConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as { columns?: unknown };
  return Array.isArray(v.columns);
}

export function TableJsonImportDialog({
  onImport, currentConfig, currentSampleData,
}: TableJsonImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImport = useCallback(() => {
    setError(null);
    try {
      const parsed: unknown = JSON.parse(jsonText);

      const validateConfig = (cfg: TableBuilderConfig): string | null => {
        const ids = new Set<string>();
        for (const col of cfg.columns) {
          if (!col || typeof col !== "object" || !("id" in col) || !("key" in col) || !("type" in col)) {
            return "Each column must have 'id', 'key', and 'type'.";
          }
          if (typeof col.id !== "string" || !col.id.trim()) return "Every column 'id' must be a non-empty string.";
          if (ids.has(col.id)) return `Duplicate column id "${col.id}". Column ids must be unique.`;
          ids.add(col.id);
          if (col.pinned !== undefined && col.pinned !== null && col.pinned !== "start" && col.pinned !== "end") {
            return `Column "${col.id}" has invalid pinned value. Use "start", "end", or null.`;
          }
        }

        if (cfg.columnGroups !== undefined) {
          if (!Array.isArray(cfg.columnGroups)) return "'columnGroups' must be an array when provided.";
          const groupIds = new Set<string>();
          const seenColRefs = new Set<string>();
          for (const grp of cfg.columnGroups) {
            if (!grp || typeof grp !== "object") return "Each column group must be an object.";
            if (typeof grp.id !== "string" || !grp.id.trim()) return "Each column group needs a non-empty 'id'.";
            if (groupIds.has(grp.id)) return `Duplicate columnGroups id "${grp.id}".`;
            groupIds.add(grp.id);
            if (typeof grp.label !== "string") return `Column group "${grp.id}" needs a 'label' string.`;
            if (!Array.isArray(grp.columns)) return `Column group "${grp.id}" must have a 'columns' string array.`;
            for (const cid of grp.columns) {
              if (typeof cid !== "string") return `Column group "${grp.id}" has a non-string column reference.`;
              if (!ids.has(cid)) return `Column group "${grp.id}" references unknown column id "${cid}".`;
              if (seenColRefs.has(cid)) return `Column id "${cid}" appears in more than one columnGroups entry.`;
              seenColRefs.add(cid);
            }
          }
        }
        return null;
      };

      if (isImportPayload(parsed)) {
        const err = validateConfig(parsed.config);
        if (err) { setError(err); return; }
        onImport(parsed.config, parsed.sampleData);
        setOpen(false);
        setJsonText("");
        toast({ title: "Table imported", description: `Loaded "${parsed.config.title || "Untitled"}"` });
        return;
      }

      if (isBareConfig(parsed)) {
        const err = validateConfig(parsed);
        if (err) { setError(err); return; }
        onImport(parsed);
        setOpen(false);
        setJsonText("");
        toast({ title: "Table imported", description: `Loaded "${parsed.title || "Untitled"}"` });
        return;
      }

      setError("Invalid JSON: expected { config, sampleData? } or a TableBuilderConfig object.");
    } catch (e) {
      setError("Invalid JSON: " + (e instanceof Error ? e.message : "Parse error"));
    }
  }, [jsonText, onImport]);

  const handleExport = useCallback(() => {
    const json = JSON.stringify({ config: currentConfig, sampleData: currentSampleData }, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "JSON copied", description: "Table config + sample data copied to clipboard" });
  }, [currentConfig, currentSampleData]);

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
          <DialogTitle>Import / Export Table JSON</DialogTitle>
          <DialogDescription>
            Paste a table config JSON to load it, or export the current table to share.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div>
              <p className="text-sm font-medium">Export current table</p>
              <p className="text-xs text-muted-foreground">Includes config + sample data</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy JSON"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Import JSON</Label>
            <Textarea
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setError(null); }}
              placeholder={`{\n  "config": {\n    "title": "My Table",\n    "columns": [{ "id": "c1", "key": "name", "label": "Name", "type": "text", "sortable": true, "filterable": true, "visible": true }]\n  },\n  "sampleData": [{ "id": "1", "name": "Alice" }]\n}`}
              className="min-h-[200px] font-mono text-xs"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
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
