"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/tooltip/tooltip-styled";

export function TooltipStyled() {
  return (
    <ComponentInstall
      category="tooltip"
      variant="tooltip-styled"
      title="Styled Tooltips"
      code={code}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4 justify-center py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">{data.variants[0].label}</Button>
          </TooltipTrigger>
          <TooltipContent showArrow>
            <p>{data.variants[0].text}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">{data.variants[1].label}</Button>
          </TooltipTrigger>
          <TooltipContent
            className="bg-foreground text-background border-foreground"
            showArrow
            arrowClassName="fill-foreground"
          >
            <p>{data.variants[1].text}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">{data.variants[2].label}</Button>
          </TooltipTrigger>
          <TooltipContent
            className="bg-primary text-primary-foreground border-primary"
            showArrow
            arrowClassName="fill-primary"
          >
            <p>{data.variants[2].text}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </ComponentInstall>
  );
}

