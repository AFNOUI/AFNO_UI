export const data = [
  { side: "left" as const, label: "Left", title: "Left Sheet", description: "This sheet opens from the left side." },
  { side: "right" as const, label: "Right", title: "Right Sheet", description: "This sheet opens from the right side." },
  { side: "top" as const, label: "Top", title: "Top Sheet", description: "This sheet opens from the top." },
  { side: "bottom" as const, label: "Bottom", title: "Bottom Sheet", description: "This sheet opens from the bottom." },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type SheetSide = "left" | "right" | "top" | "bottom";

const sides: { side: SheetSide; label: string; title: string; description: string }[] = ${dataStr};

export default function SheetSidesExample() {
  return (
    <div className="flex flex-wrap gap-4">
      {sides.map((s) => (
        <Sheet key={s.side}>
          <SheetTrigger asChild>
            <Button variant="outline">{s.label}</Button>
          </SheetTrigger>
          <SheetContent side={s.side}>
            <SheetHeader>
              <SheetTitle>{s.title}</SheetTitle>
              <SheetDescription>{s.description}</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
`;
