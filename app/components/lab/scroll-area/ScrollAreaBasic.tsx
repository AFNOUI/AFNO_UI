"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/scroll-area/scroll-area-basic";

export function ScrollAreaBasic() {
  return (
    <ComponentInstall
      category="scroll-area"
      variant="scroll-area-basic"
      title="Basic Scroll Area"
      code={`const data = ${JSON.stringify({ tags: data.tags.slice(0, 3) }, null, 2)};\n\n<ScrollArea>...`}
      fullCode={code}
    >
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {data.tags.map((tag) => (
            <div key={tag}>
              <div className="text-sm">{tag}</div>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </ComponentInstall>
  );
}
