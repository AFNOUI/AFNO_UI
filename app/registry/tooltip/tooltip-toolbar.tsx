export const data = {
  groups: [
    {
      id: "main",
      items: [
        { id: "add", icon: "plus", label: "Add new item" },
        { id: "copy", icon: "copy", label: "Copy to clipboard" },
        { id: "mail", icon: "mail", label: "Send email" },
      ],
    },
    {
      id: "social",
      items: [
        { id: "comment", icon: "comment", label: "Comment" },
        { id: "share", icon: "share", label: "Share" },
        { id: "bookmark", icon: "bookmark", label: "Bookmark" },
      ],
    },
  ] as const,
  delete: {
    label: "Delete item",
  },
} as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import {
  Plus,
  Copy,
  Mail,
  MessageCircle,
  Share2,
  Bookmark,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function TooltipToolbarExample() {
  return (
    <div className="flex items-center gap-1 p-2 border rounded-lg bg-muted/30">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" showArrow>
          <p>{data.groups[0].items[0].label}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost">
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" showArrow>
          <p>{data.groups[0].items[1].label}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost">
            <Mail className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" showArrow>
          <p>{data.groups[0].items[2].label}</p>
        </TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" showArrow>
          <p>{data.groups[1].items[0].label}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost">
            <Share2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" showArrow>
          <p>{data.groups[1].items[1].label}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost">
            <Bookmark className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" showArrow>
          <p>{data.groups[1].items[2].label}</p>
        </TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          showArrow
          className="bg-destructive text-destructive-foreground border-destructive"
          arrowClassName="fill-destructive"
        >
          <p>{data.delete.label}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
`;

