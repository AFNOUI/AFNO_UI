export const data = [
  { side: "top" as const, align: "start" as const, label: "Top Start", text: "Top start aligned" },
  { side: "top" as const, align: undefined, label: "Top", text: "Top center aligned" },
  { side: "top" as const, align: "end" as const, label: "Top End", text: "Top end aligned" },
  { side: "left" as const, align: undefined, label: "Left", text: "Left aligned" },
  { side: "right" as const, align: undefined, label: "Right", text: "Right aligned" },
  { side: "bottom" as const, align: "start" as const, label: "Bottom Start", text: "Bottom start" },
  { side: "bottom" as const, align: undefined, label: "Bottom", text: "Bottom center" },
  { side: "bottom" as const, align: "end" as const, label: "Bottom End", text: "Bottom end" },
];

export const code = `"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const positions: { side: Side; align?: Align; label: string; text: string }[] = ${JSON.stringify(data, null, 2)};

export default function PopoverPositionsExample() {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-8">
      {positions.map((p) => (
        <Popover key={p.label}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">{p.label}</Button>
          </PopoverTrigger>
          <PopoverContent
            side={p.side}
            align={p.align}
            className="w-40"
          >
            <p className="text-sm">{p.text}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
`;
