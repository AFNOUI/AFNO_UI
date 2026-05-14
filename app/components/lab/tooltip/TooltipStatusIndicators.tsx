"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/tooltip/tooltip-status-indicators";

export function TooltipStatusIndicators() {
  return (
    <ComponentInstall
      category="tooltip"
      variant="tooltip-status-indicators"
      title="Status Indicator Tooltips"
      code={code}
      fullCode={code}
    >
      <div className="flex items-center gap-6 p-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--progress-success))] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--progress-success))]"></span>
              </span>
              <span className="text-sm">{data.statuses[0].label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent showArrow>
            <p className="font-medium">{data.statuses[0].title}</p>
            <p className="text-xs text-muted-foreground">
              {data.statuses[0].message}
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--progress-warning))]"></span>
              <span className="text-sm">{data.statuses[1].label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            showArrow
            className="bg-[hsl(var(--progress-warning))] text-foreground border-[hsl(var(--progress-warning))]"
            arrowClassName="fill-[hsl(var(--progress-warning))]"
          >
            <p className="font-medium">{data.statuses[1].title}</p>
            <p className="text-xs">{data.statuses[1].message}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="h-3 w-3 rounded-full bg-destructive"></span>
              <span className="text-sm">{data.statuses[2].label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            showArrow
            className="bg-destructive text-destructive-foreground border-destructive"
            arrowClassName="fill-destructive"
          >
            <p className="font-medium">{data.statuses[2].title}</p>
            <p className="text-xs">{data.statuses[2].message}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </ComponentInstall>
  );
}

