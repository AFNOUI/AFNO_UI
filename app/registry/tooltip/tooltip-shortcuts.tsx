export const data = {
  shortcuts: [
    { id: "copy", label: "Copy", combo: "⌘C" },
    { id: "settings", label: "Open Settings", combo: "⌘," },
    { id: "help", label: "Help Center", combo: "?" },
  ] as const,
} as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Settings, HelpCircle, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function TooltipShortcutsExample() {
  return (
    <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="outline">
            <Copy className="h-4 w-4 me-2" /> Copy
          </Button>
        </TooltipTrigger>
        <TooltipContent showArrow>
          <div className="flex items-center gap-2">
            <span>{data.shortcuts[0].label}</span>
            <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">
              {data.shortcuts[0].combo}
            </kbd>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 me-2" /> Settings
          </Button>
        </TooltipTrigger>
        <TooltipContent showArrow>
          <div className="flex items-center gap-2">
            <span>{data.shortcuts[1].label}</span>
            <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">
              {data.shortcuts[1].combo}
            </kbd>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="outline">
            <HelpCircle className="h-4 w-4 me-2" /> Help
          </Button>
        </TooltipTrigger>
        <TooltipContent showArrow>
          <div className="flex items-center gap-2">
            <span>{data.shortcuts[2].label}</span>
            <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">
              {data.shortcuts[2].combo}
            </kbd>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
`;

