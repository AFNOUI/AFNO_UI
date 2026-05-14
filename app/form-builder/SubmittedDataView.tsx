"use client";

import { useState } from "react";
import { CheckCircle2, X, Clipboard, Check } from "lucide-react";

import { toast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubmittedDataViewProps {
  data: Record<string, unknown> | null;
  onClear: () => void;
}

export function SubmittedDataView({ data, onClear }: SubmittedDataViewProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Submitted data copied to clipboard" });
  };

  return (
    <Card className="border-green-500/30 bg-green-500/5 mt-4">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <CardTitle className="text-sm text-green-700 dark:text-green-400">Form Submitted Successfully</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleCopy}>
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Clipboard className="h-3 w-3 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-1.5">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-xs">
                <Badge variant="outline" className="shrink-0 font-mono text-[10px] mt-0.5">
                  {key}
                </Badge>
                <span className="text-muted-foreground break-all">
                  {value === null || value === undefined
                    ? <span className="italic">null</span>
                    : typeof value === "boolean"
                    ? <Badge variant={value ? "default" : "secondary"} className="text-[10px] h-4">{String(value)}</Badge>
                    : typeof value === "object"
                    ? <code className="bg-muted px-1 rounded text-[10px]">{JSON.stringify(value)}</code>
                    : String(value) || <span className="italic text-muted-foreground/50">empty</span>
                  }
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
