export const data = {
  variants: [
    {
      id: "default",
      label: "Default Arrow",
      tooltip: "Tooltip with default arrow",
      style: "default",
    },
    {
      id: "primary",
      label: "Primary Arrow",
      tooltip: "Primary colored arrow",
      style: "primary",
    },
    {
      id: "custom",
      label: "Custom Arrow",
      tooltip: "Custom dark tooltip",
      style: "custom",
    },
    {
      id: "accent",
      label: "Accent Arrow",
      tooltip: "Accent colored arrow",
      style: "accent",
    },
  ] as const,
} as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Settings } from "lucide-react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function TooltipArrowsExample() {
  return (
    <div className="flex flex-wrap gap-6 justify-center py-8">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">{data.variants[0].label}</Button>
        </TooltipTrigger>
        <TooltipContent showArrow>
          <p>{data.variants[0].tooltip}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">{data.variants[1].label}</Button>
        </TooltipTrigger>
        <TooltipContent
          className="bg-primary text-primary-foreground border-primary"
          showArrow
          arrowClassName="fill-primary"
        >
          <p>{data.variants[1].tooltip}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">{data.variants[2].label}</Button>
        </TooltipTrigger>
        <TooltipContent className="bg-foreground text-background border-foreground">
          <p>{data.variants[2].tooltip}</p>
          <TooltipArrow className="fill-foreground" />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">{data.variants[3].label}</Button>
        </TooltipTrigger>
        <TooltipContent
          className="bg-accent text-accent-foreground border-accent"
          showArrow
          arrowClassName="fill-accent"
        >
          <p>{data.variants[3].tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
`;

