"use client";

/**
 * Import/export the full kanban config + cards as JSON. Mirrors the table
 * builder dialog for consistency.
 */
import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { KanbanBuilderConfig, KanbanCardData } from "@/kanban-builder/data/kanbanBuilderTemplates";

interface Props {
  config: KanbanBuilderConfig;
  cards: KanbanCardData[];
  onImport: (config: KanbanBuilderConfig, cards: KanbanCardData[]) => void;
}

export function KanbanJsonImportDialog({ config, cards, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const exportJson = JSON.stringify({ config, cards }, null, 2);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed.config || !Array.isArray(parsed.cards)) {
        throw new Error("JSON must have { config, cards } shape");
      }
      onImport(parsed.config, parsed.cards);
      setOpen(false);
      toast({ title: "Imported", description: "Kanban config loaded." });
    } catch (e) {
      toast({
        title: "Import failed",
        description: e instanceof Error ? e.message : "Invalid JSON",
        variant: "destructive",
      });
    }
  };

  const copyExport = async () => {
    await navigator.clipboard.writeText(exportJson);
    toast({ title: "Copied", description: "Config copied to clipboard" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Import / Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kanban JSON</DialogTitle>
          <DialogDescription>Import or export the full board configuration.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="export">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</TabsTrigger>
            <TabsTrigger value="import"><Upload className="h-3.5 w-3.5 mr-1.5" /> Import</TabsTrigger>
          </TabsList>
          <TabsContent value="export" className="space-y-2">
            <Textarea readOnly value={exportJson} className="font-mono text-xs h-[320px]" />
            <Button onClick={copyExport} size="sm" className="gap-1.5">
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </TabsContent>
          <TabsContent value="import" className="space-y-2">
            <Textarea
              placeholder='{"config": {...}, "cards": [...]}'
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="font-mono text-xs h-[320px]"
            />
            <DialogFooter>
              <Button onClick={handleImport} size="sm">Import</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}