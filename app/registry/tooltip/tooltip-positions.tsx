export const data = {
  positions: [
    { id: "top", label: "Top", side: "top", text: "Top tooltip" },
    { id: "bottom", label: "Bottom", side: "bottom", text: "Bottom tooltip" },
    { id: "left", label: "Left", side: "left", text: "Left tooltip" },
    { id: "right", label: "Right", side: "right", text: "Right tooltip" },
  ] as const,
} as const;

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

type Side = "top" | "right" | "bottom" | "left";

const data: { positions: { id: string; label: string; side: Side; text: string }[] } = ${dataStr};

export default function TooltipPositionsExample() {
  return (
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
  );
}
`;

