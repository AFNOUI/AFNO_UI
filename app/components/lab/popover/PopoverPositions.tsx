"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/popover/popover-positions";

export function PopoverPositions() {
  return (
    <ComponentInstall
      category="popover"
      variant="popover-positions"
      title="Popover Positions"
      code={`const positions = ${JSON.stringify(data, null, 2)};\n\n<PopoverContent side={p.side} align={p.align} />`}
      fullCode={code}
    >
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-8">
        {[...data.slice(0, 4), null, ...data.slice(4)].map((p) =>
          p ? (
            <Popover key={p.label}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">{p.label}</Button>
              </PopoverTrigger>
              <PopoverContent side={p.side} align={p.align} className="w-40">
                <p className="text-sm">{p.text}</p>
              </PopoverContent>
            </Popover>
          ) : (
            <div key="center" />
          )
        )}
      </div>
    </ComponentInstall>
  );
}
