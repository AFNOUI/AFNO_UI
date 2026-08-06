"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Copy, Check, Upload, Download, AlertCircle } from "lucide-react";

import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { BuilderJsonTrigger } from "./BuilderJsonTrigger";

/**
 * An extra, builder-specific tab alongside Export / Import.
 *
 * Exists for payload slices a builder wants to move independently of the full
 * config — the table builder's sample rows being the motivating case: you often
 * want to swap 1,000 real rows in without touching column definitions.
 */
export interface BuilderJsonExtraTab {
  /** Stable tab value. */
  id: string;
  /** Tab label, e.g. "Sample data". */
  label: string;
  icon?: LucideIcon;
  /** Explains what this slice is and what a valid paste looks like. */
  description?: string;
  /** Pretty-printed JSON of this slice's current value. */
  json: string;
  /**
   * Apply pasted text for this slice alone. Same contract as `onImport`:
   * error string keeps the dialog open, `null` closes it.
   * Omit to make the tab export-only (read-only textarea).
   */
  onImport?: (text: string) => string | null;
  placeholder?: string;
}

export interface BuilderJsonDialogProps {
  /** Dialog heading, e.g. "Form JSON". */
  title: string;
  /** One-line explanation of what the payload contains. */
  description?: string;
  /** Pretty-printed JSON of the complete builder state. */
  exportJson: string;
  /**
   * Parse + apply the pasted text.
   *
   * Return `null` on success (the dialog closes and clears), or an error string
   * to keep the dialog open with the message shown inline. Validation stays
   * with each builder — only the chrome is shared.
   */
  onImport: (text: string) => string | null;
  /** Builder-specific extra tabs, appended after Export / Import. */
  extraTabs?: BuilderJsonExtraTab[];
  /** Override the trigger label (default "JSON"). */
  triggerLabel?: string;
}

/** Inline validation message shared by every panel. */
function JsonError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-(--radius) border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive"
    >
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Copy-to-clipboard button with a transient confirmation state. */
function CopyJsonButton({ json, label }: { json: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard?.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "JSON copied", description: `${label} copied to clipboard` });
  }, [json, label]);

  return (
    <Button size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy JSON"}
    </Button>
  );
}

/**
 * One extra tab's panel. Seeded with the slice's current JSON so the user can
 * edit in place rather than pasting from nothing; re-seeds whenever the
 * underlying value changes (a template load, an import).
 */
function ExtraTabPanel({ tab, onDone }: { tab: BuilderJsonExtraTab; onDone: () => void }) {
  const [text, setText] = React.useState(tab.json);
  const [error, setError] = React.useState<string | null>(null);
  const readOnly = !tab.onImport;

  React.useEffect(() => {
    setText(tab.json);
    setError(null);
  }, [tab.json]);

  const handleApply = React.useCallback(() => {
    const message = tab.onImport?.(text) ?? null;
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    onDone();
  }, [onDone, tab, text]);

  return (
    <div className="mt-3 space-y-2">
      {tab.description ? (
        <p className="text-xs text-muted-foreground">{tab.description}</p>
      ) : null}
      <Textarea
        value={text}
        readOnly={readOnly}
        placeholder={tab.placeholder}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        className="h-[300px] font-mono text-xs"
      />
      {error ? <JsonError message={error} /> : null}
      <div className="flex items-center justify-end gap-2">
        <CopyJsonButton json={tab.json} label={tab.label} />
        {readOnly ? null : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleApply}
            disabled={!text.trim()}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Apply {tab.label.toLowerCase()}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * CONTROL — the one import/export dialog every builder uses.
 *
 * Before this, the four builders each had their own JSON UI: a two-panel
 * layout, a tabbed layout, and a mode-switched textarea — plus a separate
 * read-only "JSON Configuration" panel buried in their Preview tabs. Same job,
 * four looks. This is the single design; builders supply only the payload, the
 * parser, and (optionally) extra slices via `extraTabs`.
 */
export function BuilderJsonDialog({
  title,
  description = "Import or export this builder's full configuration.",
  exportJson,
  onImport,
  extraTabs,
  triggerLabel,
}: BuilderJsonDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleApply = React.useCallback(() => {
    const message = onImport(text);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setText("");
    setOpen(false);
  }, [onImport, text]);

  // Stale errors should not survive a reopen.
  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setError(null);
  }, []);

  const closeDialog = React.useCallback(() => setOpen(false), []);
  const tabCount = 2 + (extraTabs?.length ?? 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <BuilderJsonTrigger>{triggerLabel ?? "JSON"}</BuilderJsonTrigger>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export">
          <TabsList
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}
          >
            <TabsTrigger value="export" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Import
            </TabsTrigger>
            {extraTabs?.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
                {tab.icon ? <tab.icon className="h-3.5 w-3.5" /> : null}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="export" className="mt-3 space-y-2">
            <Textarea
              readOnly
              value={exportJson}
              className="h-[320px] font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Paste this back under Import to restore the exact same build.
              </p>
              <CopyJsonButton json={exportJson} label={title} />
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-3 space-y-2">
            <Textarea
              value={text}
              placeholder="Paste a previously-exported JSON…"
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              className="h-[320px] font-mono text-xs"
            />
            {error ? <JsonError message={error} /> : null}
            <div className="flex justify-end">
              <Button size="sm" onClick={handleApply} disabled={!text.trim()} className="gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Import
              </Button>
            </div>
          </TabsContent>

          {extraTabs?.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <ExtraTabPanel tab={tab} onDone={closeDialog} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
