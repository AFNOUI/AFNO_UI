"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/sheet/sheet-sides";

export function SheetSides() {
  return (
    <ComponentInstall
      category="sheet"
      variant="sheet-sides"
      title="Side Variations"
      code={`const sides = ${JSON.stringify(data, null, 2)};\n\n<SheetContent side={s.side}>...`}
      fullCode={code}
    >
      <div className="flex flex-wrap gap-4">
        {data.map((s) => (
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
    </ComponentInstall>
  );
}
