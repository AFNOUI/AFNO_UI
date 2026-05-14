"use client";

import { Settings, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/tooltip/tooltip-basic";

export function TooltipBasic() {
  return (
    <ComponentInstall
      category="tooltip"
      variant="tooltip-basic"
      title="Basic Tooltips"
      code={code}
      fullCode={code}
    >
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
              size={data.variants[2].buttonSize}
              variant={data.variants[2].buttonVariant}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{data.variants[2].tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </ComponentInstall>
  );
}

