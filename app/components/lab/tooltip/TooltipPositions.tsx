"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/tooltip/tooltip-positions";

export function TooltipPositions() {
  return (
    <ComponentInstall
      category="tooltip"
      variant="tooltip-positions"
      title="Tooltip Positions"
      code={code}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4 justify-center py-8">
        {data.positions.map((pos) => (
          <Tooltip key={pos.id}>
            <TooltipTrigger asChild>
              <Button variant="outline">{pos.label}</Button>
            </TooltipTrigger>
            <TooltipContent side={pos.side} showArrow>
              <p>{pos.text}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </ComponentInstall>
  );
}

