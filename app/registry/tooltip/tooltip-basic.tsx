export const data = {
  variants: [
    {
      id: "primary-button",
      buttonLabel: "Hover me",
      buttonVariant: "outline",
      tooltipText: "Add to library",
      icon: null,
    },
    {
      id: "settings-icon",
      buttonLabel: "",
      buttonVariant: "secondary",
      buttonSize: "icon",
      tooltipText: "Settings",
      icon: "settings",
    },
    {
      id: "help-icon",
      buttonLabel: "",
      buttonVariant: "ghost",
      buttonSize: "icon",
      tooltipText: "Need help?",
      icon: "help",
    },
  ] as const,
} as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Settings, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const data = ${dataStr} as const;

export default function TooltipBasicExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={data.variants[0].buttonVariant}>
            {data.variants[0].buttonLabel}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{data.variants[0].tooltipText}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={data.variants[1].buttonVariant}
            size={data.variants[1].buttonSize}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{data.variants[1].tooltipText}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={data.variants[2].buttonVariant}
            size={data.variants[2].buttonSize}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{data.variants[2].tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
`;

