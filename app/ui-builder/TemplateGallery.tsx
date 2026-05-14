"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";

import { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import { uiTemplates } from "@/ui-builder/data/uiBuilderTemplates";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TemplateGalleryProps {
  onLoadTemplate: (nodes: BuilderNode[]) => void;
}

export function TemplateGallery({ onLoadTemplate }: TemplateGalleryProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (templateId: string) => {
    const template = uiTemplates.find(t => t.id === templateId);
    if (template) {
      onLoadTemplate(template.nodes());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
          <LayoutTemplate className="h-3.5 w-3.5" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Page Templates</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-2 max-h-[60vh] overflow-auto">
          {uiTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className="text-start p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-accent/30 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{template.name}</h4>
                <Badge variant="outline" className="text-[10px]">{template.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
