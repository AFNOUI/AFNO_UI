export const data = {
  variants: [
    { id: "default", label: "Default", text: "Default tooltip style", kind: "default" },
    { id: "dark", label: "Dark Theme", text: "Dark tooltip", kind: "dark" },
    { id: "primary", label: "Primary Color", text: "Primary styled", kind: "primary" },
  ] as const,
} as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const data = ${dataStr};

export default function TooltipStyledExample() {
  return (
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
  );
}
`;

